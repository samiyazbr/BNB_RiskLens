// Content script for BNB RiskLens extension

console.log('BNB RiskLens content script loaded');

// Inject the injected.js script into the page context
const script = document.createElement('script');
script.src = chrome.runtime.getURL('injected.js');
script.onload = function() {
  this.remove();
};
(document.head || document.documentElement).appendChild(script);

// Listen for messages from the injected script
window.addEventListener('message', (event) => {
  // Only accept messages from the same window
  if (event.source !== window) return;
  
  if (event.data.type && event.data.type === 'FROM_INJECTED') {
    console.log('Content script received message from injected script:', event.data);
    
    // Forward to background script if needed
    chrome.runtime.sendMessage(event.data);
  }
});

// Send messages to the injected script
function sendToInjected(data) {
  window.postMessage({ type: 'FROM_CONTENT', ...data }, '*');
}
