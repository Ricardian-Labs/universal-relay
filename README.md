# Universal Relay

**A cryptographic relay protocol for native-token-abstracted transactions across EVM networks.**

Universal Relay is permissionless transaction infrastructure that eliminates native token requirements through EIP-712 signature authentication and atomic payment routing. Built on cryptographic primitives rather than trusted intermediaries.

---

## Protocol Architecture

Universal Relay implements a singleton relay pattern where payment token abstraction is achieved through dual-signature verification and atomic token forwarding. The protocol operates entirely on cryptographic proofs—no oracles, no multisigs, no governance.

### Core Innovation

Traditional EVM transactions require native tokens (ETH, POL, MATIC) for gas payment. This creates a circular dependency: users need tokens to acquire tokens. Universal Relay breaks this by:

1. **Signature-based authentication** — Users sign EIP-712 typed messages off-chain (zero gas cost)
2. **Cryptographic authorization** — Protocol validates signatures via ECDSA recovery
3. **Atomic execution** — Payment deduction and token delivery occur in a single transaction
4. **Token-agnostic fees** — Gas fees calculated and charged in the payment token itself

The result: users transact with any ERC20 token. No native tokens required. Ever.

---

## Technical Specification

### Message Structure
```solidity
struct RelayRequest {
    address user;              // Transaction originator
    address targetContract;    // Destination contract
    address targetToken;       // Token to receive
    address paymentToken;      // Token for fee payment
    uint256 amount;           // Payment amount (including fees)
    uint256 nonce;            // Replay protection
    uint256 deadline;         // Expiration timestamp
}
```

### Signature Verification

Protocol requires dual signatures for execution:
```solidity
// User signature: Proves intent and authorization
bytes32 digest = _hashTypedDataV4(structHash);
address userSigner = digest.recover(userSignature);
require(userSigner == request.user, "Invalid user signature");

// API signature: Protocol authorization layer
address apiKeySigner = digest.recover(apiSignature);
require(authorizedApiKeys[apiKeySigner], "Unauthorized API key");
```

This dual-signature model enables:
- **Trustless user intent** — Cryptographically proven transaction authorization
- **Permissioned relay access** — Prevents spam and ensures quality integrations
- **Replay protection** — Nonce-based sequence validation

### Fee Mechanics

Fees are dynamically calculated and atomically deducted:
```solidity
function _calculateFee(address project, address paymentToken) internal view returns (uint256) {
    // Real-time gas cost calculation
    uint256 gasCostWei = GAS_ESTIMATE * tx.gasprice;
    uint256 gasCostInUsd = (gasCostWei * nativePrice) / 1e18;
    
    // Composite fee structure
    uint256 totalFeeUsd = baseFee + gasCostInUsd + projectFees[project];
    
    // Convert to payment token decimals
    return (totalFeeUsd * 10**decimals) / 1e18;
}
```

Fee components:
- **Base protocol fee** — Fixed relay operation cost
- **Gas cost** — Dynamic, based on current network conditions  
- **Project fee** — Optional per-integration custom fees

All fees deducted in the payment token. No native token exposure.

---

## Integration

### Smart Contract Requirements

Target contracts must implement a single payment reception interface:
```solidity
function buyWithUSDC(uint256 amount) external;
// OR
function buyWithUSDT(uint256 amount) external;
```

The relay forwards net payment (after fee deduction) to this function. Contract receives tokens and executes business logic atomically.

### SDK Integration

Developers integrate via the Universal Relay SDK:
```javascript
import { buyTokensGasless } from '@ricardian/universal-relay/sdk';

// Authorized API key (request via community channels)
const API_KEY = process.env.RELAY_API_KEY;

// Execute gasless transaction
await buyTokensGasless(API_KEY, targetContract, paymentAmount);
```

SDK handles:
- EIP-712 message construction
- Signature generation and encoding
- Transaction submission and monitoring
- Error handling and retry logic

---

## Security Model

### Non-Custodial Architecture

Universal Relay never holds user funds. Tokens flow directly from user → relay → target contract in a single atomic transaction. If any step fails, the entire transaction reverts.
```
User Token Balance → Relay (transient) → Target Contract
                     ↓
                 Fees deducted atomically
```

### Cryptographic Guarantees

