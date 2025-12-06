/**
 * BNB RiskLens - Popup Script
 * Main UI controller for the extension popup
 */

// State management
let state = {
  connected: false,
  walletAddress: null,
  chainId: null,
  currentEvaluation: null,
  web3Provider: null
};

// DOM Elements
const elements = {
  connectWallet: document.getElementById('connectWallet'),
  walletAddress: document.getElementById('walletAddress'),
  networkStatus: document.getElementById('networkStatus'),
  networkName: document.getElementById('networkName'),
  
  connectionSection: document.getElementById('connectionSection'),
  inputSection: document.getElementById('inputSection'),
  loadingState: document.getElementById('loadingState'),
  resultsSection: document.getElementById('resultsSection'),
  
  tokenAddress: document.getElementById('tokenAddress'),
  actionType: document.getElementById('actionType'),
  amount: document.getElementById('amount'),
  evaluateBtn: document.getElementById('evaluateBtn'),
  
  scoreValue: document.getElementById('scoreValue'),
  levelBadge: document.getElementById('levelBadge'),
  riskLevel: document.getElementById('riskLevel'),
  rulesTableBody: document.getElementById('rulesTableBody'),
  aiExplanation: document.getElementById('aiExplanation'),
  
  actionButtons: document.getElementById('actionButtons'),
  executeApproveBtn: document.getElementById('executeApproveBtn'),
  rejectApproveBtn: document.getElementById('rejectApproveBtn'),
  
  safeApproveSection: document.getElementById('safeApproveSection'),
  safeApproveBtn: document.getElementById('safeApproveBtn'),
  publishBtn: document.getElementById('publishBtn'),
  newEvaluationBtn: document.getElementById('newEvaluationBtn')
};

// Initialize on load
document.addEventListener('DOMContentLoaded', initialize);

/**
 * Initialize the extension
 */
async function initialize() {
  console.log('🔶 BNB RiskLens initializing...');
  
  // Set up event listeners
  setupEventListeners();
  
  // Skip MetaMask detection check - will check when user tries to connect
  // This avoids false "not detected" errors when popup opens
  console.log('✅ Extension ready - MetaMask will be checked on connection attempt');
  
  // Check for existing connection
  await checkExistingConnection();
}

/**
 * Check if MetaMask is available via background script
 */
async function checkMetaMask() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(
      { action: 'checkMetaMask' },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('⚠️  Error checking MetaMask:', chrome.runtime.lastError);
          resolve(false);
        } else {
          resolve(response?.hasMetaMask || false);
        }
      }
    );
  });
}

/**
 * Check for MetaMask with retry logic (wait for injection)
 * MetaMask can take a moment to inject into the page
 */
async function checkMetaMaskWithRetry(maxRetries = 3, delayMs = 300) {
  console.log('🔍 Checking for MetaMask...');
  
  for (let i = 0; i < maxRetries; i++) {
    const hasMetaMask = await checkMetaMask();
    
    if (hasMetaMask) {
      console.log('✅ MetaMask detected!');
      return true;
    }
    
    if (i < maxRetries - 1) {
      console.log(`⏳ MetaMask not detected, retrying in ${delayMs}ms... (${i + 1}/${maxRetries})`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  console.warn('❌ MetaMask not detected after retries');
  return false;
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  elements.connectWallet.addEventListener('click', connectWallet);
  elements.evaluateBtn.addEventListener('click', evaluateRisk);
  elements.executeApproveBtn.addEventListener('click', executeApprove);
  elements.rejectApproveBtn.addEventListener('click', rejectApprove);
  elements.safeApproveBtn.addEventListener('click', executeSafeApprove);
  elements.publishBtn.addEventListener('click', publishToRiskFeed);
  elements.newEvaluationBtn.addEventListener('click', resetToInput);
  
  // Listen for account/chain changes from background script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'CHAIN_CHANGED') {
      handleChainChanged(request.chainId);
    } else if (request.type === 'ACCOUNTS_CHANGED') {
      handleAccountsChanged(request.accounts);
    }
  });
}

