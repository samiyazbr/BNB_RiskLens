/**
 * BNB RiskLens - Content Script
 * Bridges communication between extension popup and the page's MetaMask provider
 */

// Aggressive logging to debug issues
const DEBUG = true;
function debugLog(message) {
  if (DEBUG) console.log(`[RiskLens ContentScript] ${message}`);
}

debugLog('Content script is loading on: ' + window.location.href);
debugLog('window.ethereum type: ' + typeof window.ethereum);
debugLog('window.ethereum value: ' + (window.ethereum ? 'EXISTS' : 'NOT FOUND'));

// Detect and cache MetaMask provider availability
let hasMetaMask = false;

function checkForMetaMask() {
  const before = hasMetaMask;
  if (typeof window !== 'undefined' && window.ethereum) {
    hasMetaMask = true;
    if (!before) debugLog('✅ MetaMask DETECTED on page');
  } else {
    hasMetaMask = false;
    if (before) debugLog('❌ MetaMask LOST on page');
  }
  return hasMetaMask;
}

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
  try {
    debugLog(`handleEthereumRequest called with method: ${payload?.method}`);
    
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
  } catch (error) {
    debugLog(`❌ MetaMask error: ${error.message}`);
    sendResponse({ 
      error: error.message || 'Unknown error occurred' 
    });
  }
}

debugLog('Content script setup complete');

