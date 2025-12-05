# MetaMask Connection Fix

## Problem
The extension popup could not detect or connect to MetaMask because it tried to access `window.ethereum` directly, which is **not available in extension popups**. The `window.ethereum` object only exists in the context of web pages.

## Root Cause
- Extension popups run in an isolated context without access to page `window.ethereum`
- Previous code directly accessed `window.ethereum` in popup.js
- No bridge existed between the popup and the active tab's MetaMask provider

## Solution
Implemented a **three-layer bridge architecture**:

### 1. **Popup (popup.js)**
- Sends Ethereum requests to the background script via `chrome.runtime.sendMessage()`
- Uses `ethereumRequest()` helper function for all MetaMask calls
- Enhanced error messages guide users to fix issues

### 2. **Background Script (background.js)**
- Receives requests from popup
- Queries the currently active tab
- Forwards requests to the content script on that tab
- Routes responses back to popup

### 3. **Content Script (content-script.js)**
- Runs on all web pages
- Receives forwarded requests from background script
- Calls the actual `window.ethereum` on the page
- Returns results back through the chain

## Files Modified

### manifest.json
- Added `webRequest` permission
- Added `run_at: document_start` for content script
- Added `web_accessible_resources` for injected provider bridge

### popup.js
- Removed direct `window.ethereum` access
- Added `ethereumRequest()` proxy function
- Updated `connectWallet()` to use the new flow
- Added better error messages with troubleshooting steps
- Updated `handleConnection()` to work with async bridge

### background.js (REWRITTEN)
- Added `handleEthereumRequest()` function
- Gets active tab and forwards requests to content script
- Implements `checkMetaMaskAvailable()` verification
- Maintains ethereum state cache

### content-script.js (REWRITTEN)
- Detects if MetaMask exists on the page
- Implements `handleEthereumRequest()` handler
- Directly calls `window.ethereum.request()`
- Injects fallback provider for pages without MetaMask

### injected-provider.js (NEW)
- Fallback provider for pages without MetaMask
- Communicates through content script bridge
- Implements event emitters for `chainChanged` and `accountsChanged`

## How It Works

```
┌─────────────┐
│   POPUP     │
│ (popup.js)  │
└──────┬──────┘
       │ chrome.runtime.sendMessage()
       │ { action: 'ethereumRequest', payload }
       │
┌──────▼─────────────────┐
│  BACKGROUND SCRIPT      │
│  (background.js)        │
│  - Gets active tab      │
│  - Validates tab exists │
└──────┬──────────────────┘
       │ chrome.tabs.sendMessage()
       │
┌──────▼──────────────────┐
│  CONTENT SCRIPT         │
│  (content-script.js)    │
│  - Accesses window.ethereum on page
│  - Makes actual RPC call
└──────┬──────────────────┘
       │ window.ethereum.request()
       │
┌──────▼──────────────────┐
│  METAMASK PROVIDER      │
│  (on the web page)      │
│  - Processes request    │
│  - Returns response     │
└─────────────────────────┘
```

## User Instructions

### First Time Setup
1. **Install MetaMask**: Go to https://metamask.io and install the extension
2. **Visit a Website**: Open any website (e.g., Uniswap, PancakeSwap, or just any site)
3. **Open RiskLens**: Click the RiskLens extension icon
4. **Connect Wallet**: Click "Connect MetaMask" button

### Troubleshooting

**"MetaMask not detected"**
- ✅ Install MetaMask extension
- ✅ Make sure you're on a website (not a blank tab)
- ✅ Reload the page (Ctrl+R or Cmd+R)
- ✅ Make sure MetaMask is unlocked

**"Failed to connect - No active tab found"**
- ✅ Visit a website first (any website works)
- ✅ Then click the RiskLens popup button
- ✅ Click "Connect MetaMask"

**"Connection timeout"**
- ✅ Check if MetaMask popup is blocking
- ✅ Unlock MetaMask if it's locked
- ✅ Reload the page and try again

## Testing

1. Install MetaMask
2. Go to a DeFi site (Uniswap, PancakeSwap, etc.)
3. Click RiskLens icon in toolbar
4. Click "Connect MetaMask"
5. Approve the connection in the MetaMask popup
6. You should see your wallet address and be able to evaluate tokens

## Key Changes Summary

| File | Change Type | Details |
|------|------------|---------|
| manifest.json | Modified | Added permissions and resources |
| popup.js | Modified | Removed direct `window.ethereum` access, added bridge |
| background.js | Rewritten | Now routes requests through active tab |
| content-script.js | Rewritten | Handles RPC calls to actual provider |
| injected-provider.js | New | Fallback provider bridge |

## Security Notes

- All communication goes through official Chrome extension APIs
- No unsafe eval or inline scripts
- Content scripts only access `window.ethereum` (which is safe)
- Background script validates tab existence before routing

## Future Improvements

- [ ] Cache wallet connection state
- [ ] Handle multiple connected accounts
- [ ] Support other providers (WalletConnect, etc.)
- [ ] Add provider switch capability
- [ ] Implement proper TypeScript types
