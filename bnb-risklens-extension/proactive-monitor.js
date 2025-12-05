/**
 * BNB RiskLens - Proactive Token Monitor
 * Automatically detects and analyzes tokens BEFORE user tries to approve
 * Shows risk badges and warnings directly on the DEX interface
 */

(function() {
  'use strict';

  console.log('🔶 BNB RiskLens: Proactive monitoring active');

  // Track analyzed tokens
  const analyzedTokens = new Map();
  const riskBadges = new Map();

  /**
   * Monitor the page for token addresses
   */
  function monitorPage() {
    // Look for common patterns where token addresses appear
    const selectors = [
      'input[placeholder*="token" i]',
      'input[placeholder*="address" i]',
      'div[class*="token" i]',
      'button[class*="enable" i]',
      'button[class*="approve" i]',
      'span[class*="address" i]',
      '[data-token-address]',
      '[data-address]'
    ];

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            scanForTokens(node);
          }
        });
      });
    });

    // Start observing
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // Initial scan
    scanForTokens(document.body);
  }

  /**
   * Scan a node for token addresses
   */
  function scanForTokens(node) {
    // Check if node contains text that looks like an address
    const addressRegex = /0x[a-fA-F0-9]{40}/g;
    
    if (node.textContent) {
      const matches = node.textContent.match(addressRegex);
      if (matches) {
        matches.forEach(address => {
          if (!analyzedTokens.has(address)) {
            console.log('🔍 BNB RiskLens: Found token address:', address);
            analyzeToken(address, node);
          }
        });
      }
    }

    // Check input values
    if (node.tagName === 'INPUT' && node.value) {
      const match = node.value.match(addressRegex);
      if (match) {
        const address = match[0];
        if (!analyzedTokens.has(address)) {
          console.log('🔍 BNB RiskLens: Found token in input:', address);
          analyzeToken(address, node);
        }
      }
    }

    // Check data attributes
    const dataAddress = node.getAttribute?.('data-token-address') || 
                       node.getAttribute?.('data-address');
    if (dataAddress && dataAddress.startsWith('0x')) {
      if (!analyzedTokens.has(dataAddress)) {
        console.log('🔍 BNB RiskLens: Found token in data attribute:', dataAddress);
        analyzeToken(dataAddress, node);
      }
    }
  }

  /**
   * Analyze a token and display risk badge
   */
  async function analyzeToken(tokenAddress, contextNode) {
    analyzedTokens.set(tokenAddress, 'analyzing');

    try {
      // Request evaluation from content script
      const risk = await requestTokenEvaluation(tokenAddress);
      
      analyzedTokens.set(tokenAddress, risk);
      
      // Show risk badge near the token
      showRiskBadge(tokenAddress, risk, contextNode);
      
    } catch (error) {
      console.error('❌ BNB RiskLens: Error analyzing token:', error);
      analyzedTokens.set(tokenAddress, { level: 'UNKNOWN', error: error.message });
    }
  }

  /**
   * Request token evaluation from content script
   */
  function requestTokenEvaluation(tokenAddress) {
    return new Promise((resolve) => {
      const eventId = 'risklens-eval-' + Date.now() + '-' + Math.random();
      
      // Listen for response
      const responseHandler = (event) => {
        if (event.detail && event.detail.eventId === eventId) {
          window.removeEventListener('risklens-proactive-response', responseHandler);
          resolve(event.detail.risk);
        }
      };

      window.addEventListener('risklens-proactive-response', responseHandler);

      // Request evaluation
      window.dispatchEvent(new CustomEvent('risklens-proactive-request', {
        detail: {
          eventId: eventId,
          tokenAddress: tokenAddress
        }
      }));

      // Timeout
      setTimeout(() => {
        window.removeEventListener('risklens-proactive-response', responseHandler);
        resolve({ level: 'UNKNOWN', error: 'Timeout' });
      }, 10000);
    });
  }

  /**
   * Show risk badge on the page
   */
  function showRiskBadge(tokenAddress, risk, contextNode) {
    const level = risk.level || 'UNKNOWN';
    const badgeId = 'risklens-badge-' + tokenAddress.slice(2, 10);

    // Don't create duplicate badges
    if (document.getElementById(badgeId)) return;

    const badge = document.createElement('div');
    badge.id = badgeId;
    badge.className = 'risklens-proactive-badge';
    
    // Style based on risk level
    let bgColor, textColor, emoji;
    if (level === 'LOW') {
      bgColor = '#dcfce7';
      textColor = '#166534';
      emoji = '✅';
    } else if (level === 'MEDIUM') {
      bgColor = '#fef3c7';
      textColor = '#92400e';
      emoji = '⚠️';
    } else if (level === 'HIGH') {
      bgColor = '#fee2e2';
      textColor = '#991b1b';
      emoji = '🚨';
    } else {
      bgColor = '#f3f4f6';
      textColor = '#6b7280';
      emoji = '❓';
    }

    badge.style.cssText = `
      display: inline-block;
      background: ${bgColor};
      color: ${textColor};
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 8px;
      cursor: pointer;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      z-index: 9999;
      position: relative;
    `;

    badge.textContent = `${emoji} ${level} RISK`;
    
    // Click to see details
    badge.addEventListener('click', () => {
      showRiskDetails(tokenAddress, risk);
    });

    // Try to insert near the context node
    if (contextNode && contextNode.parentNode) {
      // Find a good place to insert
      let insertTarget = contextNode;
      
      // If it's an input, insert after it
      if (contextNode.tagName === 'INPUT') {
        insertTarget = contextNode.parentNode;
      }
      
      // Insert the badge
      if (insertTarget.nextSibling) {
        insertTarget.parentNode.insertBefore(badge, insertTarget.nextSibling);
      } else {
        insertTarget.parentNode.appendChild(badge);
      }
      
      riskBadges.set(tokenAddress, badge);
    }
  }

  /**
   * Show detailed risk information
   */
  function showRiskDetails(tokenAddress, risk) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    const level = risk.level || 'UNKNOWN';
    const issues = risk.triggeredRules || [];

    modal.innerHTML = `
      <div style="
        background: white;
        border-radius: 16px;
        padding: 30px;
        max-width: 500px;
        width: 90%;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      ">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
          <h2 style="margin: 0; font-size: 24px; color: #1e293b;">🔶 Token Risk Report</h2>
          <button id="risklens-close" style="
            background: none;
            border: none;
            font-size: 28px;
            cursor: pointer;
            color: #64748b;
          ">&times;</button>
        </div>
        
        <div style="background: #f1f5f9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 12px; color: #64748b; margin-bottom: 4px;">Token Address</div>
          <div style="font-family: monospace; font-size: 13px; word-break: break-all; color: #334155;">
            ${tokenAddress}
          </div>
        </div>
        
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 18px;
            ${level === 'LOW' ? 'background: #dcfce7; color: #166534;' : ''}
            ${level === 'MEDIUM' ? 'background: #fef3c7; color: #92400e;' : ''}
            ${level === 'HIGH' ? 'background: #fee2e2; color: #991b1b;' : ''}
            ${level === 'UNKNOWN' ? 'background: #f3f4f6; color: #6b7280;' : ''}
          ">
            ${level === 'LOW' ? '✅' : level === 'MEDIUM' ? '⚠️' : level === 'HIGH' ? '🚨' : '❓'} ${level} RISK
          </div>
          ${issues.length > 0 ? `
            <div style="margin-top: 12px; font-size: 14px; color: #64748b;">
              <strong>Issues Found:</strong><br>
              ${issues.map(i => `• ${i}`).join('<br>')}
            </div>
          ` : ''}
        </div>
        
        <button id="risklens-ok" style="
          width: 100%;
          background: #F0B90B;
          color: #000;
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
        ">Got it!</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Close handlers
    modal.querySelector('#risklens-close').addEventListener('click', () => modal.remove());
    modal.querySelector('#risklens-ok').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });
  }

  // Start monitoring when page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', monitorPage);
  } else {
    monitorPage();
  }

  console.log('✅ BNB RiskLens: Proactive monitoring initialized');

})();
