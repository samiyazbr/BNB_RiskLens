/**
 * BNB RiskLens - AI Interpreter (Cached Explanations)
 * Provides human-readable explanations for risk assessments
 * Uses predefined explanations based on triggered rules (no black-box ML)
 */

/**
 * Get AI-style explanation for risk assessment
 * @param {Array} ruleResults - Results from rule evaluation
 * @param {object} riskScore - Calculated risk score
 * @returns {string} HTML-formatted explanation
 */
function getAIExplanation(ruleResults, riskScore) {
  const triggeredRules = ruleResults.filter(r => r.triggered);
  const { level, score } = riskScore;
  
  // Build explanation parts
  let explanation = '';
  
  // 1. Overall assessment
  explanation += getOverallAssessment(level, score, triggeredRules.length);
  
  // 2. Detailed rule explanations
  if (triggeredRules.length > 0) {
    explanation += '<div style="margin-top: 16px;"><strong>Detected Issues:</strong></div>';
    explanation += '<ul style="margin-top: 8px; padding-left: 20px;">';
    
    triggeredRules.forEach(rule => {
      const ruleExplanation = getRuleExplanation(rule.id, rule.name);
      explanation += `<li style="margin-bottom: 8px;">${ruleExplanation}</li>`;
    });
    
    explanation += '</ul>';
  }
  
  // 3. Recommendations
  explanation += getRecommendations(level, triggeredRules);
  
  return explanation;
}

/**
 * Get overall assessment text
 */
function getOverallAssessment(level, score, triggeredCount) {
  const assessments = {
    'LOW': `
      <p><strong>✅ Low Risk Assessment</strong></p>
      <p>This token has passed most safety checks with a risk score of ${score}/10. 
      ${triggeredCount === 0 ? 'No concerning patterns were detected.' : `Only ${triggeredCount} minor issue(s) detected.`}</p>
    `,
    'MEDIUM': `
      <p><strong>⚠️ Medium Risk Assessment</strong></p>
      <p>This token shows some concerning patterns with a risk score of ${score}/10. 
      ${triggeredCount} issue(s) were detected. Exercise caution and consider the risks before proceeding.</p>
    `,
    'HIGH': `
      <p><strong>🚨 High Risk Assessment</strong></p>
      <p>This token exhibits dangerous patterns with a risk score of ${score}/10. 
      ${triggeredCount} critical issue(s) were detected. We strongly recommend avoiding this token.</p>
    `
  };
  
  return assessments[level] || '<p>Unable to assess risk level.</p>';
}

/**
 * Get detailed explanation for each rule
 */
function getRuleExplanation(ruleId, ruleName) {
  const explanations = {
    'R1': `<strong>Unlimited Approval Requested:</strong> The token is requesting permission to spend an unlimited amount of your tokens. This is a common red flag and could allow the contract to drain your wallet at any time.`,
    
    'R2': `<strong>Unverified Contract:</strong> The contract's source code has not been verified on BSCScan. This makes it impossible to audit the code for malicious functions and significantly increases risk.`,
    
    'R3': `<strong>New Contract with Low Activity:</strong> This is a recently deployed contract with minimal transaction history. New tokens are higher risk as they haven't been battle-tested and could be pump-and-dump schemes.`,
    
    'R4': `<strong>Very Few Holders:</strong> The token has an unusually small number of holders (less than 50). This could indicate low adoption, high centralization, or an early-stage scam token.`,
    
    'R5': `<strong>Low Liquidity:</strong> The token has insufficient liquidity on decentralized exchanges (less than $10,000). Low liquidity means you may not be able to sell your tokens or could face extreme slippage.`,
    
    'R6': `<strong>Honeypot Pattern Detected:</strong> The contract bytecode contains patterns commonly found in honeypot scams. These tokens allow you to buy but prevent selling, trapping your funds permanently.`
  };
  
  return explanations[ruleId] || ruleName;
}

/**
 * Get recommendations based on risk level and triggered rules
 */
