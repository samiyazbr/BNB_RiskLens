# RiskLens Quick Start Guide

## ✅ Correct Way to Use

### Step 1: Make Sure MetaMask is Installed
- Go to https://metamask.io
- Click "Download" or "Install"
- Follow the setup wizard

### Step 2: Visit a DeFi Website
The extension works best on DeFi websites where MetaMask is active:
- **https://app.uniswap.org** (Recommended - easiest)
- https://pancakeswap.finance
- https://app.aave.com
- https://quickswap.exchange

### Step 3: Click the RiskLens Extension Icon
- You should see the RiskLens popup
- Click "Connect MetaMask"
- A MetaMask popup will appear asking to approve the connection
- Click "Connect" in the MetaMask popup

### Step 4: You're Connected!
- You should see your wallet address
- Now you can enter a token contract address to evaluate

---

## ❌ Common Mistakes

### ❌ Clicking RiskLens from a Blank Tab
**Problem:** No website is open
**Solution:** Visit a website first, then click RiskLens

### ❌ Clicking RiskLens from a Search Engine
**Problem:** MetaMask usually not active on Google, Bing, etc.
**Solution:** Visit a DeFi site instead

### ❌ MetaMask is Locked
**Problem:** You'll see "MetaMask not available"
**Solution:** 
1. Click the MetaMask icon in your extensions bar
2. Enter your password to unlock
3. Then try RiskLens again

### ❌ MetaMask is Hidden/Not Showing
**Problem:** You can't see the MetaMask popup
**Solution:**
1. When RiskLens tries to connect, MetaMask will pop up
2. If you don't see it, check if it's behind this window
3. Or click the MetaMask icon in your extensions bar
4. Then click the RiskLens "Connect MetaMask" button again

---

## 🎯 Recommended DeFi Sites

### Best for RiskLens (Most Stable)
- **Uniswap**: https://app.uniswap.org
  - Works 100% of the time
  - Click "Connect Wallet" button first to ensure MetaMask is active
  - Then open RiskLens

### Also Works
- **PancakeSwap**: https://pancakeswap.finance
- **Aave**: https://app.aave.com
- **QuickSwap**: https://quickswap.exchange

### Why These Sites?
- They all have MetaMask integration
- MetaMask is actively injected
- Connection is reliable

---

## 🔧 Troubleshooting

### Error: "MetaMask not available on this page"

**Solution 1: Use a DeFi Site**
- Close the extension popup
- Go to https://app.uniswap.org
- Wait for page to load completely
- Click RiskLens icon

**Solution 2: Reload the Page**
- Press Ctrl+R (or Cmd+R on Mac)
- Wait for page to fully load
- Try connecting again

**Solution 3: Reload the Extension**
- Go to chrome://extensions
- Find "RiskLens"
- Toggle it OFF
- Wait 2 seconds
- Toggle it back ON
- Try connecting again

### Connection Times Out

**Solution:**
1. Check if MetaMask popup appeared
2. Approve the connection if needed
3. Make sure MetaMask is unlocked
4. Reload the page and try again

### Still Not Working?

**Step 1:** Check the debug helper
- Go to: chrome-extension://[extension-id]/debug.html
- Replace [extension-id] with your actual extension ID (shown in chrome://extensions)
- Click "Test Content Script"
- If it says "not responding", the extension needs to be reloaded

**Step 2:** Reinstall the extension
- Go to chrome://extensions
- Remove "RiskLens"
- Reinstall it
- Try again

**Step 3:** Check the console
- Press F12 to open DevTools
- Go to Console tab
- Look for messages starting with "[RiskLens"
- Take a screenshot and report to support

---

## 📱 What to Do After Connecting

### 1. Enter a Token Address
- Copy a token contract address (starts with 0x)
- Paste it into the RiskLens input field
- Click "Evaluate Risk"

### 2. Review the Results
- You'll see a risk score (0-100)
- Red level (HIGH) - Don't trade
- Yellow level (MEDIUM) - Be careful
- Green level (LOW) - Probably safe

### 3. Use SafeApprove (Optional)
- For risky tokens, use SafeApprove
- This limits how much the token can take from your wallet
- Protects you from wallet drainers

### 4. Publish Your Assessment (Optional)
- Share your assessment on the blockchain
- Help other users know about risky tokens

---

## 🎓 Key Points to Remember

1. **Must be on a website** - Not a blank tab
2. **Must be a DeFi website** - Google doesn't have MetaMask
3. **Must unlock MetaMask** - If it asks for password, unlock it
4. **Must approve connection** - MetaMask popup will appear
5. **Wait for page to load** - Give it 2-3 seconds before clicking RiskLens

---

## Quick Reference

| Issue | Fix |
|-------|-----|
| "No website open" | Visit any website first |
| "Extension page" | Visit a regular website (http/https) |
| "MetaMask not available" | Visit a DeFi site like Uniswap |
| "Connection timeout" | Reload page, make sure MetaMask unlocked |
| "Content script not responding" | Reload extension (chrome://extensions) |

---

## Support

If you still have issues:
1. Use the debug helper to diagnose
2. Run the console diagnostic script
3. Check the troubleshooting guide
4. Report with screenshots and console output
