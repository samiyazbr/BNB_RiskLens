# Quick Start Guide

Get BNB RiskLens running in 5 minutes!

## Prerequisites Checklist

- [ ] Node.js 18+ installed ([download](https://nodejs.org/))
- [ ] Chrome browser
- [ ] MetaMask extension installed
- [ ] BNB Chain Testnet configured in MetaMask
- [ ] Testnet BNB tokens ([get free tokens](https://testnet.bnbchain.org/faucet-smart))
- [ ] OpenAI API key ([get one](https://platform.openai.com/api-keys))

## Installation (5 Steps)

### 1️⃣ Clone & Install
```bash
git clone https://github.com/samiyazbr/BNB_RiskLens.git
cd BNB_RiskLens
npm run install:all
```

### 2️⃣ Configure Environment
```bash
# Contracts
cd contracts
cp .env.example .env
# Edit .env: add your wallet private key

# Extension
cd ../bnb-risklens-extension
cp env.example.json env.json
# Edit env.json: add your OpenAI API key
```

### 3️⃣ Deploy Contracts (Optional)
```bash
cd ../
npm run deploy:testnet
# Note the deployed addresses
```

### 4️⃣ Load Extension
1. Open Chrome → `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select `bnb-risklens-extension` folder
5. Pin the extension

### 5️⃣ Test It!
1. Click the extension icon
2. Click "Connect MetaMask"
3. Paste a demo token address:
   - Safe: `0x5a840787D29406F2Fc345a3C9660E55b85BD1a9e`
   - Medium Risk: `0xeD20D6B4352D4DeD3Ba24433b56Fb4CFBeA8fef6`
   - Honeypot: `0x41F27B454eb379F4a3Cc5993aB85922e3fDF1e3e`
4. Click "Evaluate Risk"
5. See the risk warning!

## Troubleshooting

**Extension not loading?**
- Make sure you selected the `bnb-risklens-extension` folder (not the root)
- Check Chrome DevTools → Console for errors

**MetaMask not connecting?**
- Refresh the page you're on
- Make sure MetaMask is unlocked
- Try clicking "Connect MetaMask" again

**AI explanations not working?**
- Check `env.json` has your valid OpenAI API key
- Reload the extension after adding the key
- Check browser console for API errors

**"No active tab" error?**
- Visit any website first (e.g., google.com)
- Extension needs an active tab to access MetaMask

## Next Steps

- Read the full [README.md](README.md)
- Check [TESTING.md](TESTING.md) for testing guide
- See [CONTRIBUTING.md](CONTRIBUTING.md) to contribute
- Join discussions in [Issues](https://github.com/samiyazbr/BNB_RiskLens/issues)

## Demo Video

> 🎥 Coming soon: Watch a 2-minute demo video

---

**Need help?** Open an issue: https://github.com/samiyazbr/BNB_RiskLens/issues
