// Utilities for ownership verification

import { isValidAddress } from './dataTransforms'

// Generate the standard message for ownership verification
export function generateVerificationMessage(coinAddress: string, userAddress: string): string {
  return `I am claiming ownership of coin ${coinAddress} with my wallet ${userAddress}`
}

// Validate verification parameters
export function validateVerificationParams(
  coinAddress: string, 
  userAddress: string, 
  signature: string, 
  message: string
): { isValid: boolean; error?: string } {
  // Check if all parameters are provided
  if (!coinAddress || !userAddress || !signature || !message) {
    return {
      isValid: false,
      error: 'Missing required parameters: coinAddress, userAddress, signature, and message are required'
    }
  }

  // Validate address formats
  if (!isValidAddress(coinAddress)) {
    return {
      isValid: false,
      error: 'Invalid coin address format'
    }
  }

  if (!isValidAddress(userAddress)) {
    return {
      isValid: false,
      error: 'Invalid user address format'
    }
  }

  // Validate signature format (basic check)
  if (!signature.startsWith('0x') || signature.length !== 132) {
    return {
      isValid: false,
      error: 'Invalid signature format'
    }
  }

  // Validate message format
  const expectedMessage = generateVerificationMessage(coinAddress, userAddress)
  if (message !== expectedMessage) {
    return {
      isValid: false,
      error: `Invalid message format. Expected: "${expectedMessage}"`
    }
  }

  return { isValid: true }
}

// Helper to create verification data for frontend
export function createVerificationData(coinAddress: string, userAddress: string) {
  return {
    message: generateVerificationMessage(coinAddress, userAddress),
    coinAddress,
    userAddress,
    timestamp: Date.now()
  }
}

// Types for verification
export interface VerificationRequest {
  coinAddress: string
  userAddress: string
  signature: string
  message: string
}

export interface VerificationResponse {
  success: boolean
  verified: boolean
  claim?: {
    coinId: string
    userAddress: string
    signature: string
    verified: boolean
    claimedAt: Date
  }
  error?: string
  message?: string
}

export interface OwnershipStatus {
  coinAddress: string
  userAddress?: string
  isClaimed: boolean
  isVerified: boolean
  totalClaims?: number
  claims?: Array<{
    userAddress: string
    claimedAt: Date
    verified: boolean
  }>
}