1. **Message authenticity** — EIP-712 typed data signing
2. **Signer verification** — ECDSA signature recovery
3. **Replay protection** — Monotonic nonce sequences
4. **Access control** — On-chain API key authorization
5. **Atomic execution** — All-or-nothing transaction semantics

### Attack Surface

**What attackers cannot do:**
- Forge signatures (requires private key)
- Replay transactions (nonce validation)
- Execute without authorization (API key check)
- Steal funds (non-custodial, atomic execution)

**What attackers could attempt:**
- Front-running (mitigated via deadlines)
- Gas griefing (gas limits enforced)

---

## Deployment

Universal Relay follows a multi-chain deployment strategy. Each EVM network receives an independent relay deployment:

| Network | Chain ID | Status |
|---------|----------|--------|
| Polygon | 137 | Pending |
| Arbitrum | 42161 | Pending |
| Base | 8453 | Pending |
| Optimism | 10 | Pending |
| Ethereum | 1 | Roadmap |

SDK automatically detects network and routes to appropriate relay instance.

---

## API Key Authorization

Universal Relay operates under permissioned access to ensure network quality and prevent abuse.

### Obtaining Authorization

API keys are cryptographic key pairs authorized on-chain:

1. Join developer community (Discord/Telegram)
2. Request API key with project details
3. Receive authorized key pair
4. Integrate SDK with provided credentials

### Authorization Mechanism
```solidity
mapping(address => bool) public authorizedApiKeys;

function executeRelay(..., bytes calldata apiSignature) external {
    address apiKeySigner = digest.recover(apiSignature);
    require(authorizedApiKeys[apiKeySigner], "Unauthorized");
    // ...
}
```

Keys can be:
- **Created manually** — Protocol owner generates and authorizes
- **Auto-generated** — On-chain creation (when enabled)
- **Revoked** — Instant on-chain revocation if needed

---

## Economic Model

### Fee Structure

| Component | Value |
|-----------|-------|
| Base protocol fee | $0.01 USD |
| Gas cost (dynamic) | ~$0.002-0.01 USD |
| **Total per transaction** | **~$0.012-0.02 USD** |

Fees charged in payment token. Zero native token requirement.

### Developer Economics

Integrators pay nothing. Fees deducted from user transactions. Optional project-specific fees can be configured for custom monetization.

---

## Roadmap

**Q1 2025**
- Protocol security audit
- Polygon mainnet deployment
- Developer documentation

**Q2 2025**  
- Multi-token support (USDT, DAI, WETH)
- Arbitrum and Base deployment
- Analytics dashboard

**Q3 2025**
- Ethereum mainnet deployment
- Cross-chain messaging integration
- ERC-4337 compatibility layer

**Q4 2025**
- Advanced fee routing mechanisms
- Protocol governance framework
- Enterprise white-label solutions

---

## Technical Reference

### Contract Interfaces
```solidity
interface IUniversalRelay {
    function executeRelay(
        RelayRequest calldata request,
        bytes calldata userSignature,
        bytes calldata apiSignature
    ) external;
    
    function nonces(address user) external view returns (uint256);
    function authorizedApiKeys(address key) external view returns (bool);
    function baseFee() external view returns (uint256);
}
```

### EIP-712 Domain
```solidity
EIP712("UniversalRelay", "1")
```

### Type Hash
```solidity
keccak256("RelayRequest(address user,address targetContract,address targetToken,address paymentToken,uint256 amount,uint256 nonce,uint256 deadline)")
```

---

## Community

**Developer Channels**
- Discord: [discord.gg/ricardian](https://discord.gg/ricardian)
- Telegram: [@ricardianlabs](https://t.me/ricardianlabs)

**Technical Support**
- Documentation: [docs.ricardian.io](#)
- GitHub Issues: [github.com/ricardianlabs/universal-relay/issues](#)

**Security**
- Contact: security@ricardian.io
- PGP: [ricardian.io/security.asc](#)

---

## License

**SDK**: MIT License  
**Protocol Contracts**: Proprietary

SDK is open source. Protocol contracts are proprietary to maintain network integrity and prevent ecosystem fragmentation.

---

## About

Universal Relay is developed by [Ricardian Labs](https://ricardian.io), a research and development organization focused on cryptographic protocols for decentralized systems.

Our work centers on eliminating unnecessary complexity in blockchain interactions through first-principles cryptographic design.

---

<p align="center">
  <sub>Built by Ricardian Labs</sub>
</p>
