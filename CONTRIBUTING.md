# Contributing to BNB RiskLens

First off, thank you for considering contributing to BNB RiskLens! It's people like you that make this tool a powerful defense against crypto scams.

## 🎯 How Can I Contribute?

### Reporting Bugs

**Before submitting a bug report:**
- Check the [existing issues](https://github.com/samiyazbr/BNB_RiskLens/issues) to avoid duplicates
- Collect information about the bug (steps to reproduce, expected vs actual behavior, screenshots)

**How to submit a good bug report:**

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
 - OS: [e.g. macOS, Windows, Linux]
 - Browser: [e.g. Chrome 120]
 - Extension Version: [e.g. 1.0.0]
```

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Clear title** - Use a descriptive title
- **Detailed description** - Explain the enhancement and why it would be useful
- **Use cases** - Provide examples of how the feature would be used
- **Mockups** - If applicable, include wireframes or mockups

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:
- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Documentation improvements

### Pull Requests

1. **Fork the repository** and create your branch from `main`
2. **Make your changes** following our coding standards
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Write clear commit messages**
6. **Submit a pull request**

## 💻 Development Process

### Setup Development Environment

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/BNB_RiskLens.git
cd BNB_RiskLens

# Install dependencies
npm install
cd contracts && npm install
cd ../bnb-risklens-website && npm install

# Load extension in Chrome
# Go to chrome://extensions/
# Enable Developer mode
# Click "Load unpacked"
# Select bnb-risklens-extension directory
```

### Coding Standards

**JavaScript/Node.js:**
- Use ES6+ syntax
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused
- Use async/await instead of callbacks

**Solidity:**
- Follow Solidity 0.8.20+ best practices
- Use NatSpec comments for all functions
- Include security considerations
- Test all contract functions

**Code Style:**
```javascript
// ✅ Good
async function evaluateToken(tokenAddress) {
  const data = await fetchOnChainData(tokenAddress);
  const riskScore = calculateRisk(data);
  return riskScore;
}

// ❌ Bad
async function eval(t){
const d=await fetch(t);
return calc(d)
}
```

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add honeypot detection rule
fix: correct holder count calculation
docs: update README with API examples
style: format code according to standards
refactor: simplify risk scoring logic
test: add tests for new token evaluation
chore: update dependencies
```

### Testing

Before submitting a PR, test your changes:

**Extension Testing:**
```bash
# Load extension in Chrome
# Test with all three demo tokens:
# - SafeToken: 0x5a840787D29406F2Fc345a3C9660E55b85BD1a9e
# - MediumRiskToken: 0xeD20D6B4352D4DeD3Ba24433b56Fb4CFBeA8fef6
# - HoneypotToken: 0x41F27B454eb379F4a3Cc5993aB85922e3fDF1e3e

# Verify:
# - Risk levels are correct
# - UI displays properly
# - No console errors
```

**Smart Contract Testing:**
```bash
cd contracts
npx hardhat test
```

**Website Testing:**
```bash
cd bnb-risklens-website
npm run build
npm run dev
```

## 🎨 Areas for Contribution

### High Priority
- 🔍 **New Risk Detection Rules** - Add more scam patterns
- 🌐 **BSCScan API Integration** - Real-time data fetching
- 📱 **Mobile Support** - iOS & Android apps
- 🧪 **More Tests** - Increase code coverage

### Medium Priority
- 🎨 **UI/UX Improvements** - Better user experience
- 🌍 **Internationalization** - Multi-language support
- 📚 **Documentation** - More examples and guides
- ⚡ **Performance** - Optimize evaluation speed

### Nice to Have
- 🤖 **Advanced Pattern Recognition** - ML-based detection
- 📊 **Analytics Dashboard** - Visualization of risks
- 💬 **Community Features** - Voting, comments
- 🔗 **More Chains** - Ethereum, Polygon, etc.

## 🏗️ Project Structure

```
BNB_RiskLens/
├── bnb-risklens-extension/     # Chrome Extension
│   ├── src/
│   │   ├── ruleEngine.js        # Core risk rules
│   │   ├── score.js             # Risk scoring
│   │   ├── aiInterpreter.js     # AI explanations
│   │   └── utils/               # Utility functions
│   ├── popup.js                 # Main UI logic
│   └── background.js            # Service worker
│
├── contracts/                   # Smart Contracts
│   ├── contracts/
│   │   ├── RiskFeed.sol         # On-chain risk feed
│   │   └── [TestTokens].sol     # Demo tokens
│   └── scripts/deploy.js
│
└── bnb-risklens-website/       # Documentation Site
    ├── pages/
    └── components/
```

## 🔒 Security

**Reporting Security Issues:**

Do NOT open a public issue. Instead, email: security@bnbrisklens.com

Include:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will respond within 48 hours.

## 📜 Code of Conduct

This project adheres to the Contributor Covenant [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🏆 Recognition

Contributors will be:
- Listed in our README
- Mentioned in release notes
- Given credit in documentation

## 📞 Getting Help

- 💬 **Discord:** [discord.gg/bnbrisklens](#)
- 📧 **Email:** support@bnbrisklens.com
- 🐦 **Twitter:** [@bnbrisklens](#)

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for making the crypto space safer!** 🔶
