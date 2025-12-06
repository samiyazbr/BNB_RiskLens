/**
 * BNB RiskLens - AI Interpreter
 * Generates human-readable explanations of risk assessments using OpenAI API
 */

// OpenAI API key is loaded and managed in the background service worker from env.json or chrome.storage.local.

// Cache for AI explanations to reduce API calls
const explanationCache = new Map();

/**
 * Generate AI explanation for risk assessment
 * @param {Array} ruleResults - Results from rule engine
 * @param {object} riskScore - Risk score object with level and score
 * @returns {Promise<string>} HTML formatted explanation
 */
async function getAIExplanation(ruleResults, riskScore) {
  // Generate cache key
  const cacheKey = generateCacheKey(ruleResults, riskScore);
  
  // Check cache first
  if (explanationCache.has(cacheKey)) {
    console.log('💾 Using cached AI explanation');
    return explanationCache.get(cacheKey);
  }
  
  // API key is handled in background; proceed to try OpenAI and fallback if background reports an error
  
  try {
    console.log('🤖 Generating AI explanation...');
    const explanation = await generateOpenAIExplanation(ruleResults, riskScore);
    
    // Cache the result
    explanationCache.set(cacheKey, explanation);
    
    return explanation;
  } catch (error) {
    console.error('❌ Error generating AI explanation:', error);
    console.error('Error details:', error.message);
    console.error('Full error:', error);
    // Fallback to rule-based explanation
    return getFallbackExplanation(ruleResults, riskScore);
  }
}

/**
 * Generate explanation using OpenAI API (via background service worker to avoid CORS)
 */
