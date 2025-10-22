import { ethers } from 'ethers';

// YOU deploy relay on each chain
const RELAY_ADDRESSES = {
  137: "0x...",      // Polygon Mainnet
  42161: "0x...",    // Arbitrum
  8453: "0x...",     // Base
  10: "0x...",       // Optimism
  80002: "0x..."     // Polygon Amoy (testnet)
};

const USDC_ADDRESSES = {
  137: "0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174",
  42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831",
  8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  10: "0x7F5c764cBc14f9669B88837ca1490cCa17c31607",
  80002: "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582"
};

const RELAY_ABI = [
  "function executeRelay((address,address,address,address,uint256,uint256,uint256),bytes,bytes) external",
  "function nonces(address) view returns (uint256)"
];

const ERC20_ABI = [
  "function approve(address,uint256) external returns (bool)",
  "function allowance(address,address) view returns (uint256)"
];

export async function buyTokensGasless(apiKeyPrivate, tokenAddress, usdcAmount) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const userAddress = await signer.getAddress();
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    // SDK auto-detects chain and uses YOUR relay on that chain
    const relayAddress = RELAY_ADDRESSES[chainId];
    const usdcAddress = USDC_ADDRESSES[chainId];
    
    if (!relayAddress) {
        throw new Error(`Universal Relay not deployed on chain ${chainId}`);
    }
    
    const relay = new ethers.Contract(relayAddress, RELAY_ABI, signer);
    const usdc = new ethers.Contract(usdcAddress, ERC20_ABI, signer);
    
    // 1. Approve
    const allowance = await usdc.allowance(userAddress, relayAddress);
    if (allowance < usdcAmount) {
        const approveTx = await usdc.approve(relayAddress, ethers.MaxUint256);
        await approveTx.wait();
    }
    
    // 2. Get nonce
    const nonce = await relay.nonces(userAddress);
    
    // 3. Create message
    const domain = {
        name: "UniversalRelay",
        version: "1",
        chainId: chainId,
        verifyingContract: relayAddress
    };
    
    const types = {
        RelayRequest: [
            { name: "user", type: "address" },
            { name: "targetContract", type: "address" },
            { name: "targetToken", type: "address" },
            { name: "paymentToken", type: "address" },
            { name: "amount", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" }
        ]
    };
    
    const message = {
        user: userAddress,
        targetContract: tokenAddress,
        targetToken: tokenAddress,
        paymentToken: usdcAddress,
        amount: usdcAmount,
        nonce: nonce,
        deadline: Math.floor(Date.now() / 1000) + 3600
    };
    
    // 4. User signs
    const userSignature = await signer.signTypedData(domain, types, message);
    
    // 5. API key signs
    const apiWallet = new ethers.Wallet(apiKeyPrivate);
    const digest = ethers.TypedDataEncoder.hash(domain, types, message);
    const apiSignature = await apiWallet.signMessage(ethers.getBytes(digest));
    
    // 6. Execute
    const tx = await relay.executeRelay(message, userSignature, apiSignature);
    await tx.wait();
    
    return tx.hash;
}
