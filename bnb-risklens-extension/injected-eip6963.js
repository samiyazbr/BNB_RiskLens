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
})();
