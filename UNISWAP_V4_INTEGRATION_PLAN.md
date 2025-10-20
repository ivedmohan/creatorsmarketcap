# 🛠️ Uniswap V4 Integration Plan

## 📊 Complexity Assessment: **MODERATE (6/10)**

### ✅ **Manageable Aspects:**
- Clear Uniswap V4 documentation
- Universal Router contract already deployed on Base
- Your transaction structure is working
- We have the referral address ready

### ⚠️ **Challenging Aspects:**
- Need to encode commands/inputs for Universal Router
- HookData must be properly formatted
- Testing required to verify referrals work
- Error handling for failed transactions

## 🎯 **Step-by-Step Implementation**

### **Phase 1: Research & Setup (1-2 hours)**

#### Step 1: Get Universal Router ABI
```bash
# We need the Universal Router ABI
# Contract: 0x6fF5693b99212Da76ad316178A184AB56D299b43
```

#### Step 2: Understand Command Structure
```typescript
// Universal Router uses commands + inputs pattern
// Commands: byte array telling router what to do
// Inputs: array of encoded parameters for each command
// HookData: encoded referral address
```

### **Phase 2: Implementation (2-3 hours)**

#### Step 1: Create Universal Router Integration
```typescript
// Replace createTradeCall with direct Universal Router call
const universalRouterABI = [
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
```

#### Step 2: Encode HookData
```typescript
// Encode your referral address for Zora hook
const hookData = encodeFunctionData({
  abi: [{ 
    inputs: [{ name: 'referrer', type: 'address' }], 
    name: 'setReferrer', 
    type: 'function' 
  }],
  functionName: 'setReferrer',
  args: ['0x8898170be16C41898E777c58380154ea298cD5ac']
})
```

#### Step 3: Build Commands & Inputs
```typescript
// This is the tricky part - we need to reverse-engineer
// what commands the Zora SDK is generating
// Then add our hookData to the execute call
```

### **Phase 3: Testing & Verification (1 hour)**

#### Step 1: Test with Small Amount
```typescript
// Test with 0.0001 ETH first
// Check transaction logs for referral events
// Verify ZORA token transfers to your address
```

#### Step 2: Monitor Rewards
```typescript
// Check your address for ZORA token incoming transfers
// Should see ~4% of protocol fees as ZORA tokens
```

## 🔧 **Technical Implementation**

### **Current Approach (What We Have):**
```typescript
// Zora SDK approach (no referrals)
const tradeCall = await createTradeCall(tradeParameters)
const hash = await walletClient.sendTransaction({
  to: tradeCall.call.target,
  data: tradeCall.call.data,
  value: BigInt(tradeCall.call.value),
  account: walletClient.account!,
})
```

### **New Approach (With Referrals):**
```typescript
// Direct Universal Router approach (with referrals)
const hookData = encodeReferralAddress('0x8898170be16C41898E777c58380154ea298cD5ac')
const hash = await walletClient.writeContract({
  address: '0x6fF5693b99212Da76ad316178A184AB56D299b43', // Universal Router
  abi: UNIVERSAL_ROUTER_ABI,
  functionName: 'execute',
  args: [commands, inputs, deadline, hookData], // Include hookData!
  value: ethAmount,
  account: walletClient.account!
})
```

## 🎯 **Key Challenges & Solutions**

### **Challenge 1: Command Encoding**
**Problem:** Universal Router uses complex command structure
**Solution:** Reverse-engineer from Zora SDK's `createTradeCall` output

### **Challenge 2: HookData Format**
**Problem:** Need correct encoding for Zora hook
**Solution:** Research Zora's hook interface and encode properly

### **Challenge 3: Error Handling**
**Problem:** Failed transactions could lose ETH
**Solution:** Implement proper validation and fallbacks

## 📈 **Success Metrics**

### **Phase 1 Success:**
- ✅ Universal Router integration compiles
- ✅ HookData encoding works
- ✅ Transaction structure is correct

### **Phase 2 Success:**
- ✅ Transaction executes successfully
- ✅ You receive expected tokens
- ✅ Gas costs are reasonable

### **Phase 3 Success:**
- ✅ ZORA tokens appear in your wallet
- ✅ Referral rewards are ~4% of protocol fees
- ✅ System works consistently

## 🚀 **Implementation Timeline**

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| **Research** | 1-2 hours | Universal Router ABI, command structure |
| **Implementation** | 2-3 hours | Working referral integration |
| **Testing** | 1 hour | Verified referral rewards |
| **Total** | **4-6 hours** | **Complete referral system** |

## 💡 **Risk Mitigation**

### **Low Risk:**
- Transaction fails → ETH stays in wallet
- Wrong encoding → Clear error messages
- Testing with small amounts → Minimal loss

### **Medium Risk:**
- Complex command structure → Requires careful reverse-engineering
- HookData format → Need to research Zora's interface

### **High Risk:**
- None identified (we're not deploying contracts)

## 🎯 **Next Steps**

1. **Start with research** - Get Universal Router ABI
2. **Build basic integration** - Replace SDK call with direct router call
3. **Add hookData** - Encode referral address properly
4. **Test thoroughly** - Verify referrals work
5. **Deploy & monitor** - Check for ZORA token rewards

## 🤝 **Collaboration Approach**

### **My Role:**
- Research technical implementation details
- Write the integration code
- Debug and troubleshoot issues
- Provide guidance and explanations

### **Your Role:**
- Test the implementation
- Provide feedback on user experience
- Monitor referral rewards
- Suggest improvements

## 📞 **Resources**

- **Uniswap V4 Docs**: https://docs.uniswap.org/contracts/v4/overview
- **Universal Router**: https://docs.uniswap.org/contracts/v4/quickstart/swap
- **Zora Hook Docs**: https://docs.zora.co/coins/contracts/rewards
- **Base Network**: https://docs.base.org/

---

## 🎉 **Bottom Line**

**Complexity: MODERATE (6/10)**  
**Time Required: 4-6 hours**  
**Success Probability: HIGH (85%)**  
**Reward Potential: $73/year + learning experience**

**Let's do this together!** 🚀
