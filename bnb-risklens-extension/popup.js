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
  
  // Check if MetaMask is installed
  if (typeof window.ethereum === 'undefined') {
    showError('MetaMask not detected. Please install MetaMask to use this extension.');
    return;
  }
  
  // Set up event listeners
  setupEventListeners();
  
  // Check for existing connection
  await checkExistingConnection();
}

/**
 * Setup event listeners
 */
function setupEventListeners() {
  elements.connectWallet.addEventListener('click', connectWallet);
  elements.evaluateBtn.addEventListener('click', evaluateRisk);
  elements.safeApproveBtn.addEventListener('click', executeSafeApprove);
  elements.publishBtn.addEventListener('click', publishToRiskFeed);
  elements.newEvaluationBtn.addEventListener('click', resetToInput);
  
  // Listen for network changes
  if (window.ethereum.on) {
    window.ethereum.on('chainChanged', handleChainChanged);
    window.ethereum.on('accountsChanged', handleAccountsChanged);
  }
}

/**
 * Check for existing wallet connection
 */
async function checkExistingConnection() {
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    });
    
    if (accounts.length > 0) {
      await handleConnection(accounts);
    }
  } catch (error) {
    console.error('Error checking connection:', error);
  }
}

/**
 * Connect to MetaMask wallet
 */
async function connectWallet() {
  try {
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });
    
    await handleConnection(accounts);
  } catch (error) {
    console.error('Connection error:', error);
    showError('Failed to connect wallet: ' + error.message);
  }
}

/**
 * Handle successful wallet connection
 */
async function handleConnection(accounts) {
  if (accounts.length === 0) return;
  
  state.connected = true;
  state.walletAddress = accounts[0];
  
  // Get chain ID
  state.chainId = await window.ethereum.request({ 
    method: 'eth_chainId' 
  });
  
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
    
    // Get AI explanation
    const aiExplanation = getAIExplanation(ruleResults, riskScore);
    
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
  const { riskScore, ruleResults, aiExplanation } = state.currentEvaluation;
  
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
  
  // Show SafeApprove option if applicable
  if (state.currentEvaluation.actionType === 'approve' && riskScore.level !== 'LOW') {
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
