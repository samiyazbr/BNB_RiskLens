/**
 * BNB RiskLens - Contract Metadata
 * Fetches and caches contract metadata
 */

// ERC20 ABI for basic token functions
const ERC20_ABI = [
  {
    "constant": true,
    "inputs": [],
    "name": "name",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "type": "function"
  }
];

/**
 * Get contract metadata
 * @param {string} address - Contract address
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Contract metadata
 */
async function getContractMetadata(address, chainId) {
  console.log('📋 Fetching contract metadata for:', address);
  
  try {
    // Try to get from cache first
    const cached = await getCachedMetadata(address);
    if (cached) {
      console.log('✅ Using cached metadata');
      return cached;
    }
    
    // Fetch metadata from various sources
    const [tokenInfo, verificationStatus, transactionCount] = await Promise.all([
      getTokenInfo(address),
      checkVerificationStatus(address, chainId),
      getTransactionCount(address)
    ]);
    
    const metadata = {
      address: address,
      name: tokenInfo.name,
      symbol: tokenInfo.symbol,
      decimals: tokenInfo.decimals,
      totalSupply: tokenInfo.totalSupply,
      isVerified: verificationStatus.isVerified,
      creationTime: verificationStatus.creationTime || Date.now() - 86400000, // Default: 1 day ago
      creator: verificationStatus.creator || '0x0000000000000000000000000000000000000000',
      txCount: transactionCount,
      fetchedAt: Date.now()
    };
    
    // Cache the metadata
    await cacheMetadata(address, metadata);
    
    console.log('✅ Metadata fetched successfully');
    return metadata;
    
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      address: address,
      name: 'Unknown',
      symbol: 'UNKNOWN',
      decimals: 18,
      totalSupply: '0',
      isVerified: false,
      creationTime: Date.now(),
      creator: '0x0000000000000000000000000000000000000000',
      txCount: 0,
      error: error.message
    };
  }
}

/**
 * Get basic token info (name, symbol, decimals, totalSupply)
 * @param {string} address - Token address
 * @returns {Promise<object>} Token info
 */
async function getTokenInfo(address) {
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      callContractFunction(address, 'name()', 'string'),
      callContractFunction(address, 'symbol()', 'string'),
      callContractFunction(address, 'decimals()', 'uint8'),
      callContractFunction(address, 'totalSupply()', 'uint256')
    ]);
    
    return {
      name: name || 'Unknown Token',
      symbol: symbol || 'UNKNOWN',
      decimals: decimals || 18,
      totalSupply: totalSupply || '0'
    };
  } catch (error) {
    console.error('Error getting token info:', error);
    return {
      name: 'Unknown Token',
      symbol: 'UNKNOWN',
      decimals: 18,
      totalSupply: '0'
    };
  }
}

/**
 * Call a contract function
 * @param {string} address - Contract address
 * @param {string} signature - Function signature
 * @param {string} returnType - Expected return type
 * @returns {Promise<any>} Function result
 */
async function callContractFunction(address, signature, returnType) {
  try {
    // Calculate function selector
    const selector = getFunctionSelector(signature);
    
    // Call contract
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: address,
        data: selector
      }, 'latest']
    });
    
    // Decode result based on type
    return decodeResult(result, returnType);
  } catch (error) {
    console.error(`Error calling ${signature}:`, error);
    return null;
  }
}

/**
 * Get function selector (first 4 bytes of keccak256 hash)
 * @param {string} signature - Function signature
 * @returns {string} Function selector
 */
function getFunctionSelector(signature) {
  // Pre-calculated selectors for common ERC20 functions
  const selectors = {
    'name()': '0x06fdde03',
    'symbol()': '0x95d89b41',
    'decimals()': '0x313ce567',
    'totalSupply()': '0x18160ddd',
    'balanceOf(address)': '0x70a08231',
    'allowance(address,address)': '0xdd62ed3e'
  };
  
  return selectors[signature] || '0x';
}

/**
 * Decode contract call result
 * @param {string} data - Hex-encoded result
 * @param {string} type - Expected type
 * @returns {any} Decoded value
 */
function decodeResult(data, type) {
  if (!data || data === '0x') return null;
  
  // Remove '0x' prefix
  const hex = data.slice(2);
  
  switch (type) {
    case 'uint8':
      return parseInt(hex, 16);
    
    case 'uint256':
      return BigInt('0x' + hex).toString();
    
    case 'address':
      return '0x' + hex.slice(-40);
    
    case 'string':
      return decodeString(hex);
    
    case 'bool':
      return parseInt(hex, 16) === 1;
    
    default:
      return data;
  }
}

/**
 * Decode ABI-encoded string
 * @param {string} hex - Hex string
 * @returns {string} Decoded string
 */
function decodeString(hex) {
  try {
    // Skip offset and length (first 64 chars)
    if (hex.length < 128) return '';
    
    // Get string length
    const length = parseInt(hex.slice(64, 128), 16);
    
    // Get string data
    const stringHex = hex.slice(128, 128 + (length * 2));
    
    // Convert hex to string
    let str = '';
    for (let i = 0; i < stringHex.length; i += 2) {
      const charCode = parseInt(stringHex.slice(i, i + 2), 16);
      if (charCode > 0) str += String.fromCharCode(charCode);
    }
    
    return str;
  } catch (error) {
    console.error('Error decoding string:', error);
    return '';
  }
}

/**
 * Check if contract is verified on BSCScan
 * @param {string} address - Contract address
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Verification status
 */
async function checkVerificationStatus(address, chainId) {
  try {
    // In production, would query BSCScan API
    // For demo, we simulate based on contract code size and randomness
    
    const code = await window.ethereum.request({
      method: 'eth_getCode',
      params: [address, 'latest']
    });
    
    // Simple heuristic: larger contracts more likely to be verified
    const codeSize = code.length;
    const isVerified = codeSize > 2000 && Math.random() > 0.3;
    
    return {
      isVerified: isVerified,
      creationTime: Date.now() - Math.floor(Math.random() * 90) * 86400000, // Random 0-90 days ago
      creator: '0x' + '0'.repeat(40), // Placeholder
      verificationDate: isVerified ? Date.now() - 3600000 : null
    };
  } catch (error) {
    console.error('Error checking verification:', error);
    return {
      isVerified: false,
      creationTime: Date.now(),
      creator: null
    };
  }
}

/**
 * Get transaction count for contract
 * @param {string} address - Contract address
 * @returns {Promise<number>} Transaction count
 */
async function getTransactionCount(address) {
  try {
    const count = await window.ethereum.request({
      method: 'eth_getTransactionCount',
      params: [address, 'latest']
    });
    
    return parseInt(count, 16);
  } catch (error) {
    console.error('Error getting transaction count:', error);
    return 0;
  }
}

/**
 * Get cached metadata
 * @param {string} address - Contract address
 * @returns {Promise<object|null>} Cached metadata or null
 */
async function getCachedMetadata(address) {
  return new Promise((resolve) => {
    chrome.storage.local.get([`metadata_${address}`], (result) => {
      const data = result[`metadata_${address}`];
      
      // Cache for 24 hours
      if (data && Date.now() - data.fetchedAt < 86400000) {
        resolve(data);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Cache metadata
 * @param {string} address - Contract address
 * @param {object} metadata - Metadata to cache
 * @returns {Promise<void>}
 */
async function cacheMetadata(address, metadata) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      [`metadata_${address}`]: metadata
    }, resolve);
  });
}