function getRecommendations(level, triggeredRules) {
  let recommendations = '<div style="margin-top: 16px;"><strong>💡 Recommendations:</strong></div><ul style="margin-top: 8px; padding-left: 20px;">';
  
  if (level === 'LOW') {
    recommendations += `
      <li>The token appears relatively safe, but always do your own research.</li>
      <li>Start with small amounts when interacting with any token.</li>
      <li>Monitor your approvals and revoke unused ones regularly.</li>
    `;
  } else if (level === 'MEDIUM') {
    // Check which rules triggered
    const hasUnlimitedApproval = triggeredRules.some(r => r.id === 'R1');
    const hasLowLiquidity = triggeredRules.some(r => r.id === 'R5');
    
    if (hasUnlimitedApproval) {
      recommendations += `<li>Use the <strong>SafeApprove</strong> feature to set temporary allowances instead of unlimited approval.</li>`;
    }
    
    if (hasLowLiquidity) {
      recommendations += `<li>Be aware that low liquidity may result in high slippage or inability to sell.</li>`;
    }
    
    recommendations += `
      <li>Verify the token's legitimacy through multiple sources before investing.</li>
      <li>Consider the risks carefully and only invest what you can afford to lose.</li>
    `;
  } else if (level === 'HIGH') {
    const hasHoneypot = triggeredRules.some(r => r.id === 'R6');
    const hasCriticalCombo = triggeredRules.some(r => r.id === 'R1') && triggeredRules.some(r => r.id === 'R2');
    
    if (hasHoneypot) {
      recommendations += `<li><strong>AVOID THIS TOKEN:</strong> Honeypot patterns detected. You may lose all funds.</li>`;
    }
    
    if (hasCriticalCombo) {
      recommendations += `<li><strong>CRITICAL RISK:</strong> Unlimited approval + unverified code = potential wallet drainer.</li>`;
    }
    
    recommendations += `
      <li>Do NOT approve or swap this token unless you fully understand the risks.</li>
      <li>If you've already approved, revoke the allowance immediately.</li>
      <li>Report this token to the community if you suspect it's a scam.</li>
    `;
  }
  
  recommendations += '</ul>';
  return recommendations;
}

/**
 * Get cached explanation by pattern
 * @param {string} pattern - Pattern identifier
 * @returns {string} Cached explanation
 */
function getCachedExplanationByPattern(pattern) {
  const cache = {
    'honeypot': 'This token exhibits classic honeypot behavior. Honeypots are smart contracts that allow users to deposit funds (buy tokens) but prevent withdrawals (selling). The contract may use hidden modifiers, require conditions, or whitelist mechanisms to block sells.',
    
    'rugpull': 'This token shows signs commonly associated with rug pulls. The developers may have excessive control over the contract, allowing them to remove liquidity, change token parameters, or block trading at will.',
    
    'pump_dump': 'This appears to be a potential pump-and-dump scheme. Low holder count, recent creation, and coordinated buying patterns suggest artificially inflated prices that could crash at any moment.',
    
    'safe': 'This token follows standard security practices with verified code, reasonable holder distribution, and sufficient liquidity. However, always conduct your own research before investing.',
    
    'unknown': 'Unable to definitively categorize this token. Some risk factors are present, but more analysis is needed. Proceed with extreme caution.'
  };
  
  return cache[pattern] || cache['unknown'];
}

/**
 * Generate summary for clipboard/export
 * @param {object} evaluation - Complete evaluation result
 * @returns {string} Text summary
 */
function generateSummary(evaluation) {
  const { tokenAddress, riskScore, ruleResults, timestamp } = evaluation;
  const triggeredRules = ruleResults.filter(r => r.triggered);
  
  let summary = `BNB RiskLens Risk Assessment\n`;
  summary += `${'='.repeat(50)}\n`;
  summary += `Token: ${tokenAddress}\n`;
  summary += `Risk Score: ${riskScore.score}/10\n`;
  summary += `Risk Level: ${riskScore.level}\n`;
  summary += `Date: ${new Date(timestamp).toLocaleString()}\n\n`;
  
  if (triggeredRules.length > 0) {
    summary += `Triggered Rules:\n`;
    triggeredRules.forEach(rule => {
      summary += `  - ${rule.name} (+${rule.points} points)\n`;
    });
  } else {
    summary += `No concerning patterns detected.\n`;
  }
  
  return summary;
}
