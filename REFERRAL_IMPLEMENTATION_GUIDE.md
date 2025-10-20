# 🎯 Zora Trade Referrals: Current Status & Solution

## ❌ Current Problem

**Your swaps are NOT earning referral rewards yet.** Here's why:

### The Issue
The Zora SDK's `createTradeCall` function doesn't expose the `hookData` parameter needed for trade referrals. According to Zora's documentation:

> "Include your address in the `hookData` parameter when facilitating swaps"

But the SDK abstracts away the Uniswap V4 details, so we can't pass `hookData`.

## ✅ How to Fix This

### Option 1: Direct Uniswap V4 Integration (RECOMMENDED)

You need to call the Uniswap V4 Universal Router directly with `hookData`:

```typescript
import { encodeFunctionData } from 'viem'

// Uniswap V4 Universal Router ABI (simplified)
const UNIVERSAL_ROUTER_ABI = [
  {
    name: 'execute',
    type: 'function',
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' },
      { name: 'hookData', type: 'bytes' } // 🎯 This is what we need!
    ]
  }
]

// Your referral address
const REFERRAL_ADDRESS = '0x8898170be16C41898E777c58380154ea298cD5ac'

// Encode hookData with your referral address
const hookData = encodeFunctionData({
  abi: [{ inputs: [{ name: 'referrer', type: 'address' }], name: 'setReferrer', type: 'function' }],
  functionName: 'setReferrer',
  args: [REFERRAL_ADDRESS]
})

// Call Universal Router with hookData
const tx = await walletClient.writeContract({
  address: '0x6fF5693b99212Da76ad316178A184AB56D299b43', // Universal Router
  abi: UNIVERSAL_ROUTER_ABI,
  functionName: 'execute',
  args: [commands, inputs, deadline, hookData], // Include hookData!
  value: ethAmount,
  account: walletClient.account!
})
```

### Option 2: Platform Referrals (EASIER)

Instead of trade referrals, set up **platform referrals** when creating coins. This earns **20% of ALL future trades** (vs 4% per trade):

```typescript
// When creating a coin, set platformReferrer
const coin = await createCoin({
  // ... other parameters
  platformReferrer: '0x8898170be16C41898E777c58380154ea298cD5ac' // Your address
})
```

**Platform referrals are STICKY** - you earn from every trade on that coin forever!

### Option 3: Wait for SDK Update

The Zora team might add `hookData` support to the SDK in future versions.

## 🔍 How to Verify Referrals Work

### Check Your ZORA Token Balance

1. Go to: https://basescan.org/address/0x8898170be16C41898E777c58380154ea298cD5ac
2. Look for **ZORA token** incoming transfers
3. Referral rewards are paid in **ZORA tokens**, not ETH

### Expected Rewards

For a $2 swap:
- Protocol fees: ~$0.04-$0.06 (2-3%)
- Your 4% share: **~$0.0016-$0.0024 worth of ZORA**

## 🚀 Immediate Action Plan

### Step 1: Test Platform Referrals (EASIEST)

Create a test coin with your address as `platformReferrer`:

```typescript
// This will earn you 20% of ALL trades on this coin forever
const testCoin = await createCoin({
  name: "Test Referral Coin",
  symbol: "TRC", 
  platformReferrer: '0x8898170be16C41898E777c58380154ea298cD5ac'
})
```

### Step 2: Implement Direct Uniswap V4 Calls

Replace the SDK's `createTradeCall` with direct Universal Router calls that include `hookData`.

### Step 3: Monitor Rewards

Check your address for ZORA token transfers after each swap.

## 📊 Revenue Potential

### Trade Referrals (4% per swap)
- 100 swaps/day × $0.002 = **$0.20/day**
- Monthly: **$6.00**
- Yearly: **$73.00**

### Platform Referrals (20% forever)
- If you create 10 popular coins
- Each coin trades 50 times/day
- 10 × 50 × $0.01 × 20% = **$1.00/day**
- Monthly: **$30.00**
- Yearly: **$365.00**

**Platform referrals are MUCH more valuable!**

## 🛠️ Next Steps

1. **Immediate**: Test platform referrals by creating a coin
2. **Short-term**: Implement direct Uniswap V4 integration for trade referrals  
3. **Long-term**: Build a coin creation platform to maximize platform referrals

## 📞 Need Help?

- **Zora Discord**: https://discord.gg/zora
- **Zora Docs**: https://docs.zora.co/coins/contracts/rewards
- **Uniswap V4 Docs**: https://docs.uniswap.org/contracts/v4

---

## 🎯 Summary

**Current Status**: ❌ No referrals earned yet  
**Reason**: SDK doesn't support `hookData` parameter  
**Solution**: Direct Uniswap V4 integration OR platform referrals  
**Priority**: Platform referrals are easier and more profitable!

