// Injected script for BNB RiskLens extension
// This script runs in the page context and has access to page variables

console.log('BNB RiskLens injected script loaded');

// Listen for messages from the content script
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type === 'FROM_CONTENT') {
    console.log('Injected script received message from content script:', event.data);
  }
});

// Send messages to the content script
function sendToContent(data) {
  window.postMessage({ type: 'FROM_INJECTED', ...data }, '*');
}

// Your page context code here