async function generateOpenAIExplanation(ruleResults, riskScore) {
  // Prepare the prompt
  const triggeredRules = ruleResults.filter(r => r.triggered);
  const passedRules = ruleResults.filter(r => !r.triggered);
  
  const prompt = buildPrompt(triggeredRules, passedRules, riskScore);
  
  console.log('📤 [aiInterpreter] Calling OpenAI API via background service worker...');
  console.log('📤 [aiInterpreter] Prompt:', prompt);
  
  try {
    // Call OpenAI via background service worker (to avoid CORS)
    const response = await chrome.runtime.sendMessage({
      action: 'callOpenAI',
      data: {
        messages: [
          {
            role: 'system',
            content: 'You are helping everyday people understand cryptocurrency risks. Explain in SIMPLE, plain English what could happen to their money. NO technical jargon. Talk like you\'re explaining to a friend who knows nothing about crypto. Focus on real-world consequences: "You could lose your money", "Your tokens might get stolen", "You won\'t be able to sell", etc. Keep it to 2-3 short sentences.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        maxTokens: 250,
        temperature: 0.8
      }
    });
    
    console.log('📥 [aiInterpreter] Background service worker response:', response);
    
    if (!response) {
      throw new Error('No response from background service worker');
    }
    
    if (!response.success) {
      throw new Error(`OpenAI API error: ${response.error}`);
    }
    
    const aiText = response.text;
    console.log('✅ [aiInterpreter] AI text received:', aiText);
    
    // Format the explanation with HTML
    return formatExplanation(aiText, riskScore);
  } catch (error) {
    console.error('❌ [aiInterpreter] Error in generateOpenAIExplanation:', error);
    throw error;
  }
}

/**
 * Build prompt for OpenAI
 */
function buildPrompt(triggeredRules, passedRules, riskScore) {
  let prompt = `A user is about to approve a token transaction. Explain what could happen to their money in SIMPLE terms:\n\n`;
  prompt += `Risk Level: ${riskScore.level}\n\n`;
  
  if (triggeredRules.length > 0) {
    prompt += `Problems found:\n`;
    triggeredRules.forEach(rule => {
      // Translate technical names to simple explanations
      const simpleName = getSimpleRuleName(rule.name);
      prompt += `- ${simpleName}\n`;
    });
  }
  
  prompt += `\nExplain in 2-3 simple sentences what could happen if they approve this. Focus on: Could they lose money? Could their tokens be stolen? Will they be able to sell? NO technical words like "bytecode", "verification", "liquidity" - just explain the danger in plain English.`;
  
  return prompt;
}

/**
 * Convert technical rule names to simple warnings
 */
function getSimpleRuleName(technicalName) {
  const translations = {
    'Unlimited Approval': 'They want unlimited access to your wallet',
    'Unverified Contract': 'Source code is hidden - can\'t verify if it\'s safe',
    'New Contract with Low Activity': 'This token is brand new with almost no users',
    'Very Few Holders': 'Almost nobody owns this token',
    'Low Liquidity': 'Very little money in this token - hard to sell',
    'Honeypot Bytecode Pattern': 'You can BUY but CANNOT SELL - money gets trapped'
  };
  
  return translations[technicalName] || technicalName;
}

/**
 * Format explanation with HTML
 */
function formatExplanation(aiText, riskScore) {
  const riskClass = riskScore.level.toLowerCase();
  const icon = getRiskIcon(riskScore.level);
  
  return `
    <div class="risk-summary ${riskClass}">
      <span class="risk-icon">${icon}</span>
      <p>${aiText}</p>
    </div>
  `;
}

/**
 * Get fallback explanation when AI is not available
 */
function getFallbackExplanation(ruleResults, riskScore) {
  const triggeredRules = ruleResults.filter(r => r.triggered);
  const level = riskScore.level;
  const icon = getRiskIcon(level);
  
  let explanation = '';
  
  if (triggeredRules.length === 0) {
    explanation = `This token passed all security checks. You can approve safely.`;
  } else {
    if (level === 'HIGH') {
      // Build specific warnings based on rules triggered - PRIORITIZE HONEYPOT
      const warnings = [];
      const criticalWarnings = [];
      
      triggeredRules.forEach(rule => {
        if (rule.name.includes('Honeypot')) {
          criticalWarnings.push('🚫 HONEYPOT TRAP: You can BUY but CANNOT SELL - money trapped forever');
        } else if (rule.name.includes('Unlimited')) {
          criticalWarnings.push('They can drain your entire wallet anytime');
        } else if (rule.name.includes('Unverified')) {
          warnings.push('Code is hidden - can\'t verify safety');
        } else if (rule.name.includes('Few Holders')) {
          warnings.push('Almost no one owns this - likely scam');
        } else if (rule.name.includes('Low Liquidity')) {
          warnings.push('Very hard to sell');
        }
      });
      
      // Combine critical warnings first, then others
      const allWarnings = [...criticalWarnings, ...warnings];
      
      explanation = `🚨 <strong>DANGER - DO NOT APPROVE!</strong> ` + 
                   allWarnings.slice(0, 2).join('. ') + '. ' +
                   `Click REJECT.`;
      
    } else if (level === 'MEDIUM') {
      // Build specific warnings for medium risk
      const warnings = [];
      
      triggeredRules.forEach(rule => {
        if (rule.name.includes('New Contract')) {
          warnings.push('Brand new token with almost no history');
        }
        if (rule.name.includes('Low Liquidity')) {
          warnings.push('Hard to sell later');
        }
        if (rule.name.includes('Few Holders')) {
          warnings.push('Very few people own this');
        }
      });
      
      explanation = `⚠️ <strong>WARNING:</strong> ` + 
                   warnings.join('. ') + '. ' +
                   `Only approve small amounts you can afford to lose.`;
      
    } else {
      // LOW risk - single specific concern
      const concern = triggeredRules[0]?.name || 'minor issue detected';
      explanation = `Minor concern: ${concern}. Generally safe, but start with small amounts if unsure.`;
    }
  }
  
  const riskClass = level.toLowerCase();
  
  return `
    <div class="risk-summary ${riskClass}">
      <span class="risk-icon">${icon}</span>
      <p>${explanation}</p>
    </div>
  `;
}

/**
 * Get risk icon based on level
 */
function getRiskIcon(level) {
  const icons = {
    'LOW': '✅',
    'MEDIUM': '⚠️',
    'HIGH': '🚨'
  };
  return icons[level] || '❓';
}

/**
 * Generate cache key from rules and score
 */
function generateCacheKey(ruleResults, riskScore) {
  const triggeredIds = ruleResults
    .filter(r => r.triggered)
    .map(r => r.id)
    .sort()
    .join(',');
  return `${riskScore.level}-${triggeredIds}`;
}

/**
 * Clear explanation cache
 */
function clearExplanationCache() {
  explanationCache.clear();
  console.log('🗑️  Explanation cache cleared');
}

// Make functions available globally
if (typeof window !== 'undefined') {
  window.getAIExplanation = getAIExplanation;
  window.clearExplanationCache = clearExplanationCache;
}
