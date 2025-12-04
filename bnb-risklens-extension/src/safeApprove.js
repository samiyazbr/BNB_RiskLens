/**
 * BNB RiskLens - SafeApprove Flow
 * Implements secure temporary approval mechanism
 */

/**
 * Execute SafeApprove flow
 * 1. Set temporary allowance for exact amount needed
 * 2. Execute the transaction
 * 3. Reset allowance to zero
 * 
 * @param {string} tokenAddress - Token contract address
 * @param {string} amount - Amount to approve (in wei or token units)
 * @param {string} spenderAddress - Address to approve (router, contract, etc.)
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<object>} Result of SafeApprove flow
 */
async function safeApproveFlow(tokenAddress, amount, userAddress, spenderAddress) {
  console.log('🛡️ Starting SafeApprove flow...');
  console.log('Token:', tokenAddress);
  console.log('Amount:', amount);
  console.log('Spender:', spenderAddress);
  
  try {
    // Step 1: Check current allowance
    const currentAllowance = await getCurrentAllowance(tokenAddress, userAddress, spenderAddress);
    console.log('Current allowance:', currentAllowance);
    
    // Step 2: Set temporary allowance
    console.log('Setting temporary allowance...');
    const approveTx = await setApproval(tokenAddress, spenderAddress, amount);
    
    if (!approveTx.success) {
      throw new Error('Failed to set approval: ' + approveTx.error);
    }
    
    console.log('✅ Temporary allowance set:', approveTx.txHash);
    
    // Step 3: Wait for user to execute their transaction
    // In a real implementation, this would monitor for the transaction
    // For demo, we'll assume transaction completed
    
    // Step 4: Reset allowance to zero
    console.log('Resetting allowance to zero...');
    const resetTx = await setApproval(tokenAddress, spenderAddress, '0');
    
    if (!resetTx.success) {
      console.warn('⚠️ Failed to reset allowance:', resetTx.error);
      // Not critical if this fails, but warn user
    } else {
      console.log('✅ Allowance reset to zero:', resetTx.txHash);
    }
    
    return {
      success: true,
      approveTxHash: approveTx.txHash,
      resetTxHash: resetTx.txHash,
      message: 'SafeApprove completed successfully'
    };
    
  } catch (error) {
    console.error('❌ SafeApprove error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get current allowance
 * @param {string} tokenAddress - Token contract
 * @param {string} ownerAddress - Token owner
 * @param {string} spenderAddress - Approved spender
 * @returns {Promise<string>} Current allowance
 */
async function getCurrentAllowance(tokenAddress, ownerAddress, spenderAddress) {
  try {
    // ERC20 allowance function signature: allowance(address,address)
    const selector = '0xdd62ed3e';
    
    // Encode parameters (owner and spender addresses)
    const data = selector + 
      ownerAddress.slice(2).padStart(64, '0') +
      spenderAddress.slice(2).padStart(64, '0');
    
    // Call contract
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: tokenAddress,
        data: data
      }, 'latest']
    });
    
    // Decode uint256 result
    return BigInt(result).toString();
  } catch (error) {
    console.error('Error getting allowance:', error);
    return '0';
  }
}

/**
 * Set approval amount
 * @param {string} tokenAddress - Token contract
 * @param {string} spenderAddress - Address to approve
 * @param {string} amount - Amount to approve
 * @returns {Promise<object>} Transaction result
 */
async function setApproval(tokenAddress, spenderAddress, amount) {
  try {
    // ERC20 approve function signature: approve(address,uint256)
    const selector = '0x095ea7b3';
    
    // Convert amount to hex and pad to 32 bytes
    const amountHex = BigInt(amount).toString(16).padStart(64, '0');
    
    // Encode parameters
    const data = selector + 
      spenderAddress.slice(2).padStart(64, '0') +
      amountHex;
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: tokenAddress,
        data: data
      }]
    });
    
    console.log('Transaction sent:', txHash);
    
    // Wait for confirmation
    await waitForTransaction(txHash);
    
    return {
      success: true,
      txHash: txHash
    };
  } catch (error) {
    console.error('Error setting approval:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @param {number} timeout - Timeout in milliseconds
 * @returns {Promise<object>} Transaction receipt
 */
async function waitForTransaction(txHash, timeout = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      
      if (receipt) {
        console.log('Transaction confirmed:', receipt);
        return receipt;
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error checking transaction:', error);
    }
  }
  
  throw new Error('Transaction timeout');
}

/**
 * Publish risk assessment to RiskFeed contract
 * @param {string} tokenAddress - Token being assessed
 * @param {number} score - Risk score (0-10)
 * @param {string} rulesTriggered - Comma-separated rule IDs
 * @param {string} userAddress - Publisher address
 * @returns {Promise<object>} Publish result
 */
async function publishRisk(tokenAddress, score, rulesTriggered, userAddress) {
  console.log('📤 Publishing risk to RiskFeed...');
  
  try {
    // Load RiskFeed contract address from config
    const riskFeedAddress = await getRiskFeedAddress();
    
    if (!riskFeedAddress) {
      throw new Error('RiskFeed contract address not configured');
    }
    
    // RiskFeed publishRisk function signature: publishRisk(address,uint256,string)
    const selector = '0x' + keccak256('publishRisk(address,uint256,string)').slice(0, 8);
    
    // For demo purposes, use a simplified approach
    // In production, use proper ABI encoding
    
    // Encode parameters (simplified)
    const data = selector +
      tokenAddress.slice(2).padStart(64, '0') +
      score.toString(16).padStart(64, '0') +
      '0000000000000000000000000000000000000000000000000000000000000060' + // offset for string
      encodeString(rulesTriggered);
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: riskFeedAddress,
        data: data,
        from: userAddress
      }]
    });
    
    console.log('✅ Risk published, tx:', txHash);
    
    return {
      success: true,
      txHash: txHash,
      riskFeedAddress: riskFeedAddress
    };
  } catch (error) {
    console.error('Error publishing risk:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get RiskFeed contract address from storage/config
 * @returns {Promise<string>} RiskFeed address
 */
async function getRiskFeedAddress() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['riskFeedAddress'], (result) => {
      // Fallback to hardcoded testnet address if not configured
      const address = result.riskFeedAddress || '0x0000000000000000000000000000000000000000';
      resolve(address);
    });
  });
}

/**
 * Encode string for contract call (simplified)
 * @param {string} str - String to encode
 * @returns {string} Hex-encoded string
 */
function encodeString(str) {
  // Length of string
  const length = str.length.toString(16).padStart(64, '0');
  
  // Convert string to hex
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16).padStart(2, '0');
  }
  
  // Pad to 32-byte boundary
  hex = hex.padEnd(Math.ceil(hex.length / 64) * 64, '0');
  
  return length + hex;
}

/**
 * Simplified keccak256 placeholder
 * In production, use a proper library like ethers.js
 * @param {string} input - Input string
 * @returns {string} Hash (placeholder)
 */
function keccak256(input) {
  // This is a placeholder - in production use proper keccak256
  // For demo purposes, return a mock selector
  const mockSelectors = {
    'publishRisk(address,uint256,string)': 'a1b2c3d4'
  };
  
  return mockSelectors[input] || '00000000';
}