/**
 * Check for existing wallet connection
 */
async function checkExistingConnection() {
  try {
    const result = await ethereumRequest({ method: 'eth_accounts' });
    const accounts = result.error ? [] : (Array.isArray(result) ? result : []);
    
    if (accounts.length > 0) {
      await handleConnection(accounts);
    }
  } catch (error) {
    console.error('Error checking connection:', error);
  }
}

/**
 * Connect to MetaMask wallet via background script
 */
async function connectWallet() {
  try {
    console.log('🔗 Starting wallet connection...');
    elements.connectWallet.disabled = true;
    elements.connectWallet.textContent = 'Connecting...';
    
    // First, check if we're on a valid tab
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tabs || tabs.length === 0) {
      throw new Error('No active tab found. Please open a website first.');
    }
    
    const currentTab = tabs[0];
    const tabUrl = currentTab.url || '';
    
    console.log('📍 Current tab URL:', tabUrl);
    
    // Check if we're on a restricted page
    if (tabUrl.startsWith('chrome://') || 
        tabUrl.startsWith('chrome-extension://') ||
        tabUrl.startsWith('edge://') ||
        tabUrl.startsWith('about:') ||
        tabUrl === '') {
      throw new Error('RESTRICTED_PAGE');
    }
    
    // Give content script a moment to inject into the page
    console.log('⏳ Initializing...');
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📤 Sending eth_requestAccounts request');
    const result = await ethereumRequest({ method: 'eth_requestAccounts' });
    
    console.log('📥 Got response:', result);
    
    if (result.error) {
      throw new Error(result.error);
    }

    if (!Array.isArray(result) || result.length === 0) {
      throw new Error('No accounts returned from MetaMask');
    }
    
    console.log('✅ Accounts received:', result);
    await handleConnection(result);
  } catch (error) {
    console.error('❌ Connection error:', error);
    
    // Provide more helpful error messages
    let errorMsg = error.message;
    
    if (error.message === 'RESTRICTED_PAGE') {
      errorMsg = '❌ Cannot connect from this page type.\n\n✅ Fix: \n1. Open a regular website (like google.com)\n2. Click the extension icon again\n3. Extensions don\'t work on chrome:// pages';
    } else if (errorMsg.includes('No active tab')) {
      errorMsg = '❌ No website is open.\n\n✅ Fix: Visit a website (any site works, e.g., google.com)';
    } else if (errorMsg.includes('MetaMask not detected') || errorMsg.includes('ethereum')) {
      errorMsg = '❌ MetaMask Extension Required\n\n✅ To use BNB RiskLens:\n\n1. Install MetaMask browser extension\n   → Visit: https://metamask.io/download\n\n2. After installing MetaMask:\n   → Unlock your wallet\n   → Visit any website (e.g., uniswap.org)\n   → Click the BNB RiskLens icon again\n\n3. Click "Connect MetaMask" button\n\n💡 Tip: Extensions work best on regular websites, not on chrome:// pages';
    } else if (errorMsg.includes('timeout') || errorMsg.includes('Please make sure you have a website open')) {
      errorMsg = '❌ Connection timed out.\n\n✅ Fix:\n1. Make sure MetaMask is installed and unlocked\n2. Reload the page (F5)\n3. Wait for page to fully load\n4. Try clicking Connect again';
    } else if (errorMsg.includes('User rejected')) {
      errorMsg = '❌ You cancelled the connection.\n\n✅ Click "Connect MetaMask" to try again.';
    }
    
    showError('Failed to connect:\n\n' + errorMsg);
    elements.connectWallet.disabled = false;
    elements.connectWallet.textContent = 'Connect MetaMask';
  }
}

/**
 * Make Ethereum request via background script
 */
