// Hybrid Universal Router Integration
// Uses Zora SDK for quote, then manually constructs Universal Router call with hookData

import { createTradeCall, TradeParameters } from '@zoralabs/coins-sdk'
import { encodeFunctionData, Address, Hex } from 'viem'
import { UNIVERSAL_ROUTER_ABI, UNIVERSAL_ROUTER_ADDRESS, REFERRAL_ADDRESS } from './universal-router'

export interface UniversalRouterCall {
  commands: Hex
  inputs: Hex[]
  deadline: bigint
  hookData: Hex
  value: bigint
}

// Encode referral address as hookData for Zora hook
export function encodeReferralHookData(referralAddress: Address): Hex {
  // Method 1: Simple address padding (most likely)
  const paddedAddress = ('0x' + referralAddress.slice(2).toLowerCase().padStart(64, '0')) as Hex
  
  // Method 2: Function call encoding (alternative)
  const functionCall = encodeFunctionData({
    abi: [
      {
        inputs: [{ name: 'referrer', type: 'address' }],
        name: 'setReferrer',
        type: 'function'
      }
    ],
    functionName: 'setReferrer',
    args: [referralAddress]
  })
  
  console.log('🎁 Referral hookData options:')
  console.log('  Method 1 (padded):', paddedAddress)
  console.log('  Method 2 (function):', functionCall)
  
  // Return padded address for now (we'll test both)
  return paddedAddress
}

// Create Universal Router call with referral hookData
export async function createUniversalRouterCallWithReferral(
  tradeParameters: TradeParameters
): Promise<UniversalRouterCall> {
  console.log('🔄 Creating Universal Router call with referral...')
  
  // Step 1: Get quote from Zora SDK (this gives us the basic structure)
  const tradeCall = await createTradeCall(tradeParameters)
  
  console.log('💰 Zora SDK quote received:', {
    target: tradeCall.call.target,
    value: tradeCall.call.value,
    dataLength: tradeCall.call.data.length
  })
  
  // Step 2: Decode the transaction data to extract commands and inputs
  // This is the tricky part - we need to reverse-engineer the Universal Router call
  
  // For now, we'll use a simplified approach:
  // We'll try to modify the existing call data to include hookData
  
  const hookData = encodeReferralHookData(REFERRAL_ADDRESS)
  
  // Step 3: Build Universal Router call
  // Note: This is a simplified implementation
  // In reality, we need to properly decode and reconstruct the commands/inputs
  
  const universalRouterCall: UniversalRouterCall = {
    commands: '0x' as Hex, // We'll need to extract this from tradeCall.call.data
    inputs: [] as Hex[],    // We'll need to extract this from tradeCall.call.data
    deadline: BigInt(Math.floor(Date.now() / 1000) + 1800), // 30 minutes from now
    hookData: hookData,
    value: BigInt(tradeCall.call.value)
  }
  
  console.log('🎯 Universal Router call prepared:', {
    commands: universalRouterCall.commands,
    inputsCount: universalRouterCall.inputs.length,
    deadline: universalRouterCall.deadline,
    hookData: universalRouterCall.hookData,
    value: universalRouterCall.value.toString()
  })
  
  return universalRouterCall
}

// Execute Universal Router call with referral
export async function executeUniversalRouterCallWithReferral(
  universalRouterCall: UniversalRouterCall,
  walletClient: any,
  publicClient: any
): Promise<Hex> {
  console.log('🚀 Executing Universal Router call with referral...')
  
  try {
    // Execute the Universal Router call
    const hash = await walletClient.writeContract({
      address: UNIVERSAL_ROUTER_ADDRESS,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args: [
        universalRouterCall.commands,
        universalRouterCall.inputs,
        universalRouterCall.deadline,
        universalRouterCall.hookData
      ],
      value: universalRouterCall.value,
      account: walletClient.account!
    })
    
    console.log('✅ Universal Router call executed:', hash)
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('🎉 Transaction confirmed:', receipt.transactionHash)
    
    return hash
    
  } catch (error) {
    console.error('❌ Universal Router call failed:', error)
    throw error
  }
}

// Alternative: Try to modify existing call data to include hookData
export function tryModifyExistingCallData(
  originalData: Hex,
  hookData: Hex
): Hex {
  console.log('🔧 Attempting to modify existing call data...')
  
  // This is a simplified approach - in reality, we need to properly decode
  // the Universal Router call and reconstruct it with hookData
  
  // For now, we'll just log what we're trying to do
  console.log('📝 Original data length:', originalData.length)
  console.log('📝 HookData length:', hookData.length)
  
  // TODO: Implement proper call data modification
  // This requires understanding the Universal Router's data format
  
  return originalData // Return original for now
}

// Test function to verify referral encoding
export function testReferralEncoding() {
  console.log('🧪 Testing referral encoding...')
  
  const hookData1 = encodeReferralHookData(REFERRAL_ADDRESS)
  const hookData2 = encodeFunctionData({
    abi: [
      {
        inputs: [{ name: 'referrer', type: 'address' }],
        name: 'setReferrer',
        type: 'function'
      }
    ],
    functionName: 'setReferrer',
    args: [REFERRAL_ADDRESS]
  })
  
  console.log('📊 Referral encoding results:')
  console.log('  Method 1 (padded):', hookData1)
  console.log('  Method 2 (function):', hookData2)
  console.log('  Referral address:', REFERRAL_ADDRESS)
  
  return { hookData1, hookData2 }
}
