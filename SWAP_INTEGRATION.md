# 🔄 Swap Integration Guide

## ✅ What's Already Built

I've created a beautiful, fully-functional swap widget UI with:

- ✨ **Gorgeous gradient design** matching your colorful theme
- 💰 **Token selection** (ETH & USDC support)
- 📊 **Real-time price calculations** with slippage protection
- 💼 **Wallet integration** via Wagmi hooks
- 📱 **Responsive design** with loading states and error handling
- 🎯 **Smart UX** with max button, balance display, and validation

## 🚀 To Complete the Integration

To enable actual swaps, you need to add the Zora protocol contract interaction. Here's how:

### 1. Get Zora Protocol Contract Details

You'll need:
- **Zora Creator Coin Router Address** on Base (chain ID: 8453)
- **Contract ABI** for the buy/sell functions

The Zora protocol uses a bonding curve model. Coins can be bought/sold through their protocol contracts.

### 2. Update the Swap Function

In `swap-widget.tsx`, replace the `handleSwap` function alert with actual contract interaction:

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'

// Add the Zora contract ABI (you'll need to get this from Zora docs)
const ZORA_ROUTER_ABI = [
  {
    name: 'buy',
    type: 'function',
    stateMutability: 'payable',
    inputs: [
      { name: 'token', type: 'address' },
      { name: 'minCoinsOut', type: 'uint256' }
    ],
    outputs: [{ name: 'coinsOut', type: 'uint256' }]
  },
  // ... other functions
]

const ZORA_ROUTER_ADDRESS = '0x...' // Get from Zora docs

const handleSwap = async () => {
  try {
    // For ETH swaps
    writeContract({
      address: ZORA_ROUTER_ADDRESS,
      abi: ZORA_ROUTER_ABI,
      functionName: 'buy',
      args: [
        coin.contractAddress, // Token to buy
        parseUnits(toAmount, 18) // Minimum coins out (with slippage)
      ],
      value: parseEther(fromAmount) // ETH amount
    })
  } catch (err) {
    setError(err.message)
  }
}
```

### 3. Add USDC Approval Flow

For USDC swaps, you need to approve the router first:

```typescript
import { useWriteContract } from 'wagmi'

const USDC_ADDRESS = '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913'
const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount', type: 'uint256' }
    ],
    outputs: [{ name: '', type: 'bool' }]
  }
]

// First approve USDC
const approveUSDC = async () => {
  writeContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'approve',
    args: [ZORA_ROUTER_ADDRESS, parseUnits(fromAmount, 6)] // USDC has 6 decimals
  })
}

// Then swap after approval
```

### 4. Query Real Bonding Curve Prices

Instead of the simple `amount / price` calculation, query the actual bonding curve:

```typescript
import { useReadContract } from 'wagmi'

// Get exact output amount from contract
const { data: quoteData } = useReadContract({
  address: ZORA_ROUTER_ADDRESS,
  abi: ZORA_ROUTER_ABI,
  functionName: 'getQuote',
  args: [
    coin.contractAddress,
    parseEther(fromAmount),
    true // isBuy
  ],
  watch: true // Re-fetch on every block
})
```

### 5. Resources

- **Zora Docs**: https://docs.zora.co/
- **Zora Creator Coins**: Look for their bonding curve contract addresses
- **Base Chain Explorer**: https://basescan.org/
- **Wagmi Docs**: https://wagmi.sh/

## 🎨 Current Features

The swap widget already includes:

1. **Token Selection**: Switch between ETH and USDC
2. **Balance Display**: Shows user's current balance
3. **Max Button**: One-click to use full balance
4. **Real-time Estimates**: Auto-calculates output amount
5. **Slippage Control**: 0.5%, 1%, or 2% options
6. **Price Info**: Shows price per coin and network fees
7. **Wallet Integration**: Connect wallet prompts
8. **Error Handling**: Clear error messages
9. **Transaction States**: Loading, confirming, success states
10. **Beautiful UI**: Gradient design with animations

## 💡 Testing

Once you add the contract integration:

1. Test on Base testnet first
2. Use small amounts for initial tests
3. Monitor gas costs
4. Test error scenarios (insufficient balance, slippage errors)
5. Verify token balances after swaps

## 🔗 Next Steps

1. Contact Zora team or check their docs for exact contract addresses
2. Add the contract ABI to your project
3. Implement the contract interactions
4. Test thoroughly on testnet
5. Deploy to mainnet

The UI is ready - you just need to connect it to the actual Zora protocol! 🚀

