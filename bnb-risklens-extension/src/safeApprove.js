/**
 * BNB RiskLens - SafeApprove Flow
 * Implements secure token approval with automatic allowance reset
 */

/**
 * Execute SafeApprove flow for a token
 * @param {string} tokenAddress - Token contract address
 * @param {string} amount - Amount to approve (in token units)
 * @param {string} userAddress - User's wallet address
 * @returns {Promise<object>} Result object with success status
 */
async function safeApproveFlow(tokenAddress, amount, userAddress) {
  console.log('🛡️ Starting SafeApprove flow...');
  
  try {
    // Step 1: Get the spender address from user input
    const spender = prompt('Enter the spender contract address (e.g., PancakeSwap Router):');
    
    if (!spender || !spender.startsWith('0x')) {
      throw new Error('Invalid spender address');
    }
    
    // Step 2: Set temporary approval for exact amount
    console.log(`Setting temporary approval: ${amount} tokens to ${spender}`);
    
    const approveResult = await setTokenAllowance(tokenAddress, spender, amount);
    
    if (!approveResult.success) {
      throw new Error('Approval transaction failed');
    }
    
    console.log('✅ Temporary approval set successfully');
    
    // Step 3: Prompt user to complete their transaction
    alert('✅ Temporary approval set! Complete your transaction now (swap, transfer, etc.).\n\nOnce done, click OK to reset the allowance to zero.');
    
    // Step 4: Reset allowance to zero
    console.log('Resetting allowance to zero...');
    
    const resetResult = await setTokenAllowance(tokenAddress, spender, '0');
    
    if (!resetResult.success) {
      console.warn('⚠️ Failed to auto-reset allowance. Please reset manually.');
      return {
        success: true,
        warning: 'Transaction completed but allowance was not reset. Please reset manually for security.'
      };
    }
    
    console.log('✅ SafeApprove flow completed successfully');
    
    return {
      success: true,
      message: 'SafeApprove completed! Allowance has been reset to zero.'
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
 * Set token allowance using MetaMask
 * @param {string} tokenAddress - Token contract address
 * @param {string} spender - Spender contract address
 * @param {string} amount - Amount to approve (in token units)
 * @returns {Promise<object>} Result object
 */
async function setTokenAllowance(tokenAddress, spender, amount) {
  try {
    // ERC20 approve function signature
    const approveSignature = '0x095ea7b3'; // approve(address,uint256)
    
    // Encode spender address (pad to 32 bytes)
    const encodedSpender = spender.toLowerCase().replace('0x', '').padStart(64, '0');
    
    // Encode amount (pad to 32 bytes)
    // Convert amount to wei (assuming 18 decimals)
    let amountWei;
    if (amount === '0') {
      amountWei = '0'.padStart(64, '0');
    } else {
      const amountBN = BigInt(Math.floor(parseFloat(amount) * 10**18));
      amountWei = amountBN.toString(16).padStart(64, '0');
    }
    
    // Construct transaction data
    const data = approveSignature + encodedSpender + amountWei;
    
    // Send transaction via MetaMask
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: tokenAddress,
        from: window.ethereum.selectedAddress,
        data: data,
        gas: '0x15f90', // 90,000 gas limit
      }]
    });
    
    console.log(`Transaction sent: ${txHash}`);
    
    // Wait for confirmation
    await waitForTransaction(txHash);
    
    return { success: true, txHash };
    
  } catch (error) {
    console.error('Allowance setting error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Wait for transaction confirmation
 * @param {string} txHash - Transaction hash
 * @param {number} maxWait - Maximum wait time in milliseconds
 * @returns {Promise<void>}
 */
async function waitForTransaction(txHash, maxWait = 60000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWait) {
    try {
      const receipt = await window.ethereum.request({
        method: 'eth_getTransactionReceipt',
        params: [txHash]
      });
      
      if (receipt && receipt.status) {
        console.log('✅ Transaction confirmed');
        return;
      }
      
      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.warn('Error checking transaction:', error);
    }
  }
  
  throw new Error('Transaction confirmation timeout');
}

/**
 * Publish risk assessment to RiskFeed contract
 * @param {string} tokenAddress - Token contract address
 * @param {number} riskScore - Risk score (0-10)
 * @param {string} triggeredRules - Comma-separated rule IDs
 * @returns {Promise<object>} Result object
 */
async function publishRisk(tokenAddress, riskScore, triggeredRules) {
  console.log('📤 Publishing risk to RiskFeed...');
  
  try {
    // RiskFeed contract address (update with your deployed address)
    const riskFeedAddress = '0xEFB805dEA95af016B0907a606b0E6C91988Af0e8';
    
    // publishRisk function signature
    const publishSignature = '0x4d4d9e0b'; // publishRisk(address,uint256,string)
    
    // Encode token address
    const encodedToken = tokenAddress.toLowerCase().replace('0x', '').padStart(64, '0');
    
    // Encode risk score
    const encodedScore = riskScore.toString(16).padStart(64, '0');
    
    // Encode string data (triggered rules)
    const stringOffset = '60'; // Offset to string data (96 bytes)
    const stringLength = triggeredRules.length.toString(16).padStart(64, '0');
    const stringData = Array.from(triggeredRules)
      .map(char => char.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('')
      .padEnd(64, '0');
    
    // Construct transaction data
    const data = publishSignature + encodedToken + encodedScore + stringOffset + stringLength + stringData;
    
    // Send transaction
    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [{
        to: riskFeedAddress,
        from: window.ethereum.selectedAddress,
        data: data,
        gas: '0x30d40', // 200,000 gas limit
      }]
    });
    
    console.log(`Risk published: ${txHash}`);
    
    return { success: true, txHash };
    
  } catch (error) {
    console.error('Publish error:', error);
    return { success: false, error: error.message };
  }
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.safeApproveFlow = safeApproveFlow;
  window.publishRisk = publishRisk;
  window.setTokenAllowance = setTokenAllowance;
}
