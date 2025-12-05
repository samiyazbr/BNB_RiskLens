/**
 * BNB RiskLens - Content Script
 * Proactive token monitoring - analyzes tokens BEFORE user clicks approve
 */

// Prevent double-injection
if (window.__risklens_content_script_loaded) {
  try { console.log('[RiskLens ContentScript] Already loaded, skipping duplicate injection'); } catch (e) {}
} else {
  window.__risklens_content_script_loaded = true;

  const DEBUG = true;
  function debugLog(message) {
    if (DEBUG) console.log(`[RiskLens ContentScript] ${message}`);
  }

  debugLog('Content script is loading on: ' + window.location.href);
  debugLog('🔶 BNB RiskLens: Proactive monitoring mode');

  // Track MetaMask presence
  let hasMetaMask = false;

  // Check for MetaMask
  function checkForMetaMask() {
    if (typeof window.ethereum !== 'undefined' && window.ethereum) {
      hasMetaMask = true;
      debugLog('✅ MetaMask detected: window.ethereum exists');
      return true;
    }
    debugLog('⚠️  MetaMask NOT detected yet');
    return false;
  }

  // Inject proactive monitor script
  function injectProactiveMonitor() {
    debugLog('Injecting proactive monitor...');
    
    const monitorScript = document.createElement('script');
    monitorScript.src = chrome.runtime.getURL('proactive-monitor.js');
    monitorScript.onload = function() {
      this.remove();
      debugLog('✅ Proactive monitor loaded');
    };
    (document.head || document.documentElement).appendChild(monitorScript);
  }

  // Inject EIP-6963 page script for MetaMask detection
  function injectPageScript(resourcePath = 'injected-eip6963.js') {
    try {
      const url = chrome.runtime.getURL(resourcePath);
      if (document.querySelector(`script[data-risklens-injected="1"]`)) {
        debugLog('Page script already injected, skipping');
        return;
      }
      const script = document.createElement('script');
      script.src = url;
      script.type = 'text/javascript';
      script.async = false;
      script.setAttribute('data-risklens-injected', '1');
      const target = document.head || document.documentElement;
      if (target) {
        target.appendChild(script);
        debugLog(`Injected page script: ${url}`);
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          const t = document.head || document.documentElement;
          if (t) {
            t.appendChild(script);
            debugLog(`Injected page script after DOMContentLoaded: ${url}`);
          }
        });
      }
    } catch (e) {
      debugLog(`Failed to inject page script: ${e?.message || e}`);
    }
  }

  // PostMessage bridge: send RPC request to page and await response
  function sendToPageRequest(payload, timeout = 10000) {
    return new Promise((resolve, reject) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
      let to = null;
      const listener = (ev) => {
        try {
          if (!ev.data || ev.source !== window) return;
          const msg = ev.data;
          if (msg.direction === 'risklens-response' && msg.id === id) {
            window.removeEventListener('message', listener);
            if (to) clearTimeout(to);
            if (msg.error) return reject(new Error(msg.error));
            return resolve(msg.result);
          }
        } catch (e) {
          // ignore
        }
      };

      window.addEventListener('message', listener);

      try {
        window.postMessage({ direction: 'risklens-request', id, payload }, '*');
      } catch (e) {
        window.removeEventListener('message', listener);
        return reject(e);
      }

      to = setTimeout(() => {
        window.removeEventListener('message', listener);
        reject(new Error('Timeout waiting for page provider response'));
      }, timeout);
    });
  }

  // Listen for EIP-6963 provider announcements
  window.addEventListener('eip6963:announceProvider', (ev) => {
    try {
      debugLog('[eip6963] Provider announced from page');
      if (ev?.detail?.provider) {
        hasMetaMask = true;
        debugLog('✅ Provider announced via EIP-6963');
      }
    } catch (e) {
      // ignore
    }
  });

  // Initial check
  debugLog('Initial MetaMask check...');
  checkForMetaMask();
  debugLog(`Initial result: hasMetaMask = ${hasMetaMask}`);

  // Inject scripts
  injectPageScript('injected-eip6963.js');
  injectProactiveMonitor();

  // Check on load
  window.addEventListener('load', () => {
    debugLog('Page loaded, rechecking MetaMask...');
    checkForMetaMask();
    debugLog(`After load: hasMetaMask = ${hasMetaMask}`);
  });

  // Periodic check
  setInterval(() => {
    if (!hasMetaMask) {
      checkForMetaMask();
    }
  }, 500);

  // Listen for proactive evaluation requests from the page
  window.addEventListener('risklens-proactive-request', async (event) => {
    debugLog('📥 Received proactive evaluation request');
    
    const { eventId, tokenAddress } = event.detail;
    
    try {
      // Request evaluation from background script
      const response = await chrome.runtime.sendMessage({
        action: 'evaluateToken',
        tokenAddress: tokenAddress
      });
      
      debugLog('✅ Got risk evaluation: ' + response.risk?.level);
      
      // Send response back to page
      window.dispatchEvent(new CustomEvent('risklens-proactive-response', {
        detail: {
          eventId: eventId,
          risk: response.risk
        }
      }));
      
    } catch (error) {
      debugLog('❌ Error evaluating token: ' + error.message);
      
      window.dispatchEvent(new CustomEvent('risklens-proactive-response', {
        detail: {
          eventId: eventId,
          risk: { level: 'UNKNOWN', error: error.message }
        }
      }));
    }
  });

  // Listen for messages from background script
  debugLog('Setting up message listener...');
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    debugLog(`📨 Message received: action=${request.action}`);

    if (request.action === 'checkMetaMaskPresent') {
      debugLog(`Responding to checkMetaMaskPresent: hasMetaMask=${hasMetaMask}, window.ethereum=${typeof window.ethereum}`);
      sendResponse({ hasMetaMask });
      return false;
    }

    if (request.action === 'handshake') {
      debugLog('Received handshake request from background; replying ready');
      sendResponse({ ready: true });
      return false;
    }

    if (request.action === 'handshakeWaitProvider') {
      debugLog('Received handshakeWaitProvider from background');
      // If provider already announced, reply immediately
      if (hasMetaMask) {
        sendResponse({ ready: true, providerAnnounced: true });
        return false;
      }

      // Wait for provider-announced postMessage from page
      let done = false;
      const listener = (ev) => {
        try {
          if (!ev.data || ev.source !== window) return;
          if (ev.data && ev.data.direction === 'risklens-provider-announced') {
            if (done) return;
            done = true;
            window.removeEventListener('message', listener);
            hasMetaMask = true;
            sendResponse({ ready: true, providerAnnounced: true });
          }
        } catch (e) {}
      };

      window.addEventListener('message', listener);

      setTimeout(() => {
        if (done) return;
        done = true;
        window.removeEventListener('message', listener);
        sendResponse({ ready: true, providerAnnounced: false });
      }, 1200);

      return true; // async response
    }

    if (request.action === 'ethereumRequest') {
      debugLog(`Handling ethereumRequest: method=${request.payload?.method}`);
      handleEthereumRequest(request.payload, sendResponse);
      return true; // Keep channel open for async response
    }

    debugLog(`Unknown action: ${request.action}`);
    return false;
  });

  /**
   * Handle Ethereum RPC requests using the page's MetaMask provider
   */
  async function handleEthereumRequest(payload, sendResponse) {
    try {
      if (typeof window === 'undefined') {
        debugLog('❌ Window is undefined');
        sendResponse({ error: 'Window is undefined' });
        return;
      }

      const { method, params = [] } = payload;
      debugLog(`🔗 Handling RPC: ${method}`);

      // If provider is accessible in the content-script world, use it
      if (typeof window.ethereum !== 'undefined' && window.ethereum) {
        debugLog('Using window.ethereum in content script world');
        try {
          const result = await window.ethereum.request({ method, params });
          debugLog(`✅ MetaMask response for ${method}: ` + JSON.stringify(result).substring(0, 100));
          sendResponse(result);
          return;
        } catch (err) {
          debugLog(`Error from content-script ethereum.request: ${err?.message || err}`);
          sendResponse({ error: err?.message || String(err) });
          return;
        }
      }

      // Otherwise, use EIP-6963 flow via the injected page script
      try {
        debugLog('No direct provider; attempting page bridge via postMessage');

        // Ask the page to request providers
        try {
          window.dispatchEvent(new Event('eip6963:requestProvider'));
          debugLog('Dispatched eip6963:requestProvider event');
        } catch (e) {
          debugLog('Failed to dispatch eip6963:requestProvider: ' + e?.message);
        }

        // Use timeout hint from background if provided
        const timeoutHint = payload?.timeoutMs || 10000;
        const result = await sendToPageRequest({ method, params }, timeoutHint);
        debugLog(`✅ Page bridge response for ${method}: ` + JSON.stringify(result).substring(0, 100));
        sendResponse(result);
        return;
      } catch (err) {
        debugLog(`❌ Page bridge error: ${err?.message || err}`);
        sendResponse({ error: err?.message || 'MetaMask provider not available via page bridge' });
        return;
      }
    } catch (error) {
      debugLog(`❌ Error in handleEthereumRequest: ${error?.message || error}`);
      sendResponse({ error: error?.message || String(error) });
    }
  }

  debugLog('✅ Content script initialized in proactive mode');
}