function ethereumRequest(payload) {
  return new Promise((resolve) => {
    const timeoutId = setTimeout(() => {
      resolve({ error: 'Request timeout: Please make sure you have a website open with MetaMask' });
    }, 12000); // 12 second timeout

    chrome.runtime.sendMessage(
      { action: 'ethereumRequest', payload },
      (response) => {
        clearTimeout(timeoutId);
        if (chrome.runtime.lastError) {
          resolve({ error: chrome.runtime.lastError.message });
        } else {
          resolve(response || {});
        }
      }
    );
  });
}

/**
 * Handle successful wallet connection
 */
async function handleConnection(accounts) {
  if (!Array.isArray(accounts) || accounts.length === 0) return;
  
  state.connected = true;
  state.walletAddress = accounts[0];
  
  // Get chain ID
  const chainIdResult = await ethereumRequest({ method: 'eth_chainId' });
  state.chainId = chainIdResult.error ? '0x38' : chainIdResult;
  
  // Update UI
  updateConnectionUI();
  
  // Show input section
  elements.connectionSection.style.display = 'none';
  elements.inputSection.style.display = 'block';
}

/**
 * Update connection UI
 */
function updateConnectionUI() {
  // Update wallet address display
  const shortAddress = `${state.walletAddress.slice(0, 6)}...${state.walletAddress.slice(-4)}`;
  elements.walletAddress.textContent = shortAddress;
  elements.connectWallet.textContent = shortAddress;
  
  // Update network status
  const networkInfo = getNetworkInfo(state.chainId);
  elements.networkName.textContent = networkInfo.name;
  
  const statusDot = elements.networkStatus.querySelector('.status-dot');
  if (networkInfo.supported) {
    statusDot.className = 'status-dot status-connected';
  } else {
    statusDot.className = 'status-dot status-warning';
  }
}

/**
 * Get network information
 */
function getNetworkInfo(chainId) {
  const networks = {
    '0x38': { name: 'BNB Chain', supported: true },
    '0x61': { name: 'BNB Testnet', supported: true },
    '0x1': { name: 'Ethereum', supported: false },
    '0x539': { name: 'Local', supported: true }
  };
  
  return networks[chainId] || { name: 'Unknown Network', supported: false };
}

/**
 * Handle chain change
 */
function handleChainChanged(chainId) {
  state.chainId = chainId;
  updateConnectionUI();
  window.location.reload();
}

/**
 * Handle account change
 */
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // User disconnected
    state.connected = false;
    state.walletAddress = null;
    resetUI();
  } else {
    handleConnection(accounts);
  }
}

/**
 * Evaluate token risk
 */
async function evaluateRisk() {
  const tokenAddress = elements.tokenAddress.value.trim();
  const actionType = elements.actionType.value;
  const amount = elements.amount.value.trim();
  
  // Validate input
  if (!tokenAddress || !tokenAddress.startsWith('0x')) {
    showError('Please enter a valid token address');
    return;
  }
  
  // Show loading state
  elements.inputSection.style.display = 'none';
  elements.loadingState.style.display = 'block';
  
  try {
    // Fetch on-chain data
    const onChainData = await fetchOnChainData(tokenAddress, state.chainId);
    
    // Run rule engine
    const ruleResults = await evaluateRules(tokenAddress, onChainData, actionType, amount);
    
    // Calculate risk score
    const riskScore = calculateRiskScore(ruleResults);
    
    // Get AI explanation (await the async function)
    console.log('🤖 Getting AI explanation...');
    const aiExplanation = await getAIExplanation(ruleResults, riskScore);
    console.log('✅ AI explanation generated');
    
    // Store evaluation
    state.currentEvaluation = {
      tokenAddress,
      actionType,
      amount,
      ruleResults,
      riskScore,
      aiExplanation,
      timestamp: Date.now()
    };
    
    // Display results
    displayResults();
    
  } catch (error) {
    console.error('Evaluation error:', error);
    showError('Failed to evaluate token: ' + error.message);
    resetToInput();
  }
}

