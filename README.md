# 🔶 BNB RiskLens

**Proactive Protection - See Risk Warnings BEFORE You Click Approve**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)](https://github.com/samiyazbr/BNB_RiskLens)
[![BNB Chain](https://img.shields.io/badge/BNB-Chain-F0B90B)](https://www.bnbchain.org/)

> **🏆 Hackathon Demo Note:** This version demonstrates the concept using manual token address input and pre-deployed test tokens. The production vision (see [Full Vision](#-full-production-vision)) will automatically intercept---

## 📜 Smart Contracts scan BSCScan API in real-time, and let users approve/reject directly through MetaMask integration.

BNB RiskLens is a hackathon demo that shows how users can see clear, plain-English risk warnings before approving token interactions, using **deterministic, transparent rules**. No black-box ML. No hidden algorithms. The demo evaluates a token you provide and explains risks simply.

---

## 🖼️ Screenshots

<table>
<tr>
<td width="50%">

### Extension Popup - Risk Evaluation
![Extension Demo](https://via.placeholder.com/400x300/1e293b/F0B90B?text=Extension+Popup+Demo)
*Paste a token address and get instant risk analysis*

</td>
<td width="50%">

### Risk Warning Display
![Risk Warning](https://via.placeholder.com/400x300/fee2e2/991b1b?text=High+Risk+Warning)
*Clear warnings in plain English before you approve*

</td>
</tr>
</table>

> **Note:** Replace placeholder images above with actual screenshots of your extension in action.

---

## 🎯 Browser Compatibility

**Supported Browsers:**
- ✅ **Google Chrome** 88+ (Manifest V3)
- ✅ **Microsoft Edge** 88+ (Chromium-based)
- ✅ **Brave Browser** 1.20+
- ✅ **Opera** 74+ (Chromium-based)
- ❌ Firefox (uses different extension API - future support planned)
- ❌ Safari (different extension architecture - future support planned)

**Recommended:** Chrome 110+ for best performance and full feature support.

---

## 🔍 The Problem We Solve

Every day, crypto users lose millions to:
- 🚨 **Honeypot scams** - You can buy, but can't sell
- 💸 **Unlimited approvals** - Contracts drain your entire wallet
- 🕵️ **Unverified contracts** - Hidden malicious code
- 📉 **Rug pulls** - New tokens with no liquidity disappear overnight

**BNB RiskLens stops these scams BEFORE they happen.**

---

## 📋 Table of Contents

- [Screenshots](#️-screenshots)
- [Browser Compatibility](#-browser-compatibility)
- [The Problem We Solve](#-the-problem-we-solve)
- [Current Demo (Hackathon)](#-current-demo-hackathon)
- [Full Production Vision](#-full-production-vision)
- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
  - [Quick Start Guide](QUICKSTART.md) ⚡
- [Usage](#usage)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Risk Rules](#risk-rules)
- [Development](#development)
- [Contributing](#contributing)
- [Testing](#testing)
- [Changelog](#changelog)
- [License](#license)

---

## 🧪 Current Demo (Hackathon)

**For demonstration purposes**, this version works by:

1. **Manual Input** - User pastes a token contract address into the extension
2. **Test Tokens** - Three pre-deployed smart contracts on BNB Testnet:
   - ✅ SafeToken (`0x5a840787D29406F2Fc345a3C9660E55b85BD1a9e`)
   - ⚠️ MediumRiskToken (`0xeD20D6B4352D4DeD3Ba24433b56Fb4CFBeA8fef6`)
   - 🚨 HoneypotToken (`0x41F27B454eb379F4a3Cc5993aB85922e3fDF1e3e`)
3. **Evaluation** - Extension analyzes token using 6 deterministic rules
4. **Results** - Shows risk level with AI-powered explanation in simple English

**This demonstrates the core risk analysis engine and user experience.**

---

## 🚀 Full Production Vision

> Note: Transaction interception is part of the production vision. The current hackathon demo uses manual address input and does not auto-intercept DEX transactions yet.

### How Transaction Interception Will Work

```
1. User visits PancakeSwap/any DEX
        ↓
2. Clicks "Approve" or "Swap" button
        ↓
3. BNB RiskLens INTERCEPTS the transaction
        ↓
4. Extension queries BSCScan API for token data:
   • Contract source code verification status
   • Creation date & transaction count
   • Holder count
   • Bytecode analysis for honeypot patterns
        ↓
5. Risk Engine evaluates using deterministic rules
        ↓
6. Modal appears BEFORE MetaMask showing:
   • Risk level: ✅ LOW / ⚠️ MEDIUM / 🚨 HIGH
   • Plain English explanation of dangers
   • Specific issues detected
        ↓
7. User decides: APPROVE or REJECT
        ↓
8. If approved: MetaMask opens for signature
   If rejected: Transaction cancelled, wallet safe
```

### Key Improvements for Production (not in this demo)

- 🔗 **Automatic Interception** - No manual address input needed
- 🌐 **BSCScan API Integration** - Real-time data for ANY token
- 🔄 **Live Transaction Scanning** - Works with ALL DEXs and dApps
- 🦊 **Deep MetaMask Integration** - Seamless approve/reject flow
- ⚡ **Sub-second Analysis** - Fast enough for real-time protection
- 📱 **Multi-chain Support** - Ethereum, Polygon, Arbitrum, etc.

### Why BSCScan API?

The BSCScan API provides:
- ✅ **Contract verification status** - Is source code published?
- 📅 **Contract age** - When was it deployed?
- 📊 **Transaction history** - How active is this token?
- 👥 **Holder data** - How many people own it?
- 🔍 **Bytecode access** - Can analyze for honeypot patterns

This eliminates the need for users to manually input addresses or use test tokens.

---

## 🎯 Overview

### Current Implementation (Hackathon Demo)

BNB RiskLens consists of three main components:

1. **Chrome Extension** - Browser extension with risk evaluation engine
2. **Smart Contracts** - On-chain risk feed and demo tokens for testing
3. **Website** - Documentation and landing page built with Next.js

### Core Features

- 🔍 **6 Deterministic Risk Rules** - Transparent, verifiable evaluation criteria
- 🤖 **AI-Powered Explanations** - Complex risks explained in simple English
- 🛡️ **Real-Time Analysis** - Instant risk assessment of any token
- 📊 **Risk Feed** - Publish and query assessments on-chain
- 🦊 **MetaMask Integration** - Connected to your wallet for transaction signing
- 🔓 **100% Open Source** - All code is public and auditable

### Technology Stack (demo)

- **Frontend:** Vanilla JavaScript (Chrome Extension APIs)
- **Smart Contracts:** Solidity 0.8.20, deployed on BNB Testnet
- **Website:** Next.js 14, TailwindCSS
- **AI:** OpenAI GPT-3.5-turbo via the extension background for user-friendly explanations
- **Blockchain:** BNB Chain (Testnet for demo, Mainnet ready)

---

## ✨ Features (implemented in this repo)

### 🎯 Risk Analysis Engine (✅ Implemented)

The core of BNB RiskLens - evaluates tokens using 6 transparent, deterministic rules:

- **R1: Unlimited Approval Detection** - Warns when contracts request unlimited spending
- **R2: Unverified Contract Check** - Flags tokens without published source code  
- **R3: New Token Detection** - Identifies contracts < 30 days old with low activity
- **R4: Holder Count Analysis** - Warns about tokens with very few holders
- **R5: Liquidity Check** - Detects low liquidity that makes selling difficult (basic heuristics for the demo)
- **R6: Honeypot Pattern Detection** - Demo-only patterns to flag "buy but can't sell" risk

**Risk Levels:**
- ✅ **LOW (0-2 points)** - Token appears safe
- ⚠️ **MEDIUM (3-4 points)** - Exercise caution
- 🚨 **HIGH (5+ points)** - Dangerous, likely scam

### 🤖 AI Explanations (✅ Implemented in demo)

Complex technical risks translated into simple English:

**Instead of:**  
> "Unverified Contract, Honeypot Bytecode Pattern detected"

**You see:**
> "🚨 DANGER! You can buy this token but won't be able to sell - your money will be trapped forever. The source code is hidden so we can't verify it's safe. Click REJECT."

Powered by OpenAI GPT-3.5-turbo with custom prompts, called from the background worker. Requires you to add your API key in `bnb-risklens-extension/env.json`.

### 🦊 MetaMask Integration (✅ Implemented in demo)

- **Wallet Connection** - Seamless connection to MetaMask
- **Transaction Signing** - Approve flows that trigger actual MetaMask signatures from the popup
- **Multi-Account Support** - Works with all MetaMask accounts
- **Network Detection** - Automatically detects BNB Chain

### 📊 On-Chain Risk Feed (✅ Implemented for demo testing)

Smart contract on BNB Testnet (`0xEFB805dEA95af016B0907a606b0E6C91988Af0e8`):

- **Publish Assessments** - Share risk findings on-chain (demo contract on testnet)
- **Query Reports** - See previously published reports (demo scope)
- **Immutable Records** - All assessments permanently stored
- **Community Protection** - Help others avoid scams

### 🎨 User Interface (✅ Implemented in demo)

- **Clean Design** - Matches BNB Chain branding
- **Risk Visualization** - Clear color coding (green/yellow/red)
- **Action Buttons** - Approve/reject decision making in the extension popup
- **Responsive** - Works in extension popup

### 📈 Future Features (Production Roadmap)
 
- ⚡ **Auto-Interception** - Catch ALL transactions automatically
- 🌐 **BSCScan API** - Real-time data for any token
- 🔄 **Multi-DEX Support** - PancakeSwap, Uniswap, 1inch, etc.
- 🌍 **Multi-chain** - Ethereum, Polygon, Arbitrum, Avalanche
- 📱 **Mobile App** - iOS & Android support
- 🗳️ **Community Voting** - Let users vote on risk assessments

---

---

## 📁 Project Structure

```
BNB_RiskLens/
├── bnb-risklens-extension/          # Chrome Extension
│   ├── manifest.json                 # Extension manifest
│   ├── popup.html/js/css             # Extension UI
│   ├── background.js                 # Service worker
│   ├── content-script.js             # Injected script
│   ├── src/
│   │   ├── ruleEngine.js             # Rule evaluation logic
│   │   ├── score.js                  # Risk scoring
│   │   ├── aiInterpreter.js          # AI explanations
│   │   └── utils/
│   │       ├── fetchOnChainData.js   # Data fetching
│   │       ├── liquidityCheck.js     # DEX liquidity
│   │       └── contractMetadata.js   # Contract info
│   ├── rules/
│   │   └── registry.json             # Rule definitions
│   ├── riskFeed/
│   │   └── RiskFeed.json             # Contract ABI
│   └── assets/
│       └── icons/                    # Extension icons
│
├── contracts/                        # Smart Contracts
│   ├── contracts/
│   │   ├── RiskFeed.sol              # Risk reporting contract
│   │   ├── SafeToken.sol             # Safe demo token
│   │   ├── MediumRiskToken.sol       # Medium risk demo
│   │   └── HoneypotToken.sol         # Honeypot demo
│   ├── scripts/
│   │   └── deploy.js                 # Deployment script
│   ├── hardhat.config.js             # Hardhat configuration
│   └── package.json
│
├── bnb-risklens-website/            # Next.js Website
│   ├── pages/
│   │   ├── index.js                  # Landing page
│   │   ├── features.js               # Features page
│   │   ├── install.js                # Installation guide
│   │   ├── roadmap.js                # Roadmap
│   │   └── docs/                     # Documentation
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Footer.js
│   ├── styles/
│   │   └── globals.css
│   └── package.json
│
├── .github/                          # GitHub config
│   └── ISSUE_TEMPLATE/               # Issue templates
├── .gitignore
├── CODE_OF_CONDUCT.md
├── CONTRIBUTING.md
├── LICENSE
├── SECURITY.md
└── README.md                         # This file
```

---

## 🚀 Installation

### Prerequisites

- **Node.js** v18 or higher
- **npm** or **yarn**
- **MetaMask** browser extension
- **BNB Chain** configured in MetaMask

### Step 1: Clone the Repository

```bash
git clone https://github.com/samiyazbr/BNB_RiskLens.git
cd BNB_RiskLens
```

### Step 2: Install Dependencies

```bash
# Install all dependencies at once (recommended)
npm run install:all

# Or install individually:
cd contracts && npm install
cd ../bnb-risklens-website && npm install
cd ..
```

### Step 3: Configure Environment

#### Contracts

```bash
cd contracts
cp .env.example .env
# Edit .env and add your actual private key for deployment
```

#### Extension (OpenAI)

The Chrome extension reads API keys from a bundled `env.json` or from local storage.

```bash
cd bnb-risklens-extension
cp env.example.json env.json
# Edit env.json and add:
# {
#   "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY_HERE"
# }
```

Alternatively, you can store the key via `chrome.storage.local` (future Options page will allow setting it from the UI).

#### Website (Next.js)

```bash
cd bnb-risklens-website
cp .env.example .env.local
# Edit .env.local as needed for website configuration
```

### Step 4: Compile Smart Contracts

```bash
npm run compile
```

### Step 5: Deploy Contracts (BNB Testnet)

```bash
# Make sure you have BNB testnet tokens
# Get them from: https://testnet.bnbchain.org/faucet-smart

npm run deploy:testnet

# For local testing:
# Terminal 1: cd contracts && npm run node
# Terminal 2: npm run deploy:local
```

**Note the deployed addresses** - you'll need them for the extension!

### Step 6: Load Chrome Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable **Developer mode** (top right toggle)
3. Click **Load unpacked**
4. Select the `bnb-risklens-extension` directory
5. Pin the extension for easy access

### Step 7: Run the Website (Optional)

```bash
npm run dev:website
# Website will be available at http://localhost:3000
```

---

## 📖 Usage

### Using the Chrome Extension

1. **Connect Wallet**
   - Click the BNB RiskLens extension icon
   - Click "Connect MetaMask"
   - Approve the connection

2. **Evaluate a Token**
   - Paste the token contract address
   - Select action type (Approve/Swap/Transfer)
   - Click "Evaluate Risk"

3. **Review Results**
   - Check the risk level (LOW/MEDIUM/HIGH)
   - Review triggered rules
   - Read the AI-generated explanation (if API key is configured)

4. **Take Action**
   - Click "Execute Approve" to proceed with MetaMask transaction
   - Click "Reject" to cancel

### Testing with Demo Tokens

After deployment, you can test with the three demo tokens:

- **SafeToken** - Should score LOW risk
- **MediumRiskToken** - Should score MEDIUM risk
- **HoneypotToken** - Should score HIGH risk (honeypot detected)

---

## 🏗️ Architecture

### Risk Evaluation Flow

```
User Input (Token Address)
        ↓
Fetch On-Chain Data
  • Contract metadata
  • Holder count
  • Liquidity (PancakeSwap)
  • Bytecode analysis
        ↓
Rule Engine Evaluation
  • R1: Unlimited Approval
  • R2: Unverified Contract
  • R3: New Contract/Low Activity
  • R4: Very Few Holders
  • R5: Low Liquidity
  • R6: Honeypot Pattern
        ↓
Calculate Risk Score
  • Sum triggered rule points
  • Check critical combinations
  • Assign risk level (LOW/MEDIUM/HIGH)
        ↓
Generate Explanation
  • AI-powered simple English (if API key configured)
  • Or fallback rule-based explanations
  • Actionable recommendations
        ↓
Display Results
```

---

## 📜 Smart Contracts

### RiskFeed.sol

**Purpose:** On-chain risk reporting and querying

**Key Functions:**
- `publishRisk(address token, uint256 score, string rulesTriggered)` - Publish a risk assessment
- `getRiskReport(address token)` - Query latest report for a token
- `getReportedTokenCount()` - Get total tokens reported
- `isTokenReported(address token)` - Check if token has been reported

**Events:**
- `RiskPublished` - Emitted when new assessment is published
- `RiskUpdated` - Emitted when existing assessment is updated

**Deployment:**
- BNB Testnet: `0xEFB805dEA95af016B0907a606b0E6C91988Af0e8`
- BNB Mainnet: `Coming soon`

### Demo Tokens (BNB Testnet)

#### SafeToken.sol
✅ Standard ERC20 implementation  
✅ Verified code patterns  
✅ No honeypot tricks  
✅ Safe for testing  
**Address:** `0x5a840787D29406F2Fc345a3C9660E55b85BD1a9e`

#### MediumRiskToken.sol
⚠️ New contract with low activity  
⚠️ Few holders (< 50)  
⚠️ Simulates early-stage token  
**Address:** `0xeD20D6B4352D4DeD3Ba24433b56Fb4CFBeA8fef6`

#### HoneypotToken.sol
🚨 Trading restrictions enabled  
🚨 Only owner can transfer initially  
🚨 Classic honeypot pattern  
🚨 **FOR TESTING ONLY**  
**Address:** `0x41F27B454eb379F4a3Cc5993aB85922e3fDF1e3e`

---

## 🔍 Risk Rules

### R1: Unlimited Approval (2 points, Critical)
**Trigger:** Token requests unlimited spending permission (> 90% of max uint256)
**Risk:** Contract could drain your entire wallet at any time
**Recommendation:** Use SafeApprove instead

### R2: Unverified Contract (2 points, Critical)
**Trigger:** Contract source code not verified on BSCScan
**Risk:** Impossible to audit for malicious code
**Recommendation:** Avoid until verified

### R3: New Contract with Low Activity (1 point)
**Trigger:** Contract created < 30 days ago AND < 100 transactions
**Risk:** Unproven, could be pump-and-dump
**Recommendation:** Wait for more history

### R4: Very Few Holders (1 point)
**Trigger:** Token has < 50 unique holders
**Risk:** Low adoption, high centralization
**Recommendation:** Research thoroughly before investing

### R5: Low Liquidity (1 point)
**Trigger:** DEX liquidity < $10,000
**Risk:** High slippage, difficulty selling
**Recommendation:** Use small amounts or avoid

### R6: Honeypot Bytecode Pattern (2 points)
**Trigger:** Suspicious patterns in contract bytecode
**Risk:** You can buy but cannot sell (funds trapped)
**Recommendation:** **AVOID THIS TOKEN**

### Risk Levels

- **LOW (0-2 points):** Token appears relatively safe
- **MEDIUM (3-4 points):** Exercise caution, some red flags
- **HIGH (5+ points):** Dangerous, likely scam

**Critical Combination:** R1 + R2 (Unlimited Approval + Unverified) = **FORCED HIGH RISK**

---

## 🛠️ Development

### Prerequisites

- Node.js v18+
- Hardhat for smart contracts
- Chrome for extension development

### Running Tests

```bash
# Run smart contract tests
npm run test

# Or run directly in contracts folder
cd contracts
npx hardhat test
```

**Current Test Coverage:**
- ✅ RiskFeed contract: publish, query, update assessments
- ✅ Demo tokens: SafeToken, MediumRiskToken, HoneypotToken
- ✅ Token transfer and approval mechanics

Tests run automatically on every push via GitHub Actions.

### Local Blockchain

```bash
cd contracts
npx hardhat node
# In another terminal:
npm run deploy:local
```

### Building the Extension

The extension does not require a build step. Load it directly as unpacked in Chrome.

```bash
# Extension is ready to use from bnb-risklens-extension/ folder
# No build step needed - just load unpacked in Chrome
```

### Running the Website Locally

The Next.js website provides documentation and project information.

```bash
npm run dev:website
# Visit http://localhost:3000
```

**Website Status:** 🚧 Work in Progress
- Landing page and basic docs are functional
- Full feature showcase coming soon
- Not yet deployed to production

To build for production:
```bash
npm run build:website
npm run start:website
```

### Code Style

- **JavaScript:** ES6+ with clear comments
- **Solidity:** ^0.8.20 with NatSpec comments and SPDX headers
- **React:** Functional components with hooks
- **CSS:** TailwindCSS utility classes
- **Formatting:** Prettier (config in `.prettierrc.json`)
- **Linting:** ESLint for extension code

Run linter:
```bash
# Extension linting (if you have ESLint installed globally)
cd bnb-risklens-extension
eslint *.js src/**/*.js
```

---

## 🚢 Deployment

### Deploy Smart Contracts

#### BNB Testnet

```bash
cd contracts
npm run deploy:testnet
```

#### BNB Mainnet

```bash
cd contracts
# Update .env with mainnet RPC and private key
npm run deploy
```

### Verify Contracts on BSCScan

```bash
npx hardhat verify --network bnb_testnet DEPLOYED_ADDRESS "Constructor" "Args"
```

### Deploy Website

#### Vercel (Recommended)

```bash
cd bnb-risklens-website
npm run build
# Connect to Vercel and deploy
```

#### Manual

```bash
cd bnb-risklens-website
npm run build
npm start
# Runs on port 3000
```

### Publish Chrome Extension

1. Create developer account at [Chrome Web Store](https://chrome.google.com/webstore/devconsole)
2. Prepare assets (screenshots, promo images)
3. Zip the extension directory
4. Upload and submit for review

---

## 📊 Risk Feed Subscriber Example

Monitor risk events in real-time:

```bash
# Subscribe to real-time events
node subscriber_example.js subscribe

# Query historical reports
node subscriber_example.js history

# Query specific token
node subscriber_example.js query 0xTokenAddress
```

---

## � Testing

See [TESTING.md](TESTING.md) for comprehensive testing guide.

**Quick test:**
```bash
npm run test
```

All tests run automatically via GitHub Actions on every push.

---

## 📝 Changelog

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

---

## �🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues

1. Check existing [issues](https://github.com/samiyazbr/BNB_RiskLens/issues)
2. Create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Submitting Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Write clear, commented code
- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and well-described

### Areas for Contribution

- 🔍 New risk detection rules
- 🌐 Multi-language support
- 📱 Mobile app development
- 🎨 UI/UX improvements
- 📚 Documentation and tutorials
- 🔧 Bug fixes and optimizations

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **BNB Chain** for the robust blockchain infrastructure
- **MetaMask** for wallet integration
- **OpenAI** for GPT-3.5-turbo API
- **OpenZeppelin** for smart contract security patterns
- **Next.js** and **TailwindCSS** for the website
- **The DeFi Community** for inspiration and feedback

---

## 📈 Project Status

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/samiyazbr/BNB_RiskLens/tests.yml?branch=main&label=tests)
![GitHub](https://img.shields.io/github/license/samiyazbr/BNB_RiskLens)
![GitHub issues](https://img.shields.io/github/issues/samiyazbr/BNB_RiskLens)
![GitHub pull requests](https://img.shields.io/github/issues-pr/samiyazbr/BNB_RiskLens)

**Current Version:** 1.0.0 (Hackathon Demo)  
**Status:** Active Development  
**Last Updated:** December 2025

See [CHANGELOG.md](CHANGELOG.md) for version history.

---

## 📞 Contact & Links

- **Website:** [bnbrisklens.com](#) (Coming soon)
- **GitHub:** [github.com/samiyazbr/BNB_RiskLens](https://github.com/samiyazbr/BNB_RiskLens)
- **Twitter:** [@bnbrisklens](#)
- **Telegram:** [t.me/bnbrisklens](#)
- **Discord:** [discord.gg/bnbrisklens](#)
- **Email:** support@bnbrisklens.com

---

## ⚠️ Disclaimer

BNB RiskLens is a risk assessment tool designed to help users make informed decisions. However:

- ❗ **Not Financial Advice** - Always do your own research
- ❗ **No Guarantees** - Risk assessments are not 100% accurate
- ❗ **Use at Your Own Risk** - We are not responsible for financial losses
- ❗ **Experimental Software** - Use caution, especially with large amounts

Always invest responsibly and never invest more than you can afford to lose.

---

## 🗺️ Roadmap

See our [public roadmap](https://github.com/samiyazbr/BNB_RiskLens/projects/1) for upcoming features and milestones.

### Upcoming Features

- ✨ Additional risk rules
- 📱 Mobile app (iOS & Android)
- 🌐 Multi-chain support (Ethereum, Polygon, etc.)
- 🤖 Advanced pattern recognition
- 📊 Historical price charts
- 💬 Community voting on risk assessments

---

<div align="center">

**Built with ❤️ for the BNB Chain community**

⭐ Star this repo if you find it useful!

🔶 **BNB RiskLens** - *Transparency First, Safety Always*

</div>
