/**
 * riskEngine.js
 * 
 * Pure, deterministic risk-analysis module for token safety evaluation.
 * No external dependencies or async calls.
 */

/**
 * Analyzes token risk based on 6 deterministic rules
 * @param {TokenMetadata} meta - Token metadata object
 * @returns {RiskResult} Risk analysis result
 */
function analyzeRisk(meta) {
	// Ensure meta exists and provide defaults
	const tokenData = meta || {};

	// Initialize rules array
	const rules = [];
	let totalScore = 0;

	// ===================================================================
	// RULE 1: Unlimited Approval
	// ===================================================================
	const rule1Score = tokenData.unlimitedApproval === true ? 3 : 0;
	rules.push({
		id: 'unlimited_approval',
		label: 'Unlimited Approval',
		triggered: tokenData.unlimitedApproval === true,
		score: rule1Score,
		explanation: tokenData.unlimitedApproval === true
			? 'Token requires unlimited approval, allowing unrestricted access to funds.'
			: 'Token does not require unlimited approval.'
	});
	totalScore += rule1Score;

	// ===================================================================
	// RULE 2: Unverified Contract
	// ===================================================================
	const rule2Score = tokenData.contractVerified === false ? 2 : 0;
	rules.push({
		id: 'unverified_contract',
		label: 'Unverified Contract',
		triggered: tokenData.contractVerified === false,
		score: rule2Score,
		explanation: tokenData.contractVerified === false
			? 'Contract source code is not verified on the blockchain explorer.'
			: 'Contract is verified and source code is available.'
	});
	totalScore += rule2Score;

	// ===================================================================
	// RULE 3: New + Low Activity
	// ===================================================================
	const isNew = (tokenData.ageDays || 0) < 7;
	const isLowTx = (tokenData.txCount || 0) < 50;

	let rule3Score = 0;
	let rule3Explanation = '';

	if (isNew && isLowTx) {
		rule3Score = 2;
		rule3Explanation = 'Token is very new (< 7 days) and has low transaction count (< 50).';
	} else if (isNew || isLowTx) {
		rule3Score = 1;
		rule3Explanation = isNew
			? 'Token is very new (< 7 days) but has reasonable activity.'
			: 'Token has low transaction count (< 50) but is not brand new.';
	} else {
		rule3Score = 0;
		rule3Explanation = 'Token has reasonable age and transaction activity.';
	}

	rules.push({
		id: 'new_low_activity',
		label: 'New + Low Activity',
		triggered: isNew || isLowTx,
		score: rule3Score,
		explanation: rule3Explanation
	});
	totalScore += rule3Score;

	// ===================================================================
	// RULE 4: Low Holders
	// ===================================================================
	const rule4Score = (tokenData.holderCount || 0) < 20 ? 2 : 0;
	rules.push({
		id: 'low_holders',
		label: 'Low Holders',
		triggered: (tokenData.holderCount || 0) < 20,
		score: rule4Score,
		explanation: (tokenData.holderCount || 0) < 20
			? `Token has very few holders (${tokenData.holderCount || 0}), indicating low adoption.`
			: `Token has adequate holder count (${tokenData.holderCount}).`
	});
	totalScore += rule4Score;

	// ===================================================================
	// RULE 5: Low Liquidity
	// ===================================================================
	const hasNoLiquidity = tokenData.hasLiquidity === false;
	const hasLowLiquidityBNB = (tokenData.liquidityBNB || 0) < 1;
	const rule5Score = (hasNoLiquidity || hasLowLiquidityBNB) ? 2 : 0;

	rules.push({
		id: 'low_liquidity',
		label: 'Low Liquidity',
		triggered: hasNoLiquidity || hasLowLiquidityBNB,
		score: rule5Score,
		explanation: hasNoLiquidity
			? 'Token has no liquidity pool detected.'
			: hasLowLiquidityBNB
				? `Token has insufficient liquidity (${tokenData.liquidityBNB || 0} BNB).`
				: `Token has adequate liquidity (${tokenData.liquidityBNB} BNB).`
	});
	totalScore += rule5Score;

	// ===================================================================
	// RULE 6: Honeypot Bytecode Pattern
	// ===================================================================
	const rule6Score = tokenData.honeypotPattern === true ? 3 : 0;
	rules.push({
		id: 'honeypot_pattern',
		label: 'Honeypot Bytecode Pattern',
		triggered: tokenData.honeypotPattern === true,
		score: rule6Score,
		explanation: tokenData.honeypotPattern === true
			? 'Contract bytecode contains patterns commonly found in honeypot scams.'
			: 'No honeypot patterns detected in contract bytecode.'
	});
	totalScore += rule6Score;

	// ===================================================================
	// DETERMINE RISK LEVEL
	// ===================================================================
	let riskLevel;

	// HIGH risk if score >= 5 OR (unlimited approval AND unverified contract)
	const criticalCombo = tokenData.unlimitedApproval === true && tokenData.contractVerified === false;

	if (totalScore >= 5 || criticalCombo) {
		riskLevel = 'HIGH';
	} else if (totalScore >= 3) {
		riskLevel = 'MEDIUM';
	} else {
		riskLevel = 'LOW';
	}

	// ===================================================================
	// RETURN RESULT
	// ===================================================================
	return {
		score: totalScore,
		level: riskLevel,
		rules: rules
	};
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
	module.exports = { analyzeRisk };
}

