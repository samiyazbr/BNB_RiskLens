# MetaMask Connection Troubleshooting Guide

## Issue: "Tab messaging error" or "Receiving end does not exist"

This error means **the content script is not loaded on the active tab**.

## Quick Checklist

- [ ] Is the active tab a **regular website** (HTTP/HTTPS)?
- [ ] Is it NOT a blank tab, extension page, or chrome:// page?
- [ ] Have you **reloaded the extension** (Ctrl+Shift+R in extensions page)?
- [ ] Have you **reloaded the webpage** (Ctrl+R)?
- [ ] Is MetaMask **installed** and **unlocked**?

## Debug Steps

### Step 1: Open the Debug Helper

1. In Chrome, go to `chrome://extensions`
2. Find "RiskLens Extension"
3. Click "Details"
4. Scroll down to "Extension pages"
5. Click on the debug.html link to open the debug helper
   - Or manually go to: `chrome-extension://<EXTENSION_ID>/debug.html`

### Step 2: Check the Status

In the debug helper, you should see:
- ✅ **MetaMask Available** - Good to proceed
- ❌ **MetaMask Not Available** - Your extension cannot find MetaMask

### Step 3: Run Tests

Click the test buttons in order:

1. **Test Content Script** - Check if content script is responding
   - If you see "Content script responsive" → Content script loaded ✅
   - If you see "not responding" → Content script not loaded ❌

2. **Test MetaMask Detection** - Check if MetaMask is available
   - Should match Step 2's status

3. **Test Ethereum Request** - Check if you can call MetaMask
   - If successful, you see a chain ID
   - If failed, MetaMask is available but blocked

## Common Issues and Fixes

### Issue: "Content script not responding"

**Problem:** Content script didn't load on the page

**Fix:**
1. Make sure you're on a **regular website** (not blank tab, about:, or chrome://)
2. Reload the extension:
   - Go to `chrome://extensions`
   - Toggle the RiskLens extension OFF
   - Wait 2 seconds
   - Toggle it back ON
3. Reload the webpage with Ctrl+R
4. Click the RiskLens icon again

### Issue: "MetaMask not available"

**Problem:** Page doesn't have MetaMask injected

**Fix:**
1. **Install MetaMask**: https://metamask.io
2. Make sure MetaMask is **unlocked**
3. Try a **DeFi website** where MetaMask is more likely to be active:
   - https://uniswap.org
   - https://pancakeswap.finance
   - https://app.aave.com
4. Reload the page

### Issue: Connection times out

**Problem:** The extension is waiting but getting no response

**Fix:**
1. Reload the page (Ctrl+R)
2. Check if a **MetaMask popup** appeared - approve it
3. Make sure MetaMask isn't showing an error
4. Try restarting MetaMask:
   - Click MetaMask icon
   - Click the account icon (top right)
   - Click "Lock"
   - Unlock with your password
5. Reload the webpage

### Issue: "Tab URL not allowed for messaging"

**Problem:** You're on an extension page or system page

**Fix:**
- Must be on a **regular website**
- Cannot be:
  - Blank tabs
  - `about:` pages
  - `chrome://` pages
  - `chrome-extension://` pages
  - `file://` pages

## Checking Browser Console

1. Open the webpage you want to use
2. Press F12 to open Developer Tools
3. Go to Console tab
4. Look for messages from "RiskLens"
5. Successful logs should show:
   ```
   [RiskLens ContentScript] Content script is loading on: https://example.com
   [RiskLens ContentScript] ✅ MetaMask DETECTED on page
   ```

## If Issues Persist

1. **Reinstall the extension**:
   - Go to `chrome://extensions`
   - Click Remove on RiskLens
   - Reload the extension from folder

2. **Check MetaMask installation**:
   - Make sure MetaMask extension is actually installed
   - Try a simple MetaMask action first (like viewing account)

3. **Try a different browser**:
   - Extensions work differently in Edge, Brave, etc.

4. **Report the issue** with:
   - Your browser version (Chrome, Edge, Brave, etc.)
   - The website you were using
   - Screenshots of the debug helper output
   - Console error messages (from F12)

## Extension Architecture

```
┌─────────────┐
│   POPUP     │ (popup.js)
│  "Connect"  │ Button clicked
└──────┬──────┘
       │ chrome.runtime.sendMessage()
       │ { action: 'ethereumRequest' }
       │
┌──────▼──────────────┐
│ BACKGROUND SCRIPT   │ (background.js)
│ - Validates tab     │
│ - Checks URL        │
│ - Forwards message  │
└──────┬──────────────┘
       │ chrome.tabs.sendMessage()
       │
┌──────▼──────────────┐
│ CONTENT SCRIPT      │ (content-script.js)
│ - Checks if loaded  │ ← Usually fails here
│ - Access window.eth │
└──────┬──────────────┘
       │ window.ethereum.request()
       │
┌──────▼──────────────┐
│ MetaMask Provider   │
│ (on web page)       │
└─────────────────────┘
```

**The failure point is usually at CONTENT SCRIPT.**

If content script didn't load on the page, nothing will work.

## Solution Overview

For the extension to work:

1. **Content script must load** on the active tab
   - Only works on regular websites (HTTP/HTTPS)
   - Not on extension pages, blank tabs, or chrome:// pages

2. **MetaMask must be installed** and available on the page
   - Usually present on DeFi websites
   - Must be unlocked

3. **User must approve** the connection request
   - MetaMask popup will appear
   - Click "Connect" or "Approve"

If any of these fail, you'll get an error. Use the debug helper to identify which step is failing.
