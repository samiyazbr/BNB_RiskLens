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
  console.log('📨 Message received from', sender.url?.split('/').pop() || 'unknown', ':', request.action);
  
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
      console.log('⚠️  No active tabs found');
      return false;
    }

    const tab = tabs[0];
    console.log('📄 Checking MetaMask on tab:', tab.url);

    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        console.warn('⚠️  checkMetaMaskPresent timeout');
        resolve(false);
      }, 5000);

      chrome.tabs.sendMessage(
        tab.id,
        { action: 'checkMetaMaskPresent' },
        (response) => {
          clearTimeout(timeoutId);
          if (chrome.runtime.lastError) {
            console.warn('⚠️  sendMessage error:', chrome.runtime.lastError?.message);
            resolve(false);
          } else {
            console.log('✅ checkMetaMaskPresent response:', response?.hasMetaMask);
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
    console.log('🔗 Routing Ethereum request:', method);

    // Get the active tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tab = tabs[0];
    
    if (!tab) {
      console.warn('⚠️  No active tab found');
      sendResponse({ error: 'No active tab found. Please visit any website first.' });
      return;
    }

    console.log('📄 Target tab URL:', tab.url);
    console.log('📄 Tab ID:', tab.id);

    // Check if the tab URL is allowed for content scripts
    if (!isValidTabForMessaging(tab.url)) {
      console.warn('⚠️  Tab URL not allowed for messaging:', tab.url);
      sendResponse({ error: 'Please visit a regular website (not a blank tab, extension page, or chrome:// page).' });
      return;
    }

    console.log('✅ Tab URL is valid');

    // Send request to content script with promise-based callback
    try {
      const response = await new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          console.warn('⚠️  Tab messaging timeout after 10s');
          reject(new Error(`Request timeout after 10s: ${method}`));
        }, 10000);

        console.log('📤 Sending message to tab:', tab.id);
        chrome.tabs.sendMessage(
          tab.id,
          { 
            action: 'ethereumRequest', 
            payload: { method, params }
          },
          (response) => {
            clearTimeout(timeoutId);
            console.log('📥 Got callback from sendMessage');
            
            if (chrome.runtime.lastError) {
              const errorMsg = chrome.runtime.lastError?.message || '';
              console.error('❌ chrome.runtime.lastError:', errorMsg);
              
              // Check if it's a "receiving end does not exist" error
              if (errorMsg.includes('Receiving end does not exist')) {
                reject(new Error('Content script not loaded on this tab. Try reloading the page.'));
              } else {
                reject(new Error(errorMsg || 'Failed to communicate with page'));
              }
            } else {
              console.log('✅ Got valid response:', typeof response);
              resolve(response);
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
