# RiskLens Extension - Complete Architecture Guide

## 🏗️ System Architecture Overview

### Problem: How Extension Connects to MetaMask

Chrome extensions live in an isolated context separate from web pages. MetaMask only injects `window.ethereum` into web pages, not extension popups. This creates a challenge: **the extension popup can't directly talk to MetaMask**.

### Solution: Three-Layer Message Bridge

```
┌─────────────────────────────────────────────────────────────────┐
│                     Browser Context                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────┐         ┌──────────────────┐  ┌──────────────┐ │
│  │   Popup     │◄────────►│ Background.js    │  │ MetaMask     │ │
│  │  (Isolated) │         │ (Service Worker) │  │ Extension    │ │
│  │             │         │                  │  │              │ │
│  └─────────────┘         └──────────────────┘  └──────────────┘ │
│        ▲                         ▲                       ▲        │
│        │ chrome.runtime.         │ chrome.tabs.         │        │
│        │ sendMessage()           │ sendMessage()        │ Injects│
│        │                         │                      │        │
│        │                         ▼                      │        │
│        │                   ┌──────────────────┐         │        │
│        │                   │  Content Script  │────────► Listens │
│        │                   │  (On Web Page)   │         for      │
│        └──────────────────►│                  │         requests │
│                            │ window.ethereum  │         ◄─────────┤
│                            │ available here!  │                   │
│                            └──────────────────┘                   │
│                                                                   │
│  Example: User visits https://app.uniswap.org                    │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📡 Message Flow: Connect MetaMask

### Step 1: User Clicks "Connect MetaMask"
```
User in Popup:
  Click "Connect MetaMask" button
  ↓
popup.js: connectWallet() function
  ↓
Send message: { action: 'connectWallet' }
```

### Step 2: Background Script Routes Request
```
background.js receives message:
  ↓
validateURL(): Is this a valid website?
  ✓ Valid: http:// or https://
  ✗ Invalid: chrome://, extension://, about:, etc.
  ↓ (if valid)
getActiveTab(): Get currently active tab
  ↓
sendMessage() to content-script.js
  with 10-second timeout
```

### Step 3: Content Script Finds MetaMask
```
content-script.js receives message:
  ↓
handleEthereumRequest():
  ↓
waitForMetaMask(): 
  Polls for 5 seconds
  Checks every 100ms for window.ethereum
  ✓ Found: Great! Use it
  ✗ Not found: Try anyway or error
  ↓
Call: window.ethereum.request(...)
  ↓
Send response back to popup
  ↓
popup.js receives response:
  Show wallet address or error
```

### Step 4: MetaMask Popup (User's Device)
```
MetaMask Extension detects request:
  ↓
Show popup: "RiskLens wants to connect"
  ↓
User clicks "Connect":
  MetaMask returns accounts
  ↓
Response goes back through content-script
  ↓
Goes back to popup.js
  ↓
Popup shows: Your wallet address ✓
```

---

## 🔑 Key Components Explained

### 1. Popup (popup.js)
**Location:** Extension popup window (what user sees)
**Context:** Completely isolated from web pages
**Limitation:** Can't access `window.ethereum` directly

```javascript
// What popup.js does:
async function connectWallet() {
  // Can't do this: window.ethereum.request(...)  ✗ FAILS
  
  // Instead, asks background script:
  const result = await chrome.runtime.sendMessage({
    action: 'ethereumRequest',
    data: { method: 'eth_requestAccounts' }
  });
}
```

**Responsibilities:**
- Display UI to user
- Send requests to background script
- Show results or errors
- Smart Uniswap redirect if MetaMask unavailable

---

### 2. Background Script (background.js)
**Location:** Service worker (runs in background, not tied to any tab)
**Purpose:** Route messages between popup and content scripts
**Key Feature:** Can access all tabs via `chrome.tabs` API

```javascript
// What background.js does:
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Message from popup received
  // Need to route to the active web page (content script)
  
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    // Now we know which tab is active
    // Send message to that tab's content script
    chrome.tabs.sendMessage(tabs[0].id, request, {timeout: 10000}, response => {
      // Response from content script received
      // Send back to popup
      sendResponse(response);
    });
  });
});
```

**Responsibilities:**
- Route messages between popup and content scripts
- Validate URLs before sending messages
- Handle timeouts and errors
- Provide detailed logging
- Prevent messaging invalid tabs (chrome://, extension://, etc.)

**URL Validation:**
```javascript
function isValidTabForMessaging(url) {
  const url_str = url.toString();
  
  // Only allow http and https
  return url_str.startsWith('http://') || url_str.startsWith('https://');
}
```

---

### 3. Content Script (content-script.js)
**Location:** Runs on web pages (the actual website the user visits)
**Power:** Can access `window.ethereum` because it runs in page context
**Key Feature:** Can wait for MetaMask to inject itself

```javascript
// What content-script.js does:
// This runs on the actual webpage, so we CAN access window.ethereum!

async function waitForMetaMask(maxWaitTime = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (checkForMetaMask()) {
      debugLog('MetaMask detected!');
      return true;
    }
    // Wait 100ms then check again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return false; // Timeout reached
}