/**
 * Display evaluation results
 */
function displayResults() {
  const { riskScore, ruleResults, aiExplanation, actionType } = state.currentEvaluation;
  
  // Hide loading, show results
  elements.loadingState.style.display = 'none';
  elements.resultsSection.style.display = 'block';
  
  // Display risk score
  elements.scoreValue.textContent = riskScore.score;
  elements.levelBadge.textContent = riskScore.level;
  elements.levelBadge.className = `level-badge level-${riskScore.level.toLowerCase()}`;
  
  // Add background color to risk level
  elements.riskLevel.className = `risk-level risk-${riskScore.level.toLowerCase()}`;
  
  // Display rule results in table
  displayRulesTable(ruleResults);
  
  // Display AI explanation
  elements.aiExplanation.innerHTML = aiExplanation;
  
  // Show approve/reject buttons for approve actions
  if (actionType === 'approve') {
    elements.actionButtons.style.display = 'flex';
    
    // Update button text based on risk level
    if (riskScore.level === 'HIGH') {
      elements.executeApproveBtn.textContent = '⚠️ Approve Anyway (Not Recommended)';
      elements.executeApproveBtn.className = 'btn btn-danger';
    } else if (riskScore.level === 'MEDIUM') {
      elements.executeApproveBtn.textContent = '⚠️ Proceed with Caution';
      elements.executeApproveBtn.className = 'btn btn-warning';
    } else {
      elements.executeApproveBtn.textContent = '✅ Approve Transaction';
      elements.executeApproveBtn.className = 'btn btn-primary';
    }
  } else {
    elements.actionButtons.style.display = 'none';
  }
  
  // Show SafeApprove option if applicable
  if (actionType === 'approve' && riskScore.level !== 'LOW') {
    elements.safeApproveSection.style.display = 'block';
  } else {
    elements.safeApproveSection.style.display = 'none';
  }
}

/**
 * Display rules in table format
 */
function displayRulesTable(ruleResults) {
  elements.rulesTableBody.innerHTML = '';
  
  ruleResults.forEach(rule => {
    const row = document.createElement('tr');
    row.className = rule.triggered ? 'rule-triggered' : 'rule-passed';
    
    row.innerHTML = `
      <td>
        <div class="rule-name">${rule.name}</div>
        <div class="rule-description">${rule.description}</div>
      </td>
      <td class="rule-status">
        ${rule.triggered ? '⚠️ Triggered' : '✅ Passed'}
      </td>
      <td class="rule-points">
        ${rule.triggered ? '+' + rule.points : '0'}
      </td>
    `;
    
    elements.rulesTableBody.appendChild(row);
  });
}

/**
 * Execute approve transaction via MetaMask
 */
async function executeApprove() {
  try {
    const { tokenAddress, amount } = state.currentEvaluation;
    
    console.log('🔐 Executing approve transaction...');
    elements.executeApproveBtn.disabled = true;
    elements.executeApproveBtn.textContent = 'Waiting for approval...';
    
    // ERC20 approve function signature
    const approveFunction = '0x095ea7b3'; // approve(address,uint256)
    
    // Encode spender address (you would get this from the dApp or user input)
    // For now, using a placeholder - in production, this would come from the actual approval request
    const spender = '0x0000000000000000000000000000000000000000'; // Placeholder
    const spenderPadded = spender.slice(2).padStart(64, '0');
    
    // Encode amount
    let amountHex;
    if (amount === '' || amount === 'unlimited') {
      // Unlimited approval: max uint256
      amountHex = 'f'.repeat(64);
    } else {
      // Convert amount to hex (assuming 18 decimals for now)
      const amountWei = BigInt(parseFloat(amount) * 1e18);
      amountHex = amountWei.toString(16).padStart(64, '0');
    }
    
    // Construct data
    const data = approveFunction + spenderPadded + amountHex;
    
    // Send transaction via MetaMask
    const txHash = await ethereumRequest({
      method: 'eth_sendTransaction',
      params: [{
        from: state.walletAddress,
        to: tokenAddress,
        data: data,
        gas: '0x' + (100000).toString(16), // 100k gas limit
      }]
    });
    
    if (txHash.error) {
      throw new Error(txHash.error);
    }
    
    console.log('✅ Transaction sent:', txHash);
    alert(`✅ Approval transaction sent!\n\nTransaction Hash:\n${txHash}\n\nCheck your MetaMask for confirmation.`);
    
    // Reset
    elements.executeApproveBtn.disabled = false;
    elements.executeApproveBtn.textContent = '✅ Approve Transaction';
    resetToInput();
    
  } catch (error) {
    console.error('❌ Approve failed:', error);
    alert(`❌ Approval failed:\n\n${error.message}`);
    elements.executeApproveBtn.disabled = false;
    elements.executeApproveBtn.textContent = '✅ Approve Transaction';
  }
}

