# 🔶 BNB RiskLens

**Proactive Protection - See Risk Warnings BEFORE You Click Approve**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-brightgreen)](https://github.com/samiyazbr/BNB_RiskLens)
[![BNB Chain](https://img.shields.io/badge/BNB-Chain-F0B90B)](https://www.bnbchain.org/)

BNB RiskLens is a comprehensive security tool that **automatically detects tokens on DEX pages** and shows risk badges using **deterministic, transparent rules**. No black-box machine learning. No hidden algorithms. Just proactive warnings with clear, verifiable risk assessment.

## 🎉 **Proactive Token Detection!**

BNB RiskLens **automatically scans DEX pages** and shows risk badges the moment tokens appear - **BEFORE you click approve**!

- ✅ **Proactive Detection** - Scans pages for token addresses automatically
- ✅ **Instant Risk Badges** - Shows ✅ LOW / ⚠️ MEDIUM / 🚨 HIGH inline badges
- ✅ **See Warnings First** - Risk appears BEFORE you interact with approve buttons
- ✅ **Zero Effort** - No need to manually open the extension or paste addresses

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Architecture](#architecture)
- [Smart Contracts](#smart-contracts)
- [Risk Rules](#risk-rules)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

BNB RiskLens consists of three main components:

1. **Chrome Extension** - Browser extension for real-time token risk evaluation
2. **Smart Contracts** - On-chain risk feed and demo tokens (Safe, Medium Risk, Honeypot)
3. **Website** - Documentation and landing page built with Next.js

### Key Capabilities

- ⚡ **Proactive Token Detection** - Automatically scans DEX pages for token addresses
- 🏷️ **Instant Risk Badges** - Visual badges (✅/⚠️/🚨) appear before you click approve
- 🛡️ **Real-Time Protection** - Risk warnings shown BEFORE any interaction
- 🔍 **6 Deterministic Risk Rules** - Transparent evaluation criteria
- 🚨 **Unlimited Approval Warnings** - Big red alerts for dangerous permissions
- 📊 **On-Chain Risk Feed** - Publish and query risk assessments on the blockchain
- 🔓 **100% Open Source** - All code is public and auditable

---

## ✨ Features

### 🎯 Automatic Transaction Interception

**The main feature!** BNB RiskLens automatically intercepts when you try to approve a token:

1. **You visit any DEX** (PancakeSwap, Uniswap, etc.)
2. **Click "Approve" or "Enable"** for a token
3. **BNB RiskLens intercepts** before MetaMask
4. **Beautiful modal appears** showing:
   - Token address & spender contract
   - Risk level: ✅ LOW / ⚠️ MEDIUM / 🚨 HIGH
   - Specific issues detected
   - Big warning for unlimited approvals
5. **You decide:** Approve or Reject
6. **Only then** does MetaMask appear (if you approved)

### Chrome Extension

- 🔗 MetaMask integration
- 🔍 Token risk evaluation with 6 deterministic rules
- 🛡️ SafeApprove flow for secure approvals
- 📊 Risk score visualization (LOW/MEDIUM/HIGH)
- 📤 Publish assessments to on-chain Risk Feed
- 💾 Local caching for performance
- 🎨 Beautiful UI matching BNB Chain branding

### Smart Contracts

- **RiskFeed.sol** - On-chain risk reporting and querying
- **SafeToken.sol** - Demo token with safe, verified behavior
- **MediumRiskToken.sol** - Demo token with medium risk characteristics
- **HoneypotToken.sol** - Demo honeypot token for testing

### Website

- 🎨 Modern Next.js site with TailwindCSS
- 📖 Comprehensive documentation
- 🚀 Feature showcase
- 📥 Installation guide
- 🗺️ Public roadmap

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
│   │   ├── aiInterpreter.js          # Cached explanations
│   │   ├── safeApprove.js            # SafeApprove flow
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
├── subscriber_example.js             # Risk Feed subscriber
├── package.json                      # Root package.json
├── .gitignore
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
# Install all dependencies (root, contracts, website)
npm run install:all

# Or install individually:
npm install                           # Root
cd contracts && npm install           # Contracts
cd ../bnb-risklens-website && npm install  # Website
```

### Step 3: Configure Environment

```bash
cd contracts
cp .env.example .env
# Edit .env and add your private key for deployment
```

### Step 4: Compile Smart Contracts

```bash
npm run compile
```

### Step 5: Deploy Contracts (BNB Testnet)

```bash
# Make sure you have BNB testnet tokens
# Get them from: https://testnet.bnbchain.org/faucet-smart

npm run deploy
# Or for local testing:
# npm run deploy:local
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
   - Check the risk score (0-10)
   - Review triggered rules
   - Read the AI-generated explanation

4. **Use SafeApprove (for risky tokens)**
   - Click "Use SafeApprove" if available
   - Approve only the exact amount needed
   - Extension will auto-reset to zero after transaction

5. **Publish to Risk Feed**
   - Click "Publish to Risk Feed"
   - Sign the transaction in MetaMask
   - Assessment is now on-chain!

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
  • Cached AI-style explanations
  • Rule-specific details
  • Actionable recommendations
        ↓
Display Results
```

### SafeApprove Flow

```
1. User initiates SafeApprove
        ↓
2. Set temporary allowance (exact amount)
        ↓
3. User executes transaction
        ↓
4. Extension automatically resets allowance to 0
        ↓
5. Wallet protected from future drainage
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
cd contracts
npx hardhat test
```

### Local Blockchain

```bash
cd contracts
npx hardhat node
# In another terminal:
npm run deploy:local
```

### Building the Extension

```bash
npm run build:extension
# Creates a .zip file in extension-build/
```

### Running the Website Locally

```bash
npm run dev:website
# Visit http://localhost:3000
```

### Code Style

- **JavaScript:** ES6+ with clear comments
- **Solidity:** ^0.8.20 with NatSpec comments
- **React:** Functional components with hooks
- **CSS:** TailwindCSS utility classes

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

## 🤝 Contributing

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
- **PancakeSwap** for DEX liquidity data
- **OpenZeppelin** for smart contract security patterns
- **Next.js** and **TailwindCSS** for the beautiful website
- **The DeFi Community** for inspiration and feedback

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
