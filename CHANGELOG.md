# Changelog

All notable changes to BNB RiskLens will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-12-06

### Added
- Initial hackathon demo release
- Chrome extension with risk evaluation engine
- 6 deterministic risk rules (R1-R6)
- AI-powered explanations via OpenAI GPT-3.5-turbo
- MetaMask integration for wallet connection and transaction signing
- Three demo tokens on BNB Testnet (SafeToken, MediumRiskToken, HoneypotToken)
- RiskFeed smart contract for on-chain risk reporting (BNB Testnet)
- Environment-based configuration (env.json for extension)
- Manual token address evaluation via extension popup
- Basic transaction interception proof-of-concept
- Next.js documentation website
- Comprehensive README with demo vs production vision
- Open-source documentation (LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY)
- GitHub issue templates

### Security
- API keys managed via env.json (not hardcoded)
- Secrets properly excluded in .gitignore
- Background service worker for secure OpenAI API calls

## [Unreleased]

### Planned for Production
- Automatic transaction interception on DEXs
- BSCScan API integration for real-time token data
- Multi-chain support (Ethereum, Polygon, Arbitrum, etc.)
- Mobile app (iOS & Android)
- Community voting on risk assessments
- Enhanced honeypot detection patterns
- Historical price charts
- Browser extension store publication
