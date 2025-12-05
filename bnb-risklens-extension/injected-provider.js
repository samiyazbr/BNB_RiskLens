/**
 * BNB RiskLens - Injected Provider Bridge
 * This script runs in the context of web pages and exposes MetaMask provider
 * or provides a fallback that communicates with the extension
 */

(function() {
  'use strict';

  console.log('🔶 BNB RiskLens injected provider bridge loaded');

  // Check if MetaMask is already available
  if (typeof window.ethereum !== 'undefined') {
    console.log('✅ MetaMask provider already available');
    return; // MetaMask is already injected, we're good
  }

  let requestId = 0;
  const requests = new Map();

  /**
   * Create a proxy provider that uses the extension's Ethereum bridge
   */
  const ethereumProvider = {
    // Standard MetaMask properties
    isMetaMask: true,
    isConnected: () => true,
    selectedAddress: null,
    chainId: '0x38',
    networkVersion: '56',

    /**
     * Main request handler that communicates with content script
     */
    request: async (args) => {
      return new Promise((resolve, reject) => {
        const id = requestId++;
        const { method, params = [] } = args;

        console.log('🔗 Provider request:', method);

        // Send request through content script to background
        window.postMessage({
          type: 'ETHEREUM_REQUEST',
          id,
          payload: { method, params },
          fromPage: true
        }, '*');

        // Set up response listener
        const handleMessage = (event) => {
          if (event.source !== window) return;
          if (event.data.type !== 'ETHEREUM_RESPONSE') return;
          if (event.data.id !== id) return;

          window.removeEventListener('message', handleMessage);
          requests.delete(id);
          clearTimeout(timeoutId);

          const result = event.data.result;
          
          // Handle successful responses
          if (result && !result.error) {
            resolve(result);
          } else if (result && result.error) {
            reject(new Error(result.error));
          } else {
            reject(new Error('Unknown error'));
          }
        };

        const timeoutId = setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          requests.delete(id);
          reject(new Error(`Ethereum request timeout: ${method}`));
        }, 15000);

        window.addEventListener('message', handleMessage);
        requests.set(id, true);
      });
    },

    /**
     * Event emitter methods
     */
    on: (eventName, callback) => {
      ethereumProvider._on(eventName, callback);
    },

    off: (eventName, callback) => {
      ethereumProvider._off(eventName, callback);
    },

    once: (eventName, callback) => {
      ethereumProvider._once(eventName, callback);
    },

    removeListener: (eventName, callback) => {
      ethereumProvider._off(eventName, callback);
    },

    /**
     * Event management
     */
    _events: {},
    _on(eventName, callback) {
      if (!this._events[eventName]) {
        this._events[eventName] = [];
      }
      this._events[eventName].push(callback);
    },

    _off(eventName, callback) {
      if (!this._events[eventName]) return;
      this._events[eventName] = this._events[eventName].filter(cb => cb !== callback);
    },

    _once(eventName, callback) {
      const wrapped = (...args) => {
        callback(...args);
        this._off(eventName, wrapped);
      };
      this._on(eventName, wrapped);
    },

    _emit(eventName, ...args) {
      if (!this._events[eventName]) return;
      this._events[eventName].forEach(callback => {
        try {
          callback(...args);
        } catch (error) {
          console.error(`Error in ${eventName} handler:`, error);
        }
      });
    }
  };

  /**
   * Listen for provider events from content script
   */
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;

    if (event.data.type === 'PROVIDER_EVENT') {
      const { eventName, data } = event.data;
      if (eventName === 'chainChanged') {
        ethereumProvider.chainId = data;
        ethereumProvider._emit('chainChanged', data);
      } else if (eventName === 'accountsChanged') {
        ethereumProvider.selectedAddress = data[0] || null;
        ethereumProvider._emit('accountsChanged', data);
      }
    }
  });

  /**
   * Inject the provider into the page's window object
   */
  try {
    Object.defineProperty(window, 'ethereum', {
      value: ethereumProvider,
      writable: false,
      configurable: true // Allow overwrite by MetaMask if it loads later
    });
    console.log('✅ Ethereum provider bridge injected successfully');
  } catch (error) {
    console.error('❌ Failed to inject provider:', error);
  }
})();

