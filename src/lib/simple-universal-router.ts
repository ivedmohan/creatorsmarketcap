// Simplified Universal Router Integration
// Direct approach without complex decoding

import { createTradeCall, TradeParameters } from '@zoralabs/coins-sdk'
import { Address, Hex, decodeFunctionData } from 'viem'
import { UNIVERSAL_ROUTER_ABI, UNIVERSAL_ROUTER_ADDRESS, REFERRAL_ADDRESS } from './universal-router'

// Simple hookData encoding - just pad the address to 32 bytes
export function createSimpleHookData(referralAddress: Address): Hex {
  // Remove 0x prefix, pad to 64 characters (32 bytes), add 0x back
  const addressWithoutPrefix = referralAddress.slice(2).toLowerCase()
  const paddedAddress = '0x' + addressWithoutPrefix.padStart(64, '0')
  
  console.log('🎁 Simple hookData created:', paddedAddress)
  console.log('📝 Original address:', referralAddress)
  
  return paddedAddress as Hex
}

// Alternative: Try to modify the existing call data directly
export async function executeSwapWithReferral(
  tradeParameters: TradeParameters,
  walletClient: any,
  publicClient: any
): Promise<Hex> {
  console.log('🔄 Executing swap with referral (simplified approach)...')
  
  try {
    // Step 1: Get the quote from Zora SDK
    const tradeCall = await createTradeCall(tradeParameters)
    
    console.log('💰 Zora SDK quote received:', {
      target: tradeCall.call.target,
      value: tradeCall.call.value,
      dataLength: tradeCall.call.data.length
    })
    
    // Step 2: Create simple hookData
    const hookData = createSimpleHookData(REFERRAL_ADDRESS)
    
    // Step 3: Try to decode the Universal Router call
    console.log('🔍 Attempting to decode Universal Router call...')
    
    try {
      // Try to decode the call data using viem's decodeFunctionData
      const decoded = decodeFunctionData({
        abi: UNIVERSAL_ROUTER_ABI,
        data: tradeCall.call.data as Hex
      })
      
      console.log('✅ Successfully decoded Universal Router call:', {
        functionName: decoded.functionName,
        args: decoded.args
      })
      
      // Extract the original parameters
      const [originalCommands, originalInputs, originalDeadline] = decoded.args
      
      console.log('📊 Extracted parameters:', {
        commands: originalCommands,
        inputsCount: originalInputs.length,
        deadline: originalDeadline.toString()
      })
      
      // Step 4: Execute with hookData
      console.log('🚀 Executing Universal Router with referral hookData...')
      
      const hash = await walletClient.writeContract({
        address: UNIVERSAL_ROUTER_ADDRESS,
        abi: UNIVERSAL_ROUTER_ABI,
        functionName: 'execute',
        args: [
          originalCommands,
          originalInputs,
          originalDeadline,
          hookData  // 🎯 This is the key - include hookData!
        ],
        value: BigInt(tradeCall.call.value),
        account: walletClient.account!
      })
      
      console.log('✅ Universal Router executed with referral:', hash)
      console.log('💡 This should earn you 4% of trade fees in ZORA tokens!')
      
      return hash
      
    } catch (decodeError) {
      console.error('❌ Failed to decode Universal Router call:', decodeError)
      throw new Error('Could not decode Universal Router call data')
    }
    
  } catch (error) {
    console.error('❌ Universal Router execution failed:', error)
    throw error
  }
}

// Test function to verify hookData encoding
export function testHookDataEncoding() {
  console.log('🧪 Testing hookData encoding...')
  
  const hookData = createSimpleHookData(REFERRAL_ADDRESS)
  
  console.log('📊 HookData encoding results:')
  console.log('  Referral address:', REFERRAL_ADDRESS)
  console.log('  Encoded hookData:', hookData)
  console.log('  Length:', hookData.length, 'characters')
  
  return { hookData }
}
