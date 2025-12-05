/**
 * RiskLens Extension Diagnostics
 * 
 * How to use:
 * 1. Open DevTools (F12) on any website
 * 2. Go to Console tab
 * 3. Copy and paste this entire script
 * 4. Press Enter
 * 5. Read the output
 */

console.clear();
console.log('%c🔶 RiskLens Extension Diagnostics', 'color: #ff8c00; font-size: 16px; font-weight: bold;');
console.log('%c' + '='.repeat(50), 'color: #ff8c00');

// Check 1: Current URL
console.group('1. Current Page');
console.log('URL:', window.location.href);
console.log('Protocol:', window.location.protocol);
const isValidURL = window.location.protocol === 'http:' || window.location.protocol === 'https:';
console.log('Valid for content script:', isValidURL ? '✅ YES' : '❌ NO (must be http:// or https://)');
console.groupEnd();

// Check 2: MetaMask availability
console.group('2. MetaMask Provider');
const hasEthereum = typeof window.ethereum !== 'undefined';
console.log('window.ethereum exists:', hasEthereum ? '✅ YES' : '❌ NO');
if (hasEthereum) {
  console.log('Provider details:', {
    isMetaMask: window.ethereum.isMetaMask,
    isConnected: window.ethereum.isConnected?.(),
    selectedAddress: window.ethereum.selectedAddress || 'Not connected'
  });
}
console.groupEnd();

// Check 3: Extension communication
console.group('3. Extension Communication');
if (typeof chrome === 'undefined' || typeof chrome.runtime === 'undefined') {
  console.log('❌ Chrome extension APIs not available');
  console.log('Note: This is normal if you\'re not running the RiskLens extension');
} else {
  console.log('✅ Chrome extension APIs available');
  console.log('Extension ID:', chrome.runtime.id);
  
  // Try to get extension status
  chrome.runtime.sendMessage(
    { action: 'checkMetaMask' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Background script error:', chrome.runtime.lastError.message);
      } else {
        console.log('✅ Background script responded');
        console.log('MetaMask detected by extension:', response?.hasMetaMask ? '✅ YES' : '❌ NO');
      }
    }
  );
}
console.groupEnd();

// Check 4: Content script status
console.group('4. Content Script');
if (typeof chrome !== 'undefined' && typeof chrome.runtime !== 'undefined') {
  chrome.runtime.sendMessage(
    { action: 'checkMetaMaskPresent' },
    (response) => {
      if (chrome.runtime.lastError) {
        console.error('❌ Content script not responding:', chrome.runtime.lastError.message);
        console.log('Possible causes:');
        console.log('- Not on a valid website (must be http:// or https://)');
        console.log('- Extension not installed or disabled');
        console.log('- Extension not reloaded');
      } else {
        console.log('✅ Content script is responding');
        console.log('MetaMask detected by content script:', response?.hasMetaMask ? '✅ YES' : '❌ NO');
      }
    }
  );
} else {
  console.log('⚠️  Cannot test (chrome.runtime not available)');
}
console.groupEnd();

// Summary
console.group('%cSummary', 'color: #ff8c00; font-weight: bold;');
console.log('For RiskLens to work:');
console.log('1. ✅ Page must be HTTP/HTTPS -', isValidURL ? 'PASS' : 'FAIL');
console.log('2. ✅ MetaMask must be installed -', hasEthereum ? 'PASS' : 'FAIL');
console.log('3. ✅ Extension must be installed - Check Settings');
console.log('4. ✅ Content script must load - See Check 4 above');
console.groupEnd();

console.log('%c' + '='.repeat(50), 'color: #ff8c00');
console.log('%cTroubleshooting:', 'color: #ff8c00; font-weight: bold;');
console.log('If something failed above:');
console.log('1. Make sure you\'re on a REAL website (not blank tab or extension page)');
console.log('2. Make sure MetaMask extension is installed from https://metamask.io');
console.log('3. Reload the extension: chrome://extensions → Toggle RiskLens OFF/ON');
console.log('4. Reload this page: Ctrl+R (or Cmd+R on Mac)');
console.log('5. Open the extension\'s debug page: chrome-extension://[ID]/debug.html');
console.log('6. Run this diagnostic again');
