/**
 * BNB RiskLens - Background Service Worker
 * Handles background tasks and message passing
 */

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
  console.log('📨 Message received:', request.action);
  
  switch (request.action) {
    case 'evaluateRisk':
      handleRiskEvaluation(request.data, sendResponse);
      return true; // Keep channel open for async response
    
    case 'publishToRiskFeed':
      handlePublishToRiskFeed(request.data, sendResponse);
      return true;
    
    case 'getStoredRisks':
      handleGetStoredRisks(sendResponse);
      return true;
    
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

/**
 * Handle risk evaluation request
 */
async function handleRiskEvaluation(data, sendResponse) {
  try {
    console.log('🔍 Evaluating risk for:', data.tokenAddress);
    
    // This will be handled by the popup's rule engine
    // Background worker just facilitates messaging
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

chrome.alarms.create("keepAlive", { periodInMinutes: 1 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'keepAlive') {
    console.log('⏰ Service worker heartbeat');
  }
});
