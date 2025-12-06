// injected-eip6963.js
// Runs in the page MAIN world. Bridges EIP-6963 provider access and handles
// RPC requests from the extension via window.postMessage.

(function () {
  if (window.__risklens_eip6963_injected) return;
  window.__risklens_eip6963_injected = true;

  // Helper to announce provider via EIP-6963 announce event
  function announceProvider(provider) {
    try {
      console.log('[RiskLens Injected] Announcing provider via eip6963:announceProvider');
      const evt = new CustomEvent('eip6963:announceProvider', { detail: { provider } });
      window.dispatchEvent(evt);
      try {
        // Also post a message so content scripts can detect provider quickly
        window.postMessage({ direction: 'risklens-provider-announced' }, '*');
      } catch (e) {}
    } catch (e) {
      // ignore
    }
  }

  // If a provider already exists on window, announce it
  if (typeof window.ethereum !== 'undefined' && window.ethereum) {
    console.log('[RiskLens Injected] window.ethereum exists, announcing provider');
    announceProvider(window.ethereum);
  }

  console.log('[RiskLens Injected] injected-eip6963.js initialized');

  // Respond to requestProvider events by announcing provider if available
  window.addEventListener('eip6963:requestProvider', () => {
    if (typeof window.ethereum !== 'undefined' && window.ethereum) {
      announceProvider(window.ethereum);
    }
  });

  // Listen for postMessage requests from the content script
  window.addEventListener('message', async (ev) => {
    try {
      if (!ev.data || ev.source !== window) return;
      const msg = ev.data;
      if (msg && msg.direction === 'risklens-request') {
        const id = msg.id;
        const payload = msg.payload;
        if (!payload || !payload.method) {
          window.postMessage({ direction: 'risklens-response', id, error: 'Invalid payload' }, '*');
          return;
        }

        if (typeof window.ethereum === 'undefined' || !window.ethereum) {
          window.postMessage({ direction: 'risklens-response', id, error: 'No provider available in page' }, '*');
          return;
        }

        try {
          const result = await window.ethereum.request(payload);
          window.postMessage({ direction: 'risklens-response', id, result }, '*');
        } catch (err) {
          window.postMessage({ direction: 'risklens-response', id, error: String(err) }, '*');
        }
      }
    } catch (e) {
      // swallow
    }
  });

  // === Interception: Wrap window.ethereum.request to show RiskLens modal BEFORE MetaMask ===
  try {
    if (typeof window.ethereum !== 'undefined' && window.ethereum && !window.ethereum.__risklens_patched) {
      const originalRequest = window.ethereum.request.bind(window.ethereum);

      // Detect interesting methods and payloads
      function shouldIntercept(method, params) {
        if (!method) return false;
        const m = method.toLowerCase();
        if (m === 'eth_sendtransaction') {
          const tx = Array.isArray(params) ? params[0] || {} : params || {};
          const data = (tx.data || tx.input || '').toLowerCase();
          // ERC20 approve signature 0x095ea7b3
          if (data.startsWith('0x095ea7b3')) return true;
          // Common router methods for swaps (0x38ed1739 = swapExactTokensForTokens)
          if (data.startsWith('0x38ed1739') || data.startsWith('0x18cbafe5') || data.startsWith('0x7ff36ab5')) return true;
          return false;
        }
        // Intercept personal_sign and eth_signTypedData? For now, focus on sendTransaction
        return false;
      }

      // Minimal inline modal for approval
      function showInterceptModal({ title, message, onApprove, onReject }) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.6);z-index:9999999;display:flex;align-items:center;justify-content:center;font-family:-apple-system,BlinkMacSystemFont,\'Segoe UI\',sans-serif;';
        const box = document.createElement('div');
        box.style.cssText = 'background:#fff;border-radius:14px;max-width:520px;width:92%;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,0.45);';
        box.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <div style="font-weight:700;font-size:18px;color:#111827;">🔶 BNB RiskLens</div>
            <button id="risklens-close" style="background:none;border:none;font-size:22px;color:#6b7280;cursor:pointer">&times;</button>
          </div>
          <div style="background:#f1f5f9;padding:10px;border-radius:10px;margin-bottom:14px;color:#374151;font-size:14px;">${message}</div>
          <div style="display:flex;gap:10px;">
            <button id="risklens-reject" style="flex:1;background:#fee2e2;color:#991b1b;border:none;padding:12px;border-radius:10px;font-weight:700;cursor:pointer">Reject</button>
            <button id="risklens-approve" style="flex:1;background:#F0B90B;color:#000;border:none;padding:12px;border-radius:10px;font-weight:700;cursor:pointer">Approve</button>
          </div>
        `;
        overlay.appendChild(box);
        document.body.appendChild(overlay);

        function cleanup() { overlay.remove(); }
        box.querySelector('#risklens-close').addEventListener('click', () => { cleanup(); onReject && onReject(); });
        box.querySelector('#risklens-reject').addEventListener('click', () => { cleanup(); onReject && onReject(); });
        box.querySelector('#risklens-approve').addEventListener('click', () => { cleanup(); onApprove && onApprove(); });
      }

      window.ethereum.request = async function (payload) {
        const method = payload?.method;
        const params = payload?.params || [];

        if (!shouldIntercept(method, params)) {
          return originalRequest(payload);
        }

        // Try to gather token address (to/contract) and risk from extension
        const tx = Array.isArray(params) ? params[0] || {} : params || {};
        const to = tx.to || tx.contractAddress || '';
        let risk = null;

        try {
          // Ask content script/background to evaluate token
          window.postMessage({ direction: 'risklens-intercept-eval', tokenAddress: to }, '*');
        } catch (e) {}

        // Show a simple blocking modal
        const message = 'We detected a potentially risky transaction (Approve/Swap). We will check the token first. Proceed only if you understand the risks.';

        const userDecision = await new Promise((resolve) => {
          showInterceptModal({
            title: 'BNB RiskLens',
            message,
            onApprove: () => resolve(true),
            onReject: () => resolve(false)
          });
        });

        if (!userDecision) {
          // Simulate user rejection before MetaMask opens
          const err = new Error('RiskLens blocked transaction: user rejected');
          err.code = 4001; // same as MetaMask user rejected
          throw err;
        }

        // Proceed to original MetaMask request
        return originalRequest(payload);
      };

      window.ethereum.__risklens_patched = true;
      console.log('[RiskLens Injected] Patched window.ethereum.request for interception');
    }
  } catch (e) {
    console.warn('[RiskLens Injected] Failed to patch provider:', e);
  }
})();
