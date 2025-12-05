# RiskLens Extension - Developer Setup & Testing Guide

## 🚀 Quick Setup for Testing

### Step 1: Load the Extension in Chrome
1. Go to `chrome://extensions`
2. Enable "Developer mode" (toggle in top right)
3. Click "Load unpacked"
4. Navigate to: `bnb-risklens-extension` folder
5. Click "Select Folder"

### Step 2: Verify Extension Loaded
- You should see "RiskLens" in the extensions list
- Copy the Extension ID (you'll need it)
- You should see the RiskLens icon in your Chrome toolbar

### Step 3: Test the Connection
1. Visit: https://app.uniswap.org
2. Click the RiskLens icon
3. Click "Connect MetaMask"
4. Approve in the MetaMask popup
5. Success! You should see your wallet address

---

## 🔍 Debugging Tools Built-In

### Debug Helper Interface
1. Copy your Extension ID from `chrome://extensions`
2. Go to: `chrome-extension://YOUR_EXTENSION_ID/debug.html`
3. Replace `YOUR_EXTENSION_ID` with your actual ID
4. You'll see buttons to test each component

### Debug Helper Tests:
- **Test Content Script**: Checks if script loaded on page
- **Check MetaMask**: Tests if window.ethereum exists
- **Test Ethereum Request**: Tests full request pipeline
- **Real-time Logs**: Shows all debug messages

### Using the Debug Helper:
1. Open a website (e.g., Uniswap)
2. Open the debug helper
3. Click "Test Content Script" - should respond
4. Click "Check MetaMask" - should detect window.ethereum
5. Click "Test Ethereum Request" - should request accounts

### Reading Debug Output:
- Green ✓ = Working
- Red ✗ = Error or not available
- Orange ⚠ = Warning or slow
- Blue ℹ = Information

---

## 💻 Console Diagnostics

### Paste Diagnostic Script
1. Go to any website with MetaMask
2. Press F12 (open DevTools)
3. Go to "Console" tab
4. Paste this code and press Enter:

```javascript
// RiskLens Diagnostic Script
console.log('[RiskLens] Starting diagnostics...');

// Check 1: URL validity
const url = window.location.href;
const isValid = url.startsWith('http://') || url.startsWith('https://');
console.log(`[RiskLens] URL Valid: ${isValid} (${url})`);

// Check 2: MetaMask presence
const hasEthereum = typeof window.ethereum !== 'undefined';
console.log(`[RiskLens] MetaMask Available: ${hasEthereum}`);

if (hasEthereum) {
  console.log(`[RiskLens] MetaMask Provider:`, window.ethereum.isMetaMask ? 'MetaMask' : 'Other');
  console.log(`[RiskLens] Chain ID:`, window.ethereum.chainId);
  console.log(`[RiskLens] Is Connected:`, window.ethereum.isConnected());
}

// Check 3: Content Script Communication
chrome.runtime.sendMessage({action: 'test'}, (response) => {
  if (chrome.runtime.lastError) {
    console.log(`[RiskLens] Content Script: ✗ Not responding (${chrome.runtime.lastError.message})`);
  } else {
    console.log(`[RiskLens] Content Script: ✓ Responding`);
  }
});

console.log('[RiskLens] Diagnostics complete. Check above for issues.');
```

### What Each Check Means:
- **URL Valid**: If false, you're on a restricted page (about:, chrome://, etc.)
- **MetaMask Available**: If false, MetaMask not injected (try Uniswap)
- **MetaMask Provider**: Shows if it's actually MetaMask or another provider
- **Chain ID**: Shows which blockchain (1=Ethereum, 56=BSC, etc.)
- **Is Connected**: Shows if you're already connected to MetaMask
- **Content Script**: If ✗, the extension didn't load on this page

---

## 🧪 Testing Scenarios

### Test 1: Normal Connection Flow
1. Visit: https://app.uniswap.org
2. Click RiskLens icon → "Connect MetaMask"
3. Approve in MetaMask popup
4. Expected: See your wallet address
5. ✓ If successful, basic connection works

### Test 2: MetaMask Timing
1. Visit: https://app.uniswap.org
2. Immediately click RiskLens (don't wait)
3. Expected: Still works (thanks to waitForMetaMask polling)
4. ✓ If successful, timing logic is correct

### Test 3: Wrong Website
1. Visit: https://google.com
2. Click RiskLens → "Connect MetaMask"
3. Expected: Error or redirect to Uniswap
4. ✓ If you get offer to open Uniswap, error handling works

### Test 4: No MetaMask
1. Disable MetaMask extension temporarily
2. Visit: https://app.uniswap.org
3. Click RiskLens → "Connect MetaMask"
4. Expected: Error + offer to open Uniswap
5. ✓ If you get Uniswap redirect, fallback works

### Test 5: Refresh While Connected
1. Connect successfully to MetaMask
2. Refresh the page (Ctrl+R)
3. Try to evaluate a token
4. Expected: Should still work without reconnecting
5. ✓ If it works, session persistence is good

---

## 📝 File Structure for Debugging

```
bnb-risklens-extension/
├── manifest.json              # Extension configuration
├── background.js              # Message routing
├── content-script.js           # Page bridge
├── popup.js                    # UI logic
├── popup.html                  # UI template
├── popup.css                   # UI styling
├── debug.html          [NEW]   # Visual debug helper
├── injected-provider.js [NEW]  # Fallback provider
├── src/
│   ├── ruleEngine.js
│   ├── score.js
│   ├── safeApprove.js
│   ├── aiInterpreter.js
│   └── utils/
└── assets/
    └── icons/
```

### Key Files to Monitor:

**manifest.json**
- Defines permissions and content script injection
- If content script not loading, check host_permissions and content_scripts

**background.js**
- Routes messages from popup to content script
- If "Receiving end does not exist" error, content script didn't load

**content-script.js**
- Bridges popup requests to MetaMask
- Has waitForMetaMask() that polls for 5 seconds
- Debug logs show all steps

**popup.js**
- UI logic and error handling
- Shows connection status and errors
- Has smart Uniswap redirect

---

## 🐛 Common Debug Scenarios

### Scenario 1: Content Script Not Loading

**Error:** "Receiving end does not exist"

**Debug steps:**
1. Open DevTools on the website (F12)
2. Go to Console tab
3. Type: `console.log('window.ethereum:', typeof window.ethereum)`
4. If undefined, MetaMask not injected

**Fix:**
- Check manifest.json host_permissions
- Verify content_scripts run_at = "document_start"
- Check URL matches http:// or https://

### Scenario 2: MetaMask Not Detected

**Error:** "MetaMask not available"

**Debug steps:**
1. Go to Uniswap (definitely has MetaMask)
2. Press F12 → Console
3. Type: `window.ethereum`
4. Should show MetaMask provider object
5. If undefined, MetaMask extension not installed

**Fix:**
- Install/enable MetaMask extension
- Reload page
- Try RiskLens again

### Scenario 3: Connection Timeout

**Error:** "Request timed out after 12 seconds"

**Debug steps:**
1. Open DevTools (F12) on Uniswap
2. Go to Console tab
3. Look for "[RiskLens" messages
4. Check which step times out
5. Look for MetaMask popup that might be hidden

**Fix:**
- Make sure MetaMask popup appeared
- Approve the connection in MetaMask
- Check if MetaMask is locked (unlock it)
- Reload page and try again

### Scenario 4: Extension Page Access Error

**Error:** "Please visit a regular website (not a blank tab, extension page, or chrome:// page)"

**Debug steps:**
1. This is expected behavior - extension can't access itself
2. It prevents messaging loops

**Fix:**
- This is not a bug - it's a security feature
- Just visit a regular website
- Try Uniswap or Google or any https site

---

## 📊 Console Log Format

All debug messages follow this format:

```
[RiskLens] [COMPONENT] [ACTION] [RESULT]
[RiskLens] Popup: Opening connection to MetaMask
[RiskLens] Background: Querying active tab
[RiskLens] Background: Tab found - checking URL
[RiskLens] Content: Checking for window.ethereum
[RiskLens] Content: MetaMask found, sending request
```

### Log Levels:
- `[RiskLens]` - Normal information
- `[RiskLens] ERROR:` - Error occurred
- `[RiskLens] WARN:` - Warning, might be an issue
- `[RiskLens] DEBUG:` - Detailed debugging info

---

## 🔧 Quick Fixes Checklist

- [ ] Extension loaded in Chrome (chrome://extensions)
- [ ] Extension ID visible and noted
- [ ] MetaMask extension installed and enabled
- [ ] Visiting a DeFi website (Uniswap, PancakeSwap, etc.)
- [ ] MetaMask is unlocked (not showing password prompt)
- [ ] Page fully loaded (wait 2-3 seconds)
- [ ] Approved MetaMask connection when popup appeared
- [ ] Extension icon visible in toolbar
- [ ] No errors in console (F12 → Console tab)

If all checked ✓ and it still doesn't work:
1. Run debug.html tests
2. Run console diagnostic script
3. Check console for [RiskLens] messages
4. Report exact error message

---

## 📤 Reporting Issues

When reporting a bug, include:

1. **Error message**: Exact text from popup or console
2. **Website**: Which site were you on? (e.g., uniswap.org)
3. **Console output**: Paste any [RiskLens] messages
4. **Debug test results**: From chrome-extension://[ID]/debug.html
5. **Reproduction steps**: Exactly how to make it happen

Example bug report:
```
Error: "MetaMask not available on this page"
Website: uniswap.org
Console: [RiskLens] Content: Waiting for MetaMask... (5000ms timeout reached)
Debug: "Check MetaMask" shows ✗ Not available
Steps: 1. Go to uniswap.org 2. Click RiskLens 3. Error appears
```

---

## 🎯 Next Steps

1. **Load the extension** (Step 1 above)
2. **Test basic connection** (Test 1 scenario)
3. **Use debug helper** (if issues)
4. **Check console logs** (open DevTools)
5. **Report any issues** with complete info

Good luck! 🚀
