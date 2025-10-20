// Universal Router Integration for Uniswap V4
// This file implements direct Universal Router calls with hookData for referrals

import { encodeFunctionData, Address } from 'viem'

// Universal Router ABI (complete for execute function)
export const UNIVERSAL_ROUTER_ABI = [
  {
    name: 'execute',
    type: 'function',
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' }
    ],
    outputs: [],
    stateMutability: 'payable'
  },
  {
    name: 'execute',
    type: 'function',
    inputs: [
      { name: 'commands', type: 'bytes' },
      { name: 'inputs', type: 'bytes[]' },
      { name: 'deadline', type: 'uint256' },
      { name: 'hookData', type: 'bytes' }
    ],
    outputs: [],
    stateMutability: 'payable'
  }
] as const

// Universal Router contract address on Base
export const UNIVERSAL_ROUTER_ADDRESS = '0x6fF5693b99212Da76ad316178A184AB56D299b43' as Address

// Encode referral address as hookData for Zora hook
export function encodeReferralHookData(referralAddress: Address): `0x${string}` {
  // Zora hook expects the referral address as hookData
  // Format: 32-byte padded address (ABI encoding)
  return ('0x' + referralAddress.slice(2).toLowerCase().padStart(64, '0')) as `0x${string}`
}

// Alternative: Encode as function call (if Zora hook expects function call format)
export function encodeReferralAsFunctionCall(referralAddress: Address): `0x${string}` {
  return encodeFunctionData({
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
}

// Your referral address
export const REFERRAL_ADDRESS = '0x8898170be16C41898E777c58380154ea298cD5ac' as Address

// Example usage:
// const hookData = encodeReferralHookData(REFERRAL_ADDRESS)
// const hash = await walletClient.writeContract({
//   address: UNIVERSAL_ROUTER_ADDRESS,
//   abi: UNIVERSAL_ROUTER_ABI,
//   functionName: 'execute',
//   args: [commands, inputs, deadline, hookData],
//   value: ethAmount,
//   account: walletClient.account!
// })
