# BNB RiskLens Contracts

Smart contracts for the BNB RiskLens risk assessment platform.

## Contracts

### RiskFeed.sol
Main risk reporting contract. Allows users to publish and query token risk assessments on-chain.

### Demo Tokens

- **SafeToken.sol** - Safe, standard ERC20 token for testing low-risk scenarios
- **MediumRiskToken.sol** - Token with medium risk characteristics (new, few holders)
- **HoneypotToken.sol** - Honeypot demonstration token (HIGH RISK, for testing only)

## Deployment

```bash
# Install dependencies
npm install

# Compile contracts
npx hardhat compile

# Deploy to BNB Testnet
npx hardhat run scripts/deploy.js --network bnb_testnet

# Deploy to local network
npx hardhat node  # In one terminal
npx hardhat run scripts/deploy.js --network localhost  # In another
```

## Testing

```bash
npx hardhat test
```

## Contract Verification

After deployment, verify on BSCScan:

```bash
npx hardhat verify --network bnb_testnet DEPLOYED_ADDRESS "ConstructorArg1" "ConstructorArg2"
```

## Network Configuration

Configure networks in `hardhat.config.js`:
- BNB Testnet (Chain ID: 97)
- BNB Mainnet (Chain ID: 56)
- Local Hardhat Network

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
PRIVATE_KEY=your_wallet_private_key
BNB_TESTNET_RPC=https://data-seed-prebsc-1-s1.binance.org:8545/
BSCSCAN_API_KEY=your_bscscan_api_key
```

## Security Notes

- Never commit `.env` file
- Use test wallets for testnet
- Audit contracts before mainnet deployment
- Test thoroughly with demo tokens