// ===================================================================
// EXAMPLE USAGE
// ===================================================================

/*
// Example 1: High-risk token
const result = analyzeRisk({
  unlimitedApproval: true,
  contractVerified: false,
  ageDays: 1,
  txCount: 10,
  holderCount: 5,
  hasLiquidity: false,
  liquidityBNB: 0,
  honeypotPattern: true
});

console.log(result);

Expected output:
{
  score: 12,
  level: 'HIGH',
  rules: [
	{
	  id: 'unlimited_approval',
	  label: 'Unlimited Approval',
	  triggered: true,
	  score: 3,
	  explanation: 'Token requires unlimited approval, allowing unrestricted access to funds.'
	},
	{
	  id: 'unverified_contract',
	  label: 'Unverified Contract',
	  triggered: true,
	  score: 2,
	  explanation: 'Contract source code is not verified on the blockchain explorer.'
	},
	{
	  id: 'new_low_activity',
	  label: 'New + Low Activity',
	  triggered: true,
	  score: 2,
	  explanation: 'Token is very new (< 7 days) and has low transaction count (< 50).'
	},
	{
	  id: 'low_holders',
	  label: 'Low Holders',
	  triggered: true,
	  score: 2,
	  explanation: 'Token has very few holders (5), indicating low adoption.'
	},
	{
	  id: 'low_liquidity',
	  label: 'Low Liquidity',
	  triggered: true,
	  score: 2,
	  explanation: 'Token has no liquidity pool detected.'
	},
	{
	  id: 'honeypot_pattern',
	  label: 'Honeypot Bytecode Pattern',
	  triggered: true,
	  score: 3,
	  explanation: 'Contract bytecode contains patterns commonly found in honeypot scams.'
	}
  ]
}

// Example 2: Low-risk token
const result2 = analyzeRisk({
  unlimitedApproval: false,
  contractVerified: true,
  ageDays: 365,
  txCount: 10000,
  holderCount: 5000,
  hasLiquidity: true,
  liquidityBNB: 100,
  honeypotPattern: false
});

console.log(result2);

Expected output:
{
  score: 0,
  level: 'LOW',
  rules: [
	{ id: 'unlimited_approval', label: 'Unlimited Approval', triggered: false, score: 0, ... },
	{ id: 'unverified_contract', label: 'Unverified Contract', triggered: false, score: 0, ... },
	{ id: 'new_low_activity', label: 'New + Low Activity', triggered: false, score: 0, ... },
	{ id: 'low_holders', label: 'Low Holders', triggered: false, score: 0, ... },
	{ id: 'low_liquidity', label: 'Low Liquidity', triggered: false, score: 0, ... },
	{ id: 'honeypot_pattern', label: 'Honeypot Bytecode Pattern', triggered: false, score: 0, ... }
  ]
}
*/
