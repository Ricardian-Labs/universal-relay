# Universal Relay SDK

Enable gasless transactions for any token in ONE LINE of code.

## Installation
```bash
npm install @ricardian/universal-relay ethers
```

## Usage
```javascript
import { buyTokensGasless } from '@ricardian/universal-relay';

// Users buy your token without needing POL/ETH
await buyTokensGasless('0xYourTokenAddress', '100000000'); // 100 USDC
```

## Example Integration
```javascript
import { buyTokensGasless } from '@ricardian/universal-relay';

async function handlePurchase() {
  try {
    const txHash = await buyTokensGasless(
      '0xYourTokenContractAddress',
      '100000000' // 100 USDC
    );
    console.log('Success:', txHash);
  } catch (error) {
    console.error('Failed:', error);
  }
}
```

## Requirements

Your token contract must have either:
- `buyWithUSDC(uint256 amount)` or
- `buyWithUSDT(uint256 amount)`

That's it. No other changes needed.

## Supported Networks

- Polygon Amoy Testnet ✓
- Polygon Mainnet (coming soon)
