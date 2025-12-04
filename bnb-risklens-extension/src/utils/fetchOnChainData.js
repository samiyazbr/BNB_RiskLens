/**
 * BNB RiskLens - Fetch On-Chain Data
 * Retrieves blockchain data for token risk evaluation
 */

/**
 * Fetch comprehensive on-chain data for a token
 * @param {string} tokenAddress - Token contract address
 * @param {string} chainId - Chain ID (0x38 for BSC mainnet, 0x61 for testnet)
 * @returns {Promise<object>} On-chain data
 */
async function fetchOnChainData(tokenAddress, chainId) {
  console.log('📡 Fetching on-chain data for:', tokenAddress);
  
  try {
    // Parallel data fetching for efficiency
    const [
      contractMetadata,
      holderData,
      liquidityData,
      bytecode
    ] = await Promise.all([
      getContractMetadata(tokenAddress, chainId),
      getHolderCount(tokenAddress, chainId),
      checkLiquidity(tokenAddress, chainId),
      getContractBytecode(tokenAddress)
    ]);
    
    // Combine all data
    const onChainData = {
      address: tokenAddress,
      chainId: chainId,
      
      // Contract metadata
      isVerified: contractMetadata.isVerified,
      creationTime: contractMetadata.creationTime,
      creatorAddress: contractMetadata.creator,
      txCount: contractMetadata.txCount,
      
      // Token data
      name: contractMetadata.name || 'Unknown',
      symbol: contractMetadata.symbol || 'Unknown',
      decimals: contractMetadata.decimals || 18,
      totalSupply: contractMetadata.totalSupply || '0',
      
      // Holder data
      holderCount: holderData.count,
      topHolders: holderData.topHolders || [],
      
      // Liquidity data
      liquidityUSD: liquidityData.liquidityUSD,
      liquidityBNB: liquidityData.liquidityBNB,
      hasLiquidityPool: liquidityData.hasPool,
      
      // Bytecode analysis
      bytecode: bytecode,
      hasTradingRestrictions: await detectTradingRestrictions(bytecode),
      
      // Timestamps
      fetchedAt: Date.now()
    };
    
    console.log('✅ On-chain data fetched successfully');
    return onChainData;
    
  } catch (error) {
    console.error('❌ Error fetching on-chain data:', error);
    
    // Return minimal fallback data
    return {
      address: tokenAddress,
      chainId: chainId,
      isVerified: false,
      creationTime: Date.now(),
      txCount: 0,
      holderCount: 0,
      liquidityUSD: 0,
      hasLiquidityPool: false,
      bytecode: '',
      hasTradingRestrictions: false,
      error: error.message,
      fetchedAt: Date.now()
    };
  }
}

/**
 * Get contract bytecode
 * @param {string} address - Contract address
 * @returns {Promise<string>} Contract bytecode
 */
async function getContractBytecode(address) {
  try {
    const bytecode = await window.ethereum.request({
      method: 'eth_getCode',
      params: [address, 'latest']
    });
    
    return bytecode;
  } catch (error) {
    console.error('Error fetching bytecode:', error);
    return '';
  }
}

/**
 * Detect trading restrictions in bytecode
 * @param {string} bytecode - Contract bytecode
 * @returns {boolean} True if restrictions detected
 */
async function detectTradingRestrictions(bytecode) {
  if (!bytecode || bytecode === '0x') return false;
  
  // Remove '0x' prefix for analysis
  const code = bytecode.toLowerCase().replace('0x', '');
  
  // Pattern detection (simplified)
  const suspiciousPatterns = [
    // SELFDESTRUCT opcode
    'ff',
    
    // Common honeypot function signatures (trading enabled checks)
    '70a08231', // balanceOf - often used in restrictions
    'dd62ed3e', // allowance
  ];
  
  // Check if bytecode is suspiciously small (< 100 bytes) or large (> 50KB)
  if (code.length < 200 || code.length > 100000) {
    return true;
  }
  
  // More sophisticated check would analyze the actual logic
  // For demo purposes, we use simplified heuristics
  return false;
}

/**
 * Get holder count from local cache or estimate
 * @param {string} address - Token address
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Holder data
 */
async function getHolderCount(address, chainId) {
  try {
    // In production, this would query an indexer API like BSCScan, Covalent, or The Graph
    // For demo, we simulate or use Transfer events to estimate
    
    // Placeholder: Try to get from local storage cache
    const cached = await getCachedHolderData(address);
    if (cached) {
      return cached;
    }
    
    // For demo purposes, return estimated data
    // Real implementation would query BSCScan API or Graph Protocol
    return {
      count: Math.floor(Math.random() * 200) + 10, // Demo: random 10-210
      topHolders: [],
      estimatedAt: Date.now()
    };
  } catch (error) {
    console.error('Error getting holder count:', error);
    return { count: 0, topHolders: [] };
  }
}

/**
 * Get cached holder data from storage
 */
async function getCachedHolderData(address) {
  return new Promise((resolve) => {
    chrome.storage.local.get([`holders_${address}`], (result) => {
      const data = result[`holders_${address}`];
      
      if (data && Date.now() - data.timestamp < 3600000) { // 1 hour cache
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Cache holder data
 */
async function cacheHolderData(address, data) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      [`holders_${address}`]: {
        ...data,
        timestamp: Date.now()
      }
    }, resolve);
  });
}

/**
 * Get network RPC URL
 */
function getRpcUrl(chainId) {
  const rpcUrls = {
    '0x38': 'https://bsc-dataseed.binance.org/',
    '0x61': 'https://data-seed-prebsc-1-s1.binance.org:8545/',
    '0x1': 'https://eth.llamarpc.com',
    '0x539': 'http://localhost:8545'
  };
  
  return rpcUrls[chainId] || rpcUrls['0x61'];
}
