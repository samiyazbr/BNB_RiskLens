/**
 * BNB RiskLens - Background Service Worker (Enhanced)
 * Properly handles Ethereum requests from popup by proxying through content script
 */

// Track connected tabs and their ethereum state
const ethereumCache = {
  accounts: [],
  chainId: null
};

// Extension initialization
chrome.runtime.onInstalled.addListener(() => {
  console.log('🔶 BNB RiskLens Extension Installed');
  
  // Set default configuration
  chrome.storage.local.set({
    riskFeedEnabled: true,
    autoPublish: false,
    lastUpdate: Date.now()
  });
});

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  const senderName = sender.url?.split('/').pop() || (sender.url ? 'extension' : 'unknown');
  console.log(`[RiskLens BG] 📨 Message from ${senderName} (${sender.url}), action: ${request.action}`);
  
  switch (request.action) {
    case 'checkMetaMask':
      // Check if MetaMask is available via any tab
      checkMetaMaskAvailable().then(available => {
        sendResponse({ hasMetaMask: available });
      });
      return true;

    case 'ethereumRequest':
      handleEthereumRequest(request.payload, sendResponse);
      return true; // Keep channel open for async response
    
    case 'evaluateToken':
      // Handle automatic token evaluation from content script
      handleTokenEvaluation(request.tokenAddress, sendResponse);
      return true;
    
    case 'evaluateRisk':
      handleRiskEvaluation(request.data, sendResponse);
      return true;
    
    case 'publishToRiskFeed':
      handlePublishToRiskFeed(request.data, sendResponse);
      return true;
    
    case 'getStoredRisks':
      handleGetStoredRisks(sendResponse);
      return true;
    
    case 'updateEthereumCache':
      // Update cache from content script
      ethereumCache.accounts = request.data?.accounts || [];
      ethereumCache.chainId = request.data?.chainId || null;
      sendResponse({ success: true });
      return false;

    default:
      sendResponse({ error: 'Unknown action' });
  }
});

/**
 * Check if MetaMask is available on any active tab
 */
async function checkMetaMaskAvailable() {
  try {
    const tabs = await chrome.tabs.query({ active: true });
    if (tabs.length === 0) {
      console.log('[RiskLens BG] ⚠️  No active tabs found');
      return false;
    }

    const tab = tabs[0];
    console.log(`[RiskLens BG] 📄 Checking MetaMask on tab ${tab.id}: ${tab.url}`);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('[RiskLens BG] ⚠️  checkMetaMaskPresent timeout after 5s');
        resolve(false);
      }, 5000);

      console.log(`[RiskLens BG] 📤 Sending checkMetaMaskPresent to tab ${tab.id}`);
      chrome.tabs.sendMessage(
        tab.id,
        { action: 'checkMetaMaskPresent' },
        (response) => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            console.warn(`[RiskLens BG] ⚠️  sendMessage error: ${chrome.runtime.lastError?.message}`);
            resolve(false);
          } else {
            console.log(`[RiskLens BG] ✅ checkMetaMaskPresent response: hasMetaMask=${response?.hasMetaMask}`);
            resolve(response?.hasMetaMask || false);
          }
        }
      );
    });
  } catch (error) {
    console.error('❌ Error checking MetaMask:', error);
    return false;
  }
}

/**
 * Handle Ethereum requests from the popup
 * Routes through content script to get actual MetaMask provider
 */