// Message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleEthereumRequest(request).then(sendResponse);
  return true; // Keep channel open for async response
});

async function handleEthereumRequest(request) {
  // Wait for MetaMask to be available
  await waitForMetaMask();
  
  // Now we can safely call window.ethereum.request()
  const result = await window.ethereum.request(request.data);
  
  return { success: true, data: result };
}
```

**Responsibilities:**
- Bridge between popup and MetaMask
- Detect when MetaMask is available
- Wait for MetaMask to inject (polls every 100ms, max 5 seconds)
- Make actual Ethereum requests
- Send responses back to popup
- Provide comprehensive logging

---

## ⏱️ Timing: Why We Wait for MetaMask

### The Problem
Content scripts run at `document_start` (very beginning of page load).
MetaMask injects itself during `document_end` (after page is loaded).

This creates a race condition:

```
Timeline:

document_start:  Content script loads ✓
    ↓            content-script.js runs
    ↓            Checks for window.ethereum... NOT FOUND YET ✗
    ↓
    ↓ (waiting for page to fully load...)
    ↓
document_end:    Page finished loading
    ↓            MetaMask injects window.ethereum NOW ✓
    ↓            MetaMask is available
    ↓
    ↓ (too late - we already checked!)
    ↓
Page interactive: User can see and interact with page
    ↓            User clicks "Connect" button
    ↓            We make request NOW ✓
