# Universal Relay

**Gasless transactions for Web3.**

Enable frictionless blockchain interactions. Users transact without native tokens—no ETH, no POL, no barriers.

---

## The Problem

Every blockchain interaction requires native tokens for gas fees. This creates three critical barriers:

1. **Onboarding friction** — New users must acquire native tokens before interacting with your dApp
2. **Poor UX** — Users manage multiple tokens across multiple chains
3. **Lost conversions** — 80% of users abandon during complex onboarding flows

Universal Relay eliminates these barriers.

---

## The Solution

Universal Relay enables gasless transactions across EVM chains. Users pay fees in USDC. Your dApp delivers seamless experiences.

**One integration. Every chain. Zero friction.**

---

## Quick Start

### 1. Request Access

Universal Relay uses authorized API keys to ensure quality and prevent abuse.

**Get your API key:**

Join our community → Request access → Receive key within 24 hours

- [Discord](https://discord.gg/ricardian)
- [Telegram](https://t.me/ricardianlabs)

### 2. Install
```bash
npm install ethers@6
```

### 3. Integrate
```javascript
import { buyTokensGasless } from '@ricardian/universal-relay/sdk';

const API_KEY = process.env.RICARDIAN_API_KEY;

await buyTokensGasless(API_KEY, tokenAddress, amount);
```

**That's it.** Your users now transact without native tokens.

---

## Example

### Traditional Flow
```
User must buy ETH → Wait hours → Learn gas → Configure → Hope it works
Result: 80% abandon
```

### With Universal Relay
```
User approves USDC → Signs message → Receives tokens
Result: 95% complete
```

**The difference is revenue.**

---

## Pricing

| Component | Cost |
|-----------|------|
| Per transaction | $0.012–0.02 |

Fees automatically deducted. Your project pays nothing.

---

## Requirements

Your token contract needs:
```solidity
function buyWithUSDC(uint256 amount) external;
```

Different interface? Contact us.

---

## Networks

| Network | Status |
|---------|--------|
| Polygon | Coming Soon |
| Arbitrum | Coming Soon |
| Base | Coming Soon |

---

## FAQ

**Why do I need an API key?**  
Ensures quality integrations and prevents abuse.

**Is it really gasless?**  
Yes. Users pay $0.012–0.02 in USDC, never need native tokens.

**What chains are supported?**  
Launching on Polygon. More chains based on demand.

---

## Support

- [Discord](https://discord.gg/ricardian)
- [Telegram](https://t.me/ricardianlabs)
- Email: dev@ricardian.io

---

## License

SDK: MIT  
Infrastructure: Proprietary

---

**Ready to eliminate gas fees?**

[Request API Key →](https://discord.gg/ricardian)
