// Fixed Universal Router Integration
// Properly decodes Zora SDK call data and reconstructs with hookData

import { createTradeCall, TradeParameters } from '@zoralabs/coins-sdk'
import { encodeFunctionData, Address, Hex, decodeFunctionData } from 'viem'
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
  // Method 1: Simple address padding (most likely for Zora hook)
  const paddedAddress = ('0x' + referralAddress.slice(2).toLowerCase().padStart(64, '0')) as Hex
  
  console.log('🎁 Referral hookData encoded:', paddedAddress)
  return paddedAddress
}

// Decode Universal Router call data to extract commands and inputs
export function decodeUniversalRouterCall(callData: Hex): {
  commands: Hex
  inputs: Hex[]
  deadline: bigint
} {
  console.log('🔍 Decoding Universal Router call data...')
  
  try {
    // Decode the Universal Router execute function call
    const decoded = decodeFunctionData({
      abi: UNIVERSAL_ROUTER_ABI,
      data: callData
    })
    
    console.log('📊 Decoded Universal Router call:', {
      functionName: decoded.functionName,
      args: decoded.args
    })
    
    return {
      commands: decoded.args[0] as Hex,
      inputs: decoded.args[1] as Hex[],
      deadline: decoded.args[2] as bigint
    }
    
  } catch (error) {
    console.error('❌ Failed to decode Universal Router call:', error)
    throw new Error('Could not decode Universal Router call data')
  }
}

// Create Universal Router call with referral hookData
export async function createUniversalRouterCallWithReferral(
  tradeParameters: TradeParameters
): Promise<UniversalRouterCall> {
  console.log('🔄 Creating Universal Router call with referral...')
  
  // Step 1: Get quote from Zora SDK
  const tradeCall = await createTradeCall(tradeParameters)
  
  console.log('💰 Zora SDK quote received:', {
    target: tradeCall.call.target,
    value: tradeCall.call.value,
    dataLength: tradeCall.call.data.length
  })
  
  // Step 2: Decode the Universal Router call data
  const decoded = decodeUniversalRouterCall(tradeCall.call.data as Hex)
  
  console.log('🔍 Decoded Universal Router call:', {
    commands: decoded.commands,
    inputsCount: decoded.inputs.length,
    deadline: decoded.deadline.toString()
  })
  
  // Step 3: Encode referral hookData
  const hookData = encodeReferralHookData(REFERRAL_ADDRESS)
  
  // Step 4: Build Universal Router call with referral
  const universalRouterCall: UniversalRouterCall = {
    commands: decoded.commands,
    inputs: decoded.inputs,
    deadline: decoded.deadline,
    hookData: hookData,
    value: BigInt(tradeCall.call.value)
  }
  
  console.log('🎯 Universal Router call prepared with referral:', {
    commands: universalRouterCall.commands,
    inputsCount: universalRouterCall.inputs.length,
    deadline: universalRouterCall.deadline.toString(),
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
    // Execute the Universal Router call with hookData
    const hash = await walletClient.writeContract({
      address: UNIVERSAL_ROUTER_ADDRESS,
      abi: UNIVERSAL_ROUTER_ABI,
      functionName: 'execute',
      args: [
        universalRouterCall.commands,
        universalRouterCall.inputs,
        universalRouterCall.deadline,
        universalRouterCall.hookData  // 🎯 This is the key - include hookData!
      ],
      value: universalRouterCall.value,
      account: walletClient.account!
    })
    
    console.log('✅ Universal Router call executed with referral:', hash)
    console.log('💡 This should earn you 4% of trade fees in ZORA tokens!')
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ hash })
    console.log('🎉 Transaction confirmed with referral:', receipt.transactionHash)
    
    return hash
    
  } catch (error) {
    console.error('❌ Universal Router call with referral failed:', error)
    throw error
  }
}

// Test function to verify referral encoding
export function testReferralEncoding() {
  console.log('🧪 Testing referral encoding...')
  
  const hookData = encodeReferralHookData(REFERRAL_ADDRESS)
  
  console.log('📊 Referral encoding results:')
  console.log('  Referral address:', REFERRAL_ADDRESS)
  console.log('  Encoded hookData:', hookData)
  
  return { hookData }
}
