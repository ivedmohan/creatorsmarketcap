# 🔍 How to Verify Referral Rewards

## Your Transaction Analysis

**Transaction:** `0x0c810d6c157e30562a0899054d23365a0350ada59392dd102a43bdde9a430272`

### What Happened:
✅ You swapped 0.0005 ETH  
✅ You received 455.4 "Base is for everyone" tokens  
✅ Gas: $0.002112  
✅ Status: Success

### ❌ Current Issue:
**The referral is NOT being passed yet.** The current code logs your referral address but doesn't actually send it to the contract.

## 🔎 How to Check if You Got 4% Referral

### Method 1: Check ZORA Token Transfers (EASIEST)

1. Go to: https://basescan.org/address/0x8898170be16C41898E777c58380154ea298cD5ac

2. Click "**Token Transfers (ERC-20)**" tab

3. Look for **ZORA** token incoming transfers

4. Referral rewards are paid in **ZORA tokens** (not ETH!)

5. Amount should be ~4% of protocol fees (converted to ZORA)

### Method 2: Check Transaction Logs

1. Open your transaction on BaseScan:
   ```
   https://basescan.org/tx/0x0c810d6c157e30562a0899054d23365a0350ada59392dd102a43bdde9a430272
   ```

2. Click "**Logs**" tab

3. Look for **Transfer** events to your address (`0x8898170b...a298cD5ac`)

4. Should see:
   - ETH → WETH (your swap)
   - Base coins → You (your purchase)
   - **ZORA → You** (referral reward) ← THIS IS WHAT YOU'RE LOOKING FOR

## ⚠️ Why You Probably Didn't Get Referrals Yet

Looking at the current code, we're creating the transaction but **NOT passing the referral**.

The Zora SDK's `tradeCoin` function might not have a `referrer` parameter. We need to:

### Option A: Check if SDK Supports Referrer Parameter

The `TradeParameters` type might have a hidden `referrer` field. Let me check the SDK source code.

### Option B: Use Custom Hook Data

Modify the transaction to include hookData with your encoded address:

```typescript
// Encode referral address as hookData
const REFERRAL = '0x8898170be16C41898E777c58380154ea298cD5ac'
const hookData = '0x' + REFERRAL.slice(2).padStart(64, '0')

// Pass this in the swap transaction somehow
```

### Option C: Contact Zora Support

The Zora SDK documentation isn't clear on how to pass trade referrals. You might need to:

1. Ask in Zora Discord: https://discord.gg/zora
2. Check Zora GitHub issues: https://github.com/ourzora/zora-protocol
3. Read V4 hook implementation details

## 💡 What to Do Next

### Immediate Steps:

1. **Check your address for ZORA tokens**:
   ```
   https://basescan.org/token/0x[ZORA_TOKEN_ADDRESS]?a=0x8898170be16C41898E777c58380154ea298cD5ac
   ```

2. **If NO ZORA transfers** = Referrals aren't working yet

3. **If YES ZORA transfers** = Referrals are working! 🎉

### To Fix Referrals:

We need to find the correct way to pass referrals in the Zora SDK. The documentation says to encode the referral in `hookData`, but the SDK might abstract this.

**Three approaches:**

1. **TradeParameters might have a referrer field** - Need to check SDK types
2. **Manually construct transaction with hookData** - Bypass SDK 
3. **Platform referrals** - Set your address when CREATING coins (20% forever!)

## 🎯 Expected Referral Amount

For your 0.0005 ETH swap:

- Swap value: ~$2.00
- Protocol fees: ~2-3% = $0.04-$0.06
- Your 4% share: **~$0.0016-$0.0024 worth of ZORA**

At scale (100 swaps/day):
- Daily: 100 × $0.002 = **$0.20**
- Monthly: 30 × $0.20 = **$6.00**
- Yearly: 365 × $0.20 = **$73.00**

**Plus** if you set platform referrals when creating coins, you get 20% of ALL trades on those coins FOREVER!

## 📞 Need Help?

1. **Check Zora Docs**: https://docs.zora.co/coins/contracts/rewards
2. **Ask Zora Team**: Discord or Twitter (@zora)
3. **Inspect Working Example**: Find a platform using referrals and inspect their transactions

---

## ⚡ Quick Test

Run this to check your ZORA balance:

```bash
# Check if you have any ZORA tokens (Base network)
# ZORA token address on Base: 0x...
```

If balance is 0, referrals aren't being sent yet. If you have ZORA, check the transaction timestamps to see when you earned them!

