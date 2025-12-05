/**
 * BNB RiskLens - Content Script
 * Proactive token monitoring - analyzes tokens BEFORE user clicks approve
 */

const DEBUG = true;
function debugLog(message) {
  if (DEBUG) console.log(`[RiskLens ContentScript] ${message}`);
}

<<<<<<< HEAD
debugLog('🔶 BNB RiskLens: Proactive monitoring mode');
=======
debugLog('Content script is loading on: ' + window.location.href);
debugLog('window.ethereum type: ' + typeof window.ethereum);
debugLog('window.ethereum value: ' + (window.ethereum ? 'EXISTS' : 'NOT FOUND'));
>>>>>>> 48553c873558e32fe0b67030413725756a2c0aad

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

<<<<<<< HEAD
// Listen for proactive evaluation requests from the page
window.addEventListener('risklens-proactive-request', async (event) => {
  debugLog('📥 Received proactive evaluation request');
  
  const { eventId, tokenAddress } = event.detail;
  
=======
// Check immediately
debugLog('Initial MetaMask check...');
debugLog('window.ethereum type at check: ' + typeof window.ethereum);
checkForMetaMask();
debugLog(`Initial result: hasMetaMask = ${hasMetaMask}`);

// Check on load
window.addEventListener('load', () => {
  debugLog('Page loaded, rechecking MetaMask...');
  checkForMetaMask();
  debugLog(`After load: hasMetaMask = ${hasMetaMask}`);
});

// Also check periodically
setInterval(() => {
  if (!hasMetaMask) {
    checkForMetaMask();
  }
}, 500);

// Listen for messages from background script
debugLog('Setting up message listener...');
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugLog(`📨 Message received: action=${request.action}`);

  if (request.action === 'checkMetaMaskPresent') {
    debugLog(`Responding to checkMetaMaskPresent: hasMetaMask=${hasMetaMask}, window.ethereum=${typeof window.ethereum}`);
    sendResponse({ hasMetaMask });
    return false;
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
 * Wait for MetaMask to inject `window.ethereum` up to a timeout.
 */
async function waitForMetaMask(maxWaitTime = 5000, interval = 100) {
  const start = Date.now();
  let attempts = 0;
  while (Date.now() - start < maxWaitTime) {
    attempts++;
    if (typeof window !== 'undefined' && window.ethereum) {
      debugLog(`✅ MetaMask found after ${attempts} attempts (${Date.now() - start}ms)`);
      return true;
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  debugLog(`❌ MetaMask NOT found after ${attempts} attempts and ${maxWaitTime}ms timeout`);
  return false;
}

/**
 * Handle Ethereum RPC requests using the page's MetaMask provider
 */
async function handleEthereumRequest(payload, sendResponse) {
>>>>>>> 48553c873558e32fe0b67030413725756a2c0aad
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
    
<<<<<<< HEAD
=======
    if (typeof window === 'undefined') {
      debugLog('❌ Window is undefined');
      sendResponse({ error: 'Window is undefined' });
      return;
    }

    // If MetaMask isn't available yet, wait a short while for it to inject.
    // Many wallets (MetaMask) inject after the content script runs; poll briefly.
    if (!window.ethereum) {
      debugLog('window.ethereum not found, waiting up to 5s for injection...');
      const found = await waitForMetaMask(5000);
      if (!found) {
        debugLog('❌ window.ethereum did not appear within timeout');
        sendResponse({ error: 'MetaMask not available on the current page. Please visit a DeFi site or reload.' });
        return;
      }
      debugLog('✅ window.ethereum appeared, proceeding with request');
    }

    const { method, params = [] } = payload;
    debugLog(`🔗 Calling window.ethereum.request: ${method}`);

    // Call the actual MetaMask provider
    const result = await window.ethereum.request({
      method,
      params
    });

    debugLog(`✅ MetaMask response for ${method}: ` + JSON.stringify(result).substring(0, 100));
    sendResponse(result);
>>>>>>> 48553c873558e32fe0b67030413725756a2c0aad
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

// Initialize
injectProactiveMonitor();
debugLog('✅ Content script initialized in proactive mode');