async function handleEthereumRequest(payload, sendResponse) {
  try {
    const { method, params = [] } = payload;
    console.log(`[RiskLens BG] 🔗 Routing Ethereum request: ${method}`);

    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (!tab) {
      console.warn('[RiskLens BG] ⚠️  No active tab found');
      sendResponse({ error: 'No active tab found. Please visit any website first.' });
      return;
    }

    console.log(`[RiskLens BG] 📄 Target tab: ID=${tab.id}, URL=${tab.url}`);

    // Check if the tab URL is allowed for content scripts
    if (!isValidTabForMessaging(tab.url)) {
      console.warn('⚠️  Tab URL not allowed for messaging:', tab.url);
      sendResponse({ error: 'Please visit a regular website (not a blank tab, extension page, or chrome:// page).' });
      return;
    }

    console.log('✅ Tab URL is valid');

    // Ensure content script is injected into the target tab before messaging.
    async function ensureContentScriptInjected(tabId) {
      try {
        console.log('[RiskLens BG] 🔧 Ensuring content script is injected into tab', tabId);
        await new Promise((resolve, reject) => {
          chrome.scripting.executeScript(
            { target: { tabId }, files: ['content-script.js'] },
            (results) => {
              if (chrome.runtime.lastError) {
                console.warn('[RiskLens BG] ⚠️ scripting.executeScript failed:', chrome.runtime.lastError.message);
                // don't reject; resolve so caller can continue and handle sendMessage errors
                resolve(false);
                return;
              }
              resolve(true);
            }
          );
        });
        // short delay to allow listeners to register
        await new Promise((r) => setTimeout(r, 150));
        return true;
      } catch (e) {
        console.warn('[RiskLens BG] ⚠️ ensureContentScriptInjected error:', e?.message || e);
        return false;
      }
    }

    // Attempt to detect a page-level provider (window.ethereum) by executing
    // a short script in the page's main world. This is more reliable than
    // asking the content script when the page hasn't loaded or a provider
    // is injected late by another extension.
    async function detectProviderInPage(tabId) {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: () => {
            try {
              return typeof window !== 'undefined' && !!window.ethereum;
            } catch (e) {
              return false;
            }
          },
          world: 'MAIN'
        });

        if (!results || results.length === 0) return false;
        return !!results[0].result;
      } catch (e) {
        console.warn('[RiskLens BG] ⚠️ detectProviderInPage failed:', e?.message || e);
        return false;
      }
    }

    const providerPresent = await detectProviderInPage(tab.id);
    console.log(`[RiskLens BG] 🔎 Provider present in page? ${providerPresent}`);

    if (!providerPresent) {
      // Inject an inline page-level bridge into the MAIN world. Using an
      // inline `func` avoids CSP blocking external extension script URLs.
      async function injectBridgeInline(tabId) {
        try {
          await chrome.scripting.executeScript({
            target: { tabId },
            world: 'MAIN',
            func: function () {
              try {
                if (window.__risklens_eip6963_injected) return;
                window.__risklens_eip6963_injected = true;

                console.log('[RiskLens Injected] inline bridge initializing');

                function announceProvider(provider) {
                  try {
                    console.log('[RiskLens Injected] announcing provider via eip6963:announceProvider');
                    const evt = new CustomEvent('eip6963:announceProvider', { detail: { provider } });
                    window.dispatchEvent(evt);
                    try { window.postMessage({ direction: 'risklens-provider-announced' }, '*'); } catch (e) {}
                  } catch (e) {}
                }

                if (typeof window.ethereum !== 'undefined' && window.ethereum) {
                  console.log('[RiskLens Injected] window.ethereum exists, announcing');
                  announceProvider(window.ethereum);
                }

                window.addEventListener('eip6963:requestProvider', () => {
                  if (typeof window.ethereum !== 'undefined' && window.ethereum) {
                    announceProvider(window.ethereum);
                  }
                });

                window.addEventListener('message', async (ev) => {
                  try {
                    if (!ev.data || ev.source !== window) return;
                    const msg = ev.data;
                    if (msg && msg.direction === 'risklens-request') {
                      const id = msg.id;
                      const payload = msg.payload;
                      if (!payload || !payload.method) {
                        window.postMessage({ direction: 'risklens-response', id, error: 'Invalid payload' }, '*');
                        return;
                      }

                      if (typeof window.ethereum === 'undefined' || !window.ethereum) {
                        window.postMessage({ direction: 'risklens-response', id, error: 'No provider available in page' }, '*');
                        return;
                      }

                      try {
                        const result = await window.ethereum.request(payload);
                        window.postMessage({ direction: 'risklens-response', id, result }, '*');
                      } catch (err) {
                        window.postMessage({ direction: 'risklens-response', id, error: String(err) }, '*');
                      }
                    }
                  } catch (e) {}
                });

                console.log('[RiskLens Injected] inline bridge initialized');
              } catch (e) {
                // swallow
              }
            }
          });
          // small delay for initialization
          await new Promise((r) => setTimeout(r, 250));
          return true;
        } catch (e) {
          console.error('[RiskLens BG] ❌ injectBridgeInline failed:', e?.message || e);
          return false;
        }
      }

      try {
        console.log('[RiskLens BG] 📥 Injecting inline page-level provider bridge');
        const injected = await injectBridgeInline(tab.id);
        const recheck = await detectProviderInPage(tab.id);
        console.log(`[RiskLens BG] 🔎 Provider present after inline injection? ${recheck}`);
        if (!recheck) {
          console.warn('[RiskLens BG] ⚠️ Provider still not present after inline injection');
        }
      } catch (injErr) {
        console.error('[RiskLens BG] ❌ Exception while injecting page helper inline:', injErr?.message || injErr);
      }
    }

    // Send request to content script with promise-based callback
    try {
      // Try to proactively inject content script so sendMessage has a listener
      await ensureContentScriptInjected(tab.id);

      // Perform a short handshake to ensure the content script's message
      // listener is active and ready. This avoids races where sendMessage
      // reports Receiving end does not exist intermittently.
      async function performHandshake(tabId, timeout = 1500) {
        return new Promise((resolve) => {
          let done = false;
          try {
            // Ask content script to not only indicate readiness but also whether
            // the page bridge has announced a provider (providerAnnounced).
            chrome.tabs.sendMessage(tabId, { action: 'handshakeWaitProvider' }, (resp) => {
              if (done) return;
              done = true;
              if (chrome.runtime.lastError) {
                console.warn('[RiskLens BG] ⚠️ Handshake failed:', chrome.runtime.lastError.message);
                return resolve({ ready: false, providerAnnounced: false });
              }
              resolve({ ready: !!resp?.ready, providerAnnounced: !!resp?.providerAnnounced });
            });
          } catch (e) {
            return resolve({ ready: false, providerAnnounced: false });
          }
          setTimeout(() => { if (!done) { done = true; resolve({ ready: false, providerAnnounced: false }); } }, timeout);
        });
      }

      const handshakeResult = await performHandshake(tab.id, 1500);
      console.log(`[RiskLens BG] 🔁 Handshake with content script: ready=${handshakeResult.ready}, providerAnnounced=${handshakeResult.providerAnnounced}`);

        const timeoutMs = (method === 'eth_requestAccounts') ? 30000 : 10000;

        const response = await new Promise((resolve, reject) => {
          let settled = false;
          const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            console.warn(`⚠️  Tab messaging timeout after ${timeoutMs / 1000}s`);
            reject(new Error(`Request timeout after ${timeoutMs / 1000}s: ${method}`));
          }, timeoutMs);

        console.log('📤 Sending message to tab:', tab.id);
          chrome.tabs.sendMessage(
            tab.id,
            { 
              action: 'ethereumRequest', 
              payload: { method, params, timeoutMs }
            },
          (response) => {
            if (settled) {
              console.warn('[RiskLens BG] ⚠️ Late callback received after timeout — ignoring');
              return;
            }
            settled = true;
            clearTimeout(timeoutId);
            console.log('📥 Got callback from sendMessage');

            if (chrome.runtime.lastError) {
              const errorMsg = chrome.runtime.lastError?.message || '';
              console.error('❌ chrome.runtime.lastError:', errorMsg);

              // Check if it's a "receiving end does not exist" error
              if (errorMsg.includes('Receiving end does not exist')) {
                // Attempt to inject the content script dynamically and retry once
                console.warn('[RiskLens BG] ⚠️  Receiving end does not exist — attempting to inject content script and retry');
                try {
                  chrome.scripting.executeScript(
                    { target: { tabId: tab.id }, files: ['content-script.js'] },
                    (injectionResults) => {
                      if (chrome.runtime.lastError) {
                        console.error('[RiskLens BG] ❌ Injection failed:', chrome.runtime.lastError.message);
                        return reject(new Error('Content script not loaded and injection failed. Please reload the page.'));
                      }

                      // Small delay to allow the injected script to initialize
                      setTimeout(() => {
                        chrome.tabs.sendMessage(
                          tab.id,
                          { action: 'ethereumRequest', payload: { method, params } },
                          (retryResponse) => {
                            if (chrome.runtime.lastError) {
                              console.error('[RiskLens BG] ❌ Retry sendMessage failed:', chrome.runtime.lastError.message);
                              return reject(new Error('Content script not loaded on this tab after injection. Try reloading the page.'));
                            }
                            return resolve(retryResponse);
                          }
                        );
                      }, 400);
                    }
                  );
                } catch (injError) {
                  console.error('[RiskLens BG] ❌ Exception while injecting content script:', injError);
                  return reject(new Error('Failed to inject content script. Reload the page and try again.'));
                }
              } else {
                return reject(new Error(errorMsg || 'Failed to communicate with page'));
              }
            } else {
              console.log('✅ Got valid response:', typeof response);
              return resolve(response);
            }
          }
        );
      });
      
      console.log('✅ Got response from content script:', method);
      sendResponse(response);
    } catch (error) {
      console.error('❌ Content script error:', error.message);
      sendResponse({ error: error.message });
    }
  } catch (error) {
    console.error('❌ Ethereum request error:', error.message);
    sendResponse({ error: error.message });
  }
}

