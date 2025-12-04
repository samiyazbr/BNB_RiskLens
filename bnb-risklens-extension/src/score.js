/**
 * BNB RiskLens - Risk Score Calculator
 * Calculates risk score and level from rule results
 */

/**
 * Calculate risk score from rule results
 * @param {Array} ruleResults - Results from rule evaluation
 * @returns {object} Risk score and level
 */
function calculateRiskScore(ruleResults) {
  // Sum up points from triggered rules
  let totalScore = 0;
  
  ruleResults.forEach(rule => {
    if (rule.triggered) {
      totalScore += rule.points;
    }
  });
  
  // Determine risk level
  let level = 'LOW';
  
  // Check for critical combination first (forces HIGH)
  if (hasCriticalCombination(ruleResults)) {
    level = 'HIGH';
    console.log('⚠️ CRITICAL COMBINATION DETECTED: Unlimited Approval + Unverified Contract');
  } else {
    // Standard scoring
    if (totalScore >= 5) {
      level = 'HIGH';
    } else if (totalScore >= 3) {
      level = 'MEDIUM';
    } else {
      level = 'LOW';
    }
  }
  
  console.log(`📊 Risk Score: ${totalScore} | Level: ${level}`);
  
  return {
    score: totalScore,
    level: level,
    maxScore: 10, // Maximum possible score
    triggeredCount: ruleResults.filter(r => r.triggered).length,
    totalRules: ruleResults.length
  };
}

/**
 * Get risk level color
 * @param {string} level - Risk level (LOW, MEDIUM, HIGH)
 * @returns {string} Color code
 */
function getRiskLevelColor(level) {
  const colors = {
    'LOW': '#0ECB81',
    'MEDIUM': '#FF8A00',
    'HIGH': '#F6465D'
  };
  
  return colors[level] || '#B7BDC6';
}

/**
 * Get risk level recommendation
 * @param {string} level - Risk level
 * @param {string} actionType - Action type
 * @returns {string} Recommendation text
 */
function getRiskRecommendation(level, actionType) {
  const recommendations = {
    'LOW': {
      'approve': 'This token appears safe for approval. Proceed with confidence.',
      'swap': 'This token appears safe for swapping. Proceed with confidence.',
      'transfer': 'This token appears safe for transfer. Proceed with confidence.'
    },
    'MEDIUM': {
      'approve': 'Exercise caution. Consider using SafeApprove for temporary allowance.',
      'swap': 'Exercise caution. Start with a small amount to test.',
      'transfer': 'Exercise caution. Verify recipient and amount carefully.'
    },
    'HIGH': {
      'approve': '⚠️ HIGH RISK! Strongly recommend using SafeApprove or avoiding this token.',
      'swap': '⚠️ HIGH RISK! This token may be a scam. Avoid swapping.',
      'transfer': '⚠️ HIGH RISK! Be extremely careful. This token shows dangerous patterns.'
    }
  };
  
  return recommendations[level]?.[actionType] || 'Unable to determine recommendation.';
}

/**
 * Get risk score percentage
 * @param {number} score - Absolute risk score
 * @param {number} maxScore - Maximum possible score
 * @returns {number} Percentage (0-100)
 */
function getRiskScorePercentage(score, maxScore = 10) {
  return Math.round((score / maxScore) * 100);
}

/**
 * Get risk breakdown by category
 * @param {Array} ruleResults - Results from rule evaluation
 * @returns {object} Categorized risk breakdown
 */
function getRiskBreakdown(ruleResults) {
  const breakdown = {
    approval: [],
    contract: [],
    market: [],
    technical: []
  };
  
  const categoryMap = {
    'R1': 'approval',
    'R2': 'contract',
    'R3': 'contract',
    'R4': 'market',
    'R5': 'market',
    'R6': 'technical'
  };
  
  ruleResults.forEach(rule => {
    if (rule.triggered) {
      const category = categoryMap[rule.id] || 'technical';
      breakdown[category].push(rule);
    }
  });
  
  return breakdown;
}

/**
 * Compare risk scores
 * @param {object} score1 - First risk score
 * @param {object} score2 - Second risk score
 * @returns {number} -1, 0, or 1 for comparison
 */
function compareRiskScores(score1, score2) {
  const levelOrder = { 'LOW': 0, 'MEDIUM': 1, 'HIGH': 2 };
  
  const level1 = levelOrder[score1.level];
  const level2 = levelOrder[score2.level];
  
  if (level1 < level2) return -1;
  if (level1 > level2) return 1;
  
  // Same level, compare scores
  if (score1.score < score2.score) return -1;
  if (score1.score > score2.score) return 1;
  
  return 0;
}