```

### The Solution: Poll for MetaMask

Instead of checking once, keep checking until found:

```javascript
async function waitForMetaMask(maxWaitTime = 5000) {
  const startTime = Date.now();
  
  while (Date.now() - startTime < maxWaitTime) {
    if (typeof window.ethereum !== 'undefined') {
      // Found it!
      return true;
    }
    
    // Not found yet, wait 100ms and try again
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // 5 seconds have passed, give up
  return false;
}
```

This means even if we get a request right after page load, we'll wait up to 5 seconds for MetaMask to inject itself before saying "not available".

---

## 🚦 Error Handling: All Error Scenarios

### Error 1: No Website Open
```
User on: about:blank
Error: "Please visit a regular website"
Why: Can't message tabs that aren't http/https
Fix: User visits a real website
```

### Error 2: Extension Page
```
User on: chrome-extension://[id]/popup.html
Error: "Please visit a regular website (not an extension page)"
Why: Content scripts don't run on extension pages
Fix: User visits a regular website
```

### Error 3: Tab Messaging Failed
```
Error: "Tab messaging error: Receiving end does not exist"
Why: Content script didn't load on this tab
Fix: Reload page, check manifest.json, verify URL is http/https
```

### Error 4: MetaMask Not Available
```
Error: "MetaMask not available on this page"
Why: 
  - MetaMask not installed, OR
  - Website doesn't have MetaMask, OR
  - MetaMask didn't inject in 5-second timeout
Fix: 
  - Offer to open Uniswap (where MetaMask definitely works)
  - Suggest visiting a DeFi site
```

### Error 5: Request Timeout
```
Error: "Request timed out after 12 seconds"
Why:
  - MetaMask popup hidden/not visible
  - MetaMask locked (asking for password)
  - Network issue
Fix:
  - Check for MetaMask popup
  - Unlock MetaMask
  - Reload and try again
```

### Error 6: User Rejected
```
Error: "User rejected request"
Why: User clicked "Reject" in MetaMask popup
Fix: This is expected - try again if needed
```

---

## 🔄 Complete Request Cycle (Timeline)

### User starts: Visits Uniswap, clicks RiskLens

```
Time    Component          Action
────────────────────────────────────────────────────────────────
0ms     User               Visits https://app.uniswap.org
10ms    Page               Starts loading
20ms    Content Script     Loads at document_start
30ms                       Checks for window.ethereum → NOT FOUND
40ms    Popup              Loads (user clicks extension icon)
100ms   User               Clicks "Connect MetaMask" button
105ms   popup.js           Sends message to background.js
110ms   background.js      Receives message
115ms                      chrome.tabs.query() finds active tab
120ms                      Validates URL: "https://..." → VALID ✓
125ms                      chrome.tabs.sendMessage() to content-script
130ms   content-script.js  Receives message
135ms   handleEthereumRequest() Calls waitForMetaMask()
140ms   waitForMetaMask()   First check: window.ethereum → NOT YET
240ms                       Second check (after 100ms): NOT YET
340ms                       Third check (after 100ms): FOUND! ✓
345ms                       Calls window.ethereum.request({...})
350ms   MetaMask           Receives request
355ms   MetaMask UI        Shows popup: "RiskLens wants to connect"
400ms   User               Clicks "Connect" in MetaMask
405ms   MetaMask           Returns accounts: ["0x123..."]
410ms   content-script.js  Sends response to background.js
415ms   background.js      Receives response
420ms   background.js      Sends to popup.js
425ms   popup.js           Receives response
430ms   UI                 Shows wallet address ✓

Total time: ~330ms (most of it is MetaMask UI)
```

---

## 📊 Data Flow: Token Evaluation

After connection successful, here's how evaluating a token works:

```
popup.js
  User enters token address
  ↓ Calls evaluateToken(address)
  ↓
background.js
  Receives: { action: 'evaluateToken', address: '0x...' }
  ↓
src/score.js
  Calculates risk score using rules
  ↓
Returns: { riskLevel: 'high', score: 78 }
  ↓
popup.js
  Shows result: 🔴 HIGH RISK (78/100)
  ↓
src/safeApprove.js (optional)
  User can click "Safe Approve"
  ↓
Calls: window.ethereum.request({
  method: 'eth_sendTransaction',
  params: [{ to: '0x...', data: '0x...', value: '0' }]
})
  ↓
MetaMask shows: "Sign transaction?"
  ↓
User approves/rejects
```

---

## 🛡️ Security Considerations

### 1. Content Script Isolation
```
✓ Content scripts run in "isolated world"
✓ Can't access page's JavaScript directly
✓ Can access window.ethereum (injected by MetaMask)
✓ Safe to send MetaMask requests through
```

### 2. Message Passing Validation
```
✓ Background validates tab URL before messaging
✓ Rejects chrome://, extension://, about:, etc.
✓ Only allows http:// and https://
✓ Prevents extension accessing itself
```

### 3. Timeout Protection
```
✓ All messages have 10-12 second timeout
✓ Prevents hanging if content script crashes
✓ Prevents hanging if MetaMask unresponsive
```

### 4. MetaMask Trust
```
✓ We don't modify requests - pass directly to MetaMask
✓ We don't store private keys
✓ We don't store accounts (except display)
✓ MetaMask handles all security/signing
```

---

## 🔧 Configuration: manifest.json

### Key Settings

```json
{
  "manifest_version": 3,
  
  "permissions": [
    "activeTab",
    "scripting",
    "tabs"
  ],
  
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  
  "content_scripts": [
    {
      "matches": [
        "http://*/*",
        "https://*/*"
      ],
      "js": ["content-script.js"],
      "run_at": "document_start",
      "all_frames": false
    }
  ],
  
  "background": {
    "service_worker": "background.js"
  }
}
```

### What Each Setting Does:

| Setting | Purpose |
|---------|---------|
| `host_permissions: ["http://*/*", "https://*/*"]` | Allow messaging tabs on all http/https sites |
| `content_scripts.run_at: "document_start"` | Load content script very early (before MetaMask) |
| `all_frames: false` | Only load in main frame, not iframes |
| `matches: ["http://*/*", "https://*/*"]` | Match all normal websites |

---

## 📈 Performance & Optimization

### Current Performance Characteristics

```
Action              Time        Bottleneck
──────────────────────────────────────────
Content load        ~50ms       Network
MetaMask wait       ~100-300ms  MetaMask injection timing
MetaMask popup      ~250-500ms  User interaction
Total request       ~400-800ms  MetaMask UI display
```

### Why It's Fast Enough

✓ Content script loads before page visible (~20ms)
✓ Message routing is instant (~5ms per hop)
✓ MetaMask injection is early (~100ms)
✓ Total overhead is <50ms

---

## 🧪 Testing Each Component Independently

### Test 1: Content Script Loads
```javascript
// In browser console:
chrome.runtime.sendMessage({action: 'test'}, response => {
  console.log(response ? '✓ Loaded' : '✗ Failed');
});
```

### Test 2: MetaMask Available
```javascript
console.log(window.ethereum ? '✓ MetaMask' : '✗ Not available');
```

### Test 3: Full Request
```javascript
window.ethereum.request({method: 'eth_requestAccounts'})
  .then(accounts => console.log('✓ Connected:', accounts[0]))
  .catch(err => console.log('✗ Error:', err.message));
```

---

## 📚 References

### Chrome Extension APIs Used:
- `chrome.runtime.onMessage` - Receive messages
- `chrome.runtime.sendMessage` - Send messages
- `chrome.tabs.query` - Find tabs
- `chrome.tabs.sendMessage` - Message specific tab

### MetaMask APIs Used:
- `window.ethereum.request()` - Make requests
- `window.ethereum.on()` - Listen for events
- `eth_requestAccounts` - Get user's accounts
- `eth_sendTransaction` - Send transactions

---

## 🎯 Architecture Strengths

1. ✅ **Isolated Contexts**: Extension can't break web pages
2. ✅ **Secure**: MetaMask still handles all signing
3. ✅ **Reliable**: Waiting for MetaMask reduces timing bugs
4. ✅ **Observable**: Detailed logging at each step
5. ✅ **Resilient**: Timeouts prevent hanging
6. ✅ **User-Friendly**: Smart redirects and error messages

---

## 🚀 Future Improvements

1. **Multi-Tab Support**: Remember connected account across tabs
2. **Chain Detection**: Show which blockchain you're on
3. **Transaction History**: Show past RiskLens evaluations
4. **Advanced Debug**: Built-in debugger in popup
5. **Provider Fallback**: Support other wallet providers

---

## 📞 Support

If you understand this architecture and want to debug issues:
1. Trace through the timeline for your scenario
2. Check which component is failing
3. Look at that component's code
4. Add console.log() for debugging
5. Check the logs in DevTools

Good luck! 🚀