/**
 * Check if a tab URL is valid for messaging
 */
function isValidTabForMessaging(url) {
  if (!url) return false;
  
  // Reject extension pages, chrome pages, etc.
  const invalidPrefixes = [
    'chrome://',
    'chrome-extension://',
    'about:',
    'data:',
    'file://'
  ];
  
  for (const prefix of invalidPrefixes) {
    if (url.startsWith(prefix)) {
      return false;
    }
  }
  
  // Only allow http and https
  return url.startsWith('http://') || url.startsWith('https://');
}

/**
 * Handle risk evaluation request
 */
async function handleRiskEvaluation(data, sendResponse) {
  try {
    console.log('🔍 Evaluating risk for:', data.tokenAddress);
    
    sendResponse({ 
      success: true, 
      message: 'Evaluation started' 
    });
  } catch (error) {
    console.error('❌ Risk evaluation error:', error);
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Handle publishing to RiskFeed contract
 */
async function handlePublishToRiskFeed(data, sendResponse) {
  try {
    console.log('📤 Publishing to RiskFeed:', data);
    
    // Store the publish request
    chrome.storage.local.get(['publishHistory'], (result) => {
      const history = result.publishHistory || [];
      history.push({
        tokenAddress: data.tokenAddress,
        score: data.score,
        timestamp: Date.now(),
        txHash: data.txHash || null
      });
      
      chrome.storage.local.set({ publishHistory: history });
    });
    
    sendResponse({ 
      success: true, 
      message: 'Published to RiskFeed' 
    });
  } catch (error) {
    console.error('❌ Publish error:', error);
    sendResponse({ 
      success: false, 
      error: error.message 
    });
  }
}

/**
 * Get stored risk assessments
 */
function handleGetStoredRisks(sendResponse) {
  chrome.storage.local.get(['publishHistory'], (result) => {
    sendResponse({ 
      success: true, 
      data: result.publishHistory || [] 
    });
  });
}

/**
 * Handle token evaluation request from automatic approval interception
 */
async function handleTokenEvaluation(tokenAddress, sendResponse) {
  console.log('🔍 Evaluating token for approval:', tokenAddress);
  
  try {
    // Import rule engine
    const ruleEngineModule = await import(chrome.runtime.getURL('src/ruleEngine.js'));
    const { evaluateRules } = ruleEngineModule;
    
    // Import score calculator
    const scoreModule = await import(chrome.runtime.getURL('src/score.js'));
    const { calculateRiskScore } = scoreModule;
    
    // Import data fetcher
    const dataModule = await import(chrome.runtime.getURL('src/utils/fetchOnChainData.js'));
    const { fetchOnChainData } = dataModule;
    
    // Fetch on-chain data
    const onChainData = await fetchOnChainData(tokenAddress);
    
    if (!onChainData || onChainData.error) {
      sendResponse({ 
        error: 'Failed to fetch token data',
        level: 'MEDIUM'
      });
      return;
    }
    
    // Evaluate rules
    const ruleResults = await evaluateRules(tokenAddress, onChainData);
    
    // Calculate risk score
    const riskAssessment = calculateRiskScore(ruleResults);
    
    // Get triggered rule descriptions
    const triggeredRules = ruleResults
      .filter(r => r.triggered)
      .map(r => r.description || r.ruleName);
    
    sendResponse({
      level: riskAssessment.level,
      score: riskAssessment.score,
      triggeredRules: triggeredRules,
      tokenAddress: tokenAddress
    });
    
  } catch (error) {
    console.error('❌ Error evaluating token:', error);
    sendResponse({ 
      error: error.message,
      level: 'MEDIUM'
    });
  }
}

// Keep service worker alive
chrome.alarms.create("keepAlive", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('⏰ Service worker heartbeat');
  }
});
