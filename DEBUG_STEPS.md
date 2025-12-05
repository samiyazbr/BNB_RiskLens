# How to Debug MetaMask Connection Issues

## Step-by-Step Debug Instructions

### 1. **Reload the Extension**
   - Go to `chrome://extensions`
   - Find "RiskLens Extension"
   - Click the **Reload** button

### 2. **Open a DeFi Website**
   - Visit: **https://app.uniswap.org** (or Pancake Swap, Aave, etc.)
   - Wait for the page to fully load (you should see the Uniswap interface)

### 3. **Open Developer Tools (DevTools)**
   - Press **F12** or **Ctrl+Shift+I**
   - Go to the **Console** tab
   - **Keep this open** — you'll see the logs here

### 4. **Click the RiskLens Extension Icon**
   - Look for the extension icon in the Chrome toolbar
   - Click it to open the popup

### 5. **Watch the Console While Clicking "Connect MetaMask"**
   - In DevTools Console, you should see messages like:
     ```
     [RiskLens ContentScript] Content script is loading on: https://app.uniswap.org
     [RiskLens ContentScript] window.ethereum type: object
     [RiskLens ContentScript] Initial MetaMask check...
     ```
   - Then click the "Connect MetaMask" button in the popup
   - **Watch for logs that show what happens next**

### 6. **Look for These Log Patterns**

#### ✅ **If it works:**
```
[RiskLens ContentScript] 📨 Message received: action=ethereumRequest
[RiskLens ContentScript] handleEthereumRequest called with method: eth_requestAccounts
[RiskLens ContentScript] Before wait: window.ethereum = object
[RiskLens ContentScript] 🔗 Calling window.ethereum.request: eth_requestAccounts
[RiskLens ContentScript] ✅ MetaMask response for eth_requestAccounts: ...
```

#### ❌ **If it fails - possible issues:**

**Issue 1: "window.ethereum is NOT FOUND"**
```
[RiskLens ContentScript] window.ethereum type: undefined
```
- **Fix**: MetaMask extension is not installed or not enabled
- **Action**: Go to chrome://extensions and enable MetaMask

**Issue 2: "Content script not loading"**
```
[RiskLens BG] ⚠️  sendMessage error: Receiving end does not exist
```
- **Fix**: The content script didn't load on this page
- **Action**: 
  1. Reload the page (Ctrl+R)
  2. Reload the extension (chrome://extensions → Reload RiskLens)

**Issue 3: "window.ethereum NOT found after timeout"**
```
[RiskLens ContentScript] ❌ MetaMask NOT found after X attempts and 5000ms timeout
```
- **Fix**: MetaMask took longer than 5 seconds to inject
- **Action**: 
  1. Try again on a different DeFi site
  2. Make sure MetaMask is unlocked (check MetaMask icon in toolbar)

**Issue 4: "No active tab found"**
```
[RiskLens BG] ⚠️  No active tab found
```
- **Fix**: You're not on a website (maybe on a blank tab or extension page)
- **Action**: Visit a regular website first (like google.com or uniswap.org)

---

## Advanced Debugging

### Check MetaMask in Console
While on a DeFi website, open DevTools and type in the Console:

```javascript
console.log('MetaMask:', typeof window.ethereum);
console.log('MetaMask Provider:', window.ethereum?.isMetaMask);
```

Should show:
```
MetaMask: object
MetaMask Provider: true
```

If it shows `undefined`, MetaMask is not injected properly.

### Check Extension Background Logs
To see background script logs:
1. Go to `chrome://extensions`
2. Find "RiskLens Extension"
3. Click "Details"
4. Under "Inspect views", click "service worker"
5. A new DevTools window opens showing background script logs
6. Try connecting again and watch for logs like:
   ```
   [RiskLens BG] 📨 Message from popup.html, action: ethereumRequest
   [RiskLens BG] 📄 Target tab: ID=12345, URL=https://app.uniswap.org
   [RiskLens BG] 📤 Sending message to tab: 12345
   ```

---

## Checklist Before Reporting Issues

- [ ] MetaMask extension is installed (see in chrome://extensions)
- [ ] MetaMask is enabled (not disabled or grayed out)
- [ ] You've created a MetaMask wallet and are logged in
- [ ] You're visiting a normal HTTP/HTTPS website (Uniswap, PancakeSwap, Aave, etc.)
- [ ] The page is fully loaded (you see the DeFi interface)
- [ ] You've reloaded both the extension and the webpage
- [ ] DevTools Console shows logs starting with "[RiskLens"

---

## Report Issues With

When reporting that it doesn't work, please provide:

1. **Screenshot of the error message** from the popup
2. **Full console output** from DevTools (copy all logs with "[RiskLens" prefix)
3. **What DeFi site** you tried (e.g., uniswap.org, pancakeswap.finance)
4. **MetaMask status**: Is it installed? Unlocked? Do you see a wallet address in MetaMask?
5. **All the steps you took** to reproduce the issue

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| "MetaMask not detected" error | Install MetaMask extension from https://metamask.io |
| "Receiving end does not exist" | Reload the page + reload the extension |
| Connection times out | Make sure MetaMask is unlocked (check the MetaMask icon) |
| Nothing happens when clicking Connect | Open DevTools console (F12) to see logs |
| Works on Uniswap but not PancakeSwap | Check if you switched networks (MetaMask can be on different chains) |

---

Good luck! Check the Console logs first — they'll tell us exactly what's happening. 🚀
