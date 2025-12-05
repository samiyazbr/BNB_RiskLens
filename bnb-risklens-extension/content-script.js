/**
 * BNB RiskLens - Content Script
 * Proactive token monitoring - analyzes tokens BEFORE user clicks approve
 */

const DEBUG = true;
function debugLog(message) {
  if (DEBUG) console.log(`[RiskLens ContentScript] ${message}`);
}

debugLog('🔶 BNB RiskLens: Proactive monitoring mode');

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

// Initialize
injectProactiveMonitor();
debugLog('✅ Content script initialized in proactive mode');
