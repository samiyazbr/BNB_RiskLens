/**
 * BNB RiskLens - Content Script
 * Injected into web pages to detect DeFi interactions
 */

console.log('🔶 BNB RiskLens content script loaded');

// Listen for Web3 provider detection
window.addEventListener('load', () => {
  detectWeb3Provider();
});

/**
 * Detect Web3 provider (MetaMask, etc.)
 */
function detectWeb3Provider() {
  if (typeof window.ethereum !== 'undefined') {
    console.log('✅ Web3 provider detected');
    
    // Listen for transaction requests
    if (window.ethereum.on) {
      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }
  } else {
    console.log('⚠️  No Web3 provider detected');
  }
}

/**
 * Handle chain change
 */
function handleChainChanged(chainId) {
  console.log('🔗 Chain changed to:', chainId);
  
  // Check if on BNB Chain
  const bnbChainIds = ['0x38', '0x61']; // Mainnet and Testnet
  if (bnbChainIds.includes(chainId)) {
    console.log('✅ Connected to BNB Chain');
  }
}

/**
 * Handle account change
 */
function handleAccountsChanged(accounts) {
  console.log('👤 Accounts changed:', accounts);
}

/**
 * Intercept potential risky transactions (future enhancement)
 * This would require deeper integration with the page's Web3 instance
 */
function interceptTransaction(txParams) {
  console.log('🚨 Transaction detected:', txParams);
  
  // Send to extension for risk evaluation
  chrome.runtime.sendMessage({
    action: 'evaluateRisk',
    data: {
      to: txParams.to,
      value: txParams.value,
      data: txParams.data
    }
  });
}

// Listen for messages from extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getPageInfo') {
    sendResponse({
      url: window.location.href,
      title: document.title,
      hasWeb3: typeof window.ethereum !== 'undefined'
    });
  }
});
