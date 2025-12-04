// Background script for BNB RiskLens extension

console.log('BNB RiskLens background script loaded');

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received in background script:', request);
  
  // Handle different message types here
  if (request.type === 'example') {
    sendResponse({ success: true });
  }
  
  return true; // Keep the message channel open for async responses
});
