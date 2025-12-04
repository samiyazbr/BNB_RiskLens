/**
 * BNB RiskLens - Liquidity Check
 * Checks token liquidity on PancakeSwap and other DEXs
 */

// PancakeSwap Router addresses
const PANCAKESWAP_ROUTERS = {
  '0x38': '0x10ED43C718714eb63d5aA57B78B54704E256024E', // BSC Mainnet
  '0x61': '0xD99D1c33F9fC3444f8101754aBC46c52416550D1', // BSC Testnet
};

// PancakeSwap Factory addresses
const PANCAKESWAP_FACTORIES = {
  '0x38': '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // BSC Mainnet
  '0x61': '0x6725F303b657a9451d8BA641348b6761A6CC7a17', // BSC Testnet
};

// WBNB addresses
const WBNB_ADDRESSES = {
  '0x38': '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c', // BSC Mainnet
  '0x61': '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd', // BSC Testnet
};

/**
 * Check liquidity for a token
 * @param {string} tokenAddress - Token contract address
 * @param {string} chainId - Chain ID
 * @returns {Promise<object>} Liquidity data
 */
async function checkLiquidity(tokenAddress, chainId) {
  console.log('💧 Checking liquidity for:', tokenAddress);
  
  try {
    // Get pair address for token/WBNB
    const pairAddress = await getPairAddress(tokenAddress, chainId);
    
    if (!pairAddress || pairAddress === '0x0000000000000000000000000000000000000000') {
      console.log('⚠️ No liquidity pool found');
      return {
        hasPool: false,
        liquidityBNB: 0,
        liquidityUSD: 0,
        pairAddress: null
      };
    }
    
    // Get reserves from the pair
    const reserves = await getPairReserves(pairAddress);
    
    // Calculate liquidity in BNB
    const liquidityBNB = calculateLiquidityBNB(reserves, tokenAddress, chainId);
    
    // Estimate USD value (using approximate BNB price)
    const bnbPriceUSD = await getBNBPrice();
    const liquidityUSD = liquidityBNB * bnbPriceUSD;
    
    console.log(`✅ Liquidity: ${liquidityBNB.toFixed(4)} BNB (~$${liquidityUSD.toFixed(2)})`);
    
    return {
      hasPool: true,
      liquidityBNB: liquidityBNB,
      liquidityUSD: liquidityUSD,
      pairAddress: pairAddress,
      reserves: reserves
    };
    
  } catch (error) {
    console.error('Error checking liquidity:', error);
    return {
      hasPool: false,
      liquidityBNB: 0,
      liquidityUSD: 0,
      error: error.message
    };
  }
}

/**
 * Get PancakeSwap pair address for token/WBNB
 * @param {string} tokenAddress - Token address
 * @param {string} chainId - Chain ID
 * @returns {Promise<string>} Pair address
 */
async function getPairAddress(tokenAddress, chainId) {
  const factoryAddress = PANCAKESWAP_FACTORIES[chainId];
  const wbnbAddress = WBNB_ADDRESSES[chainId];
  
  if (!factoryAddress || !wbnbAddress) {
    throw new Error('Unsupported network');
  }
  
  try {
    // PancakeSwap Factory ABI - getPair function
    const factoryABI = [
      {
        "constant": true,
        "inputs": [
          { "internalType": "address", "name": "tokenA", "type": "address" },
          { "internalType": "address", "name": "tokenB", "type": "address" }
        ],
        "name": "getPair",
        "outputs": [
          { "internalType": "address", "name": "pair", "type": "address" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    // Encode function call
    const data = encodeFunctionCall(
      factoryABI[0],
      [tokenAddress, wbnbAddress]
    );
    
    // Call contract
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: factoryAddress,
        data: data
      }, 'latest']
    });
    
    // Decode address from result
    return '0x' + result.slice(-40);
    
  } catch (error) {
    console.error('Error getting pair address:', error);
    return null;
  }
}

/**
 * Get reserves from liquidity pair
 * @param {string} pairAddress - Pair contract address
 * @returns {Promise<object>} Reserve data
 */
