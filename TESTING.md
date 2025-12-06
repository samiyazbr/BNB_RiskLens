# Testing Guide

## Smart Contract Tests

### Running Tests

```bash
cd contracts
npx hardhat test
```

### Test Coverage

Current test suite covers:

#### RiskFeed.sol
- ✅ Publishing risk assessments
- ✅ Querying risk reports
- ✅ Updating existing assessments
- ✅ Counting reported tokens
- ✅ Event emissions

#### Demo Tokens
- ✅ SafeToken standard ERC20 functionality
- ✅ MediumRiskToken transfer restrictions
- ✅ HoneypotToken trading limitations
- ✅ Token minting and burning
- ✅ Approval mechanisms

### Adding New Tests

1. Create test file in `contracts/test/`
2. Follow existing test patterns
3. Run tests locally before committing
4. Ensure all tests pass in CI/CD

### Test Output Example

```
  RiskFeed
    ✓ Should publish risk assessment (145ms)
    ✓ Should query risk report (89ms)
    ✓ Should update existing assessment (112ms)
    ✓ Should count reported tokens (67ms)

  SafeToken
    ✓ Should mint tokens (78ms)
    ✓ Should transfer tokens (92ms)
    ✓ Should approve spending (88ms)

  12 passing (2s)
```

## Extension Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] MetaMask connects successfully
- [ ] Token address evaluation works
- [ ] Risk levels display correctly (LOW/MEDIUM/HIGH)
- [ ] AI explanations generate (when API key set)
- [ ] Fallback explanations show (when no API key)
- [ ] Approve button triggers MetaMask
- [ ] Reject button cancels action
- [ ] Demo tokens evaluate with expected risk levels:
  - SafeToken → LOW
  - MediumRiskToken → MEDIUM
  - HoneypotToken → HIGH

### Browser Testing

Test in:
- [ ] Chrome 110+
- [ ] Edge (Chromium)
- [ ] Brave

## Continuous Integration

Tests run automatically via GitHub Actions on:
- Every push to `main` or `develop`
- Every pull request

See `.github/workflows/tests.yml` for CI configuration.
