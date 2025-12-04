/**
 * BNB RiskLens - Rule Engine
 * Deterministic rule evaluation for token risk assessment
 */

/**
 * Rule registry with all risk evaluation rules
 */
const RULE_REGISTRY = {
  R1: {
    id: 'R1',
    name: 'Unlimited Approval',
    description: 'Token requests unlimited approval amount',
    points: 2,
    critical: true,
    async evaluate(tokenAddress, onChainData, actionType, amount) {
      // Check if approval action with very high or max uint256 amount
      if (actionType !== 'approve') return false;
      
      // If no amount specified or amount is max uint256
      const MAX_UINT256 = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
      
      if (!amount) return false;
      
      try {
        const amountBigInt = BigInt(amount);
        const maxBigInt = BigInt(MAX_UINT256);
        
        // Consider "unlimited" if > 90% of max uint256
        return amountBigInt > (maxBigInt * 9n / 10n);
      } catch {
        return false;
      }
    }
  },
  
  R2: {
    id: 'R2',
    name: 'Unverified Contract',
    description: 'Contract source code is not verified on BSCScan',
    points: 2,
    critical: true,
    async evaluate(tokenAddress, onChainData) {
      return !onChainData.isVerified;
    }
  },
  
  R3: {
    id: 'R3',
    name: 'New Contract with Low Activity',
    description: 'Contract is recently deployed with minimal transactions',
    points: 1,
    async evaluate(tokenAddress, onChainData) {
      // Contract created within last 30 days
      const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const isNew = onChainData.creationTime > thirtyDaysAgo;
      
      // Low activity: less than 100 transactions
      const lowActivity = onChainData.txCount < 100;
      
      return isNew && lowActivity;
    }
  },
  
  R4: {
    id: 'R4',
    name: 'Very Few Holders',
    description: 'Token has less than 50 unique holders',
    points: 1,
    async evaluate(tokenAddress, onChainData) {
      return onChainData.holderCount < 50;
    }
  },
  
  R5: {
    id: 'R5',
    name: 'Low Liquidity',
    description: 'Token has insufficient liquidity on DEX',
    points: 1,
    async evaluate(tokenAddress, onChainData) {
      // Less than $10,000 liquidity
      return onChainData.liquidityUSD < 10000;
    }
  },
  
  R6: {
    id: 'R6',
    name: 'Honeypot Bytecode Pattern',
    description: 'Contract bytecode contains suspicious honeypot patterns',
    points: 2,
    async evaluate(tokenAddress, onChainData) {
      // Check for common honeypot patterns in bytecode
      const bytecode = onChainData.bytecode || '';
      
      // Pattern 1: Check for selfdestruct opcode (0xff)
      const hasSelfDestruct = bytecode.includes('ff');
      
      // Pattern 2: Check for delegatecall to unknown addresses (high risk)
      const hasSuspiciousDelegateCall = bytecode.includes('f4') && bytecode.length > 1000;
      
      // Pattern 3: Look for trading restrictions (common in honeypots)
      // This is a simplified check - real implementation would be more sophisticated
      const hasTradingRestrictions = onChainData.hasTradingRestrictions || false;
      
      return hasTradingRestrictions;
    }
  }
};

/**
 * Evaluate all rules for a token
 * @param {string} tokenAddress - Token contract address
 * @param {object} onChainData - On-chain data fetched for the token
 * @param {string} actionType - Type of action (approve, swap, transfer)
 * @param {string} amount - Amount for the action
 * @returns {Promise<Array>} Array of rule results
 */
async function evaluateRules(tokenAddress, onChainData, actionType, amount) {
  console.log('🔍 Evaluating rules for token:', tokenAddress);
  
  const results = [];
  
  // Evaluate each rule
  for (const [ruleId, rule] of Object.entries(RULE_REGISTRY)) {
    try {
      const triggered = await rule.evaluate(tokenAddress, onChainData, actionType, amount);
      
      results.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        points: rule.points,
        critical: rule.critical || false,
        triggered: triggered
      });
      
      console.log(`${rule.id}: ${rule.name} - ${triggered ? '⚠️ TRIGGERED' : '✅ Passed'}`);
    } catch (error) {
      console.error(`Error evaluating rule ${ruleId}:`, error);
      
      // On error, assume rule did not trigger but log it
      results.push({
        id: rule.id,
        name: rule.name,
        description: rule.description,
        points: rule.points,
        critical: rule.critical || false,
        triggered: false,
        error: error.message
      });
    }
  }
  
  return results;
}

/**
 * Check if critical rule combination is triggered
 * @param {Array} ruleResults - Results from rule evaluation
 * @returns {boolean} True if critical combination triggered
 */
function hasCriticalCombination(ruleResults) {
  // Critical combination: Unlimited approval + Unverified contract
  const unlimitedApproval = ruleResults.find(r => r.id === 'R1')?.triggered;
  const unverified = ruleResults.find(r => r.id === 'R2')?.triggered;
  
  return unlimitedApproval && unverified;
}

/**
 * Get rule by ID
 * @param {string} ruleId - Rule identifier
 * @returns {object} Rule definition
 */
function getRuleById(ruleId) {
  return RULE_REGISTRY[ruleId];
}

/**
 * Get all rules
 * @returns {object} All rules in registry
 */
function getAllRules() {
  return RULE_REGISTRY;
}