async function getPairReserves(pairAddress) {
  try {
    // Pair ABI - getReserves function
    const pairABI = [
      {
        "constant": true,
        "inputs": [],
        "name": "getReserves",
        "outputs": [
          { "internalType": "uint112", "name": "_reserve0", "type": "uint112" },
          { "internalType": "uint112", "name": "_reserve1", "type": "uint112" },
          { "internalType": "uint32", "name": "_blockTimestampLast", "type": "uint32" }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    // Encode function call
    const data = encodeFunctionCall(pairABI[0], []);
    
    // Call contract
    const result = await window.ethereum.request({
      method: 'eth_call',
      params: [{
        to: pairAddress,
        data: data
      }, 'latest']
    });
    
    // Decode reserves (simplified parsing)
    const reserve0 = BigInt('0x' + result.slice(2, 66));
    const reserve1 = BigInt('0x' + result.slice(66, 130));
    
    return {
      reserve0: reserve0,
      reserve1: reserve1
    };
    
  } catch (error) {
    console.error('Error getting reserves:', error);
    return { reserve0: 0n, reserve1: 0n };
  }
}

/**
 * Calculate liquidity in BNB
 * @param {object} reserves - Pair reserves
 * @param {string} tokenAddress - Token address
 * @param {string} chainId - Chain ID
 * @returns {number} Liquidity in BNB
 */
function calculateLiquidityBNB(reserves, tokenAddress, chainId) {
  const wbnbAddress = WBNB_ADDRESSES[chainId];
  
  // Determine which reserve is WBNB
  // In production, would check token0/token1 from pair contract
  // For simplicity, assume reserve1 is WBNB if token < WBNB alphabetically
  const tokenLower = tokenAddress.toLowerCase() < wbnbAddress.toLowerCase();
  const wbnbReserve = tokenLower ? reserves.reserve1 : reserves.reserve0;
  
  // Convert from wei to BNB (18 decimals)
  return Number(wbnbReserve) / 1e18;
}

/**
 * Get BNB price in USD (approximate)
 * @returns {Promise<number>} BNB price
 */
async function getBNBPrice() {
  try {
    // Try to get from cache first
    const cached = await getCachedBNBPrice();
    if (cached) return cached;
    
    // In production, would fetch from price oracle or API
    // For demo, use approximate value
    const approxPrice = 300; // $300 as example
    
    // Cache the price
    await cacheBNBPrice(approxPrice);
    
    return approxPrice;
  } catch (error) {
    console.error('Error getting BNB price:', error);
    return 300; // Fallback
  }
}

/**
 * Get cached BNB price
 */
async function getCachedBNBPrice() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['bnbPrice'], (result) => {
      const data = result.bnbPrice;
      
      // Cache for 5 minutes
      if (data && Date.now() - data.timestamp < 300000) {
        resolve(data.price);
      } else {
        resolve(null);
      }
    });
  });
}

/**
 * Cache BNB price
 */
async function cacheBNBPrice(price) {
  return new Promise((resolve) => {
    chrome.storage.local.set({
      bnbPrice: {
        price: price,
        timestamp: Date.now()
      }
    }, resolve);
  });
}

/**
 * Simple function call encoder
 * @param {object} abiFunction - ABI function definition
 * @param {Array} params - Function parameters
 * @returns {string} Encoded data
 */
function encodeFunctionCall(abiFunction, params) {
  // Get function signature
  const signature = abiFunction.name + '(' + 
    abiFunction.inputs.map(i => i.type).join(',') + ')';
  
  // Calculate function selector (first 4 bytes of keccak256 hash)
  // For simplicity in extension, we use pre-calculated selectors
  const selectors = {
    'getPair(address,address)': '0xe6a43905',
    'getReserves()': '0x0902f1ac'
  };
  
  let data = selectors[signature] || '0x';
  
  // Encode parameters (simplified - only handles addresses)
  params.forEach(param => {
    if (typeof param === 'string' && param.startsWith('0x')) {
      // Address parameter - pad to 32 bytes
      data += param.slice(2).padStart(64, '0');
    }
  });
  
  return data;
}