/**
 * Reject the approval
 */
function rejectApprove() {
  console.log('❌ User rejected approval');
  alert('❌ Approval cancelled.\n\nYou made the smart choice! The token was not approved.');
  resetToInput();
}

/**
 * Execute SafeApprove flow
 */
async function executeSafeApprove() {
  try {
    showLoading('Executing SafeApprove...');
    
    const result = await safeApproveFlow(
      state.currentEvaluation.tokenAddress,
      state.currentEvaluation.amount,
      state.walletAddress
    );
    
    if (result.success) {
      showSuccess('SafeApprove executed successfully!');
    } else {
      showError('SafeApprove failed: ' + result.error);
    }
  } catch (error) {
    console.error('SafeApprove error:', error);
    showError('SafeApprove failed: ' + error.message);
  }
}

/**
 * Publish risk assessment to RiskFeed contract
 */
async function publishToRiskFeed() {
  try {
    showLoading('Publishing to Risk Feed...');
    
    const { tokenAddress, riskScore, ruleResults } = state.currentEvaluation;
    
    // Get triggered rule IDs
    const triggeredRules = ruleResults
      .filter(r => r.triggered)
      .map(r => r.id)
      .join(',');
    
    // Call RiskFeed contract
    const result = await publishRisk(
      tokenAddress,
      riskScore.score,
      triggeredRules,
      state.walletAddress
    );
    
    if (result.success) {
      showSuccess('Risk assessment published to blockchain!');
      
      // Send to background script for storage
      chrome.runtime.sendMessage({
        action: 'publishToRiskFeed',
        data: {
          tokenAddress,
          score: riskScore.score,
          txHash: result.txHash
        }
      });
    } else {
      showError('Publish failed: ' + result.error);
    }
  } catch (error) {
    console.error('Publish error:', error);
    showError('Publish failed: ' + error.message);
  }
}

/**
 * Reset to input section
 */
function resetToInput() {
  elements.resultsSection.style.display = 'none';
  elements.loadingState.style.display = 'none';
  elements.inputSection.style.display = 'block';
  
  // Clear input
  elements.tokenAddress.value = '';
  elements.amount.value = '';
}

/**
 * Reset entire UI
 */
function resetUI() {
  elements.connectionSection.style.display = 'block';
  elements.inputSection.style.display = 'none';
  elements.resultsSection.style.display = 'none';
  elements.loadingState.style.display = 'none';
}

/**
 * Show loading message
 */
function showLoading(message) {
  elements.loadingState.querySelector('p').textContent = message;
  elements.resultsSection.style.display = 'none';
  elements.loadingState.style.display = 'block';
}

/**
 * Show success message
 */
function showSuccess(message) {
  alert('✅ ' + message);
  elements.loadingState.style.display = 'none';
  elements.resultsSection.style.display = 'block';
}

/**
 * Show error message
 */
function showError(message) {
  alert('❌ ' + message);
}
