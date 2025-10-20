// API route for verifying coin ownership
import { NextRequest, NextResponse } from 'next/server'
import { zoraClient } from '@/lib/zora'
import { dbHelpers } from '@/lib/database'
import { ApiResponse, OwnershipClaim } from '@/types'
import { verifyMessage } from 'viem'
import { isValidAddress } from '@/lib/dataTransforms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coinAddress, userAddress, signature, message } = body

    // Validate input parameters
    if (!coinAddress || !userAddress || !signature || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        message: 'coinAddress, userAddress, signature, and message are required'
      }, { status: 400 })
    }

    // Validate address formats
    if (!isValidAddress(coinAddress) || !isValidAddress(userAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format',
        message: 'Both coinAddress and userAddress must be valid Ethereum addresses'
      }, { status: 400 })
    }

    // Verify the signature
    const expectedMessage = `I am claiming ownership of coin ${coinAddress} with my wallet ${userAddress}`
    
    if (message !== expectedMessage) {
      return NextResponse.json({
        success: false,
        error: 'Invalid message format',
        message: `Expected message: "${expectedMessage}"`
      }, { status: 400 })
    }

    let isValidSignature = false
    try {
      isValidSignature = await verifyMessage({
        address: userAddress as `0x${string}`,
        message: expectedMessage,
        signature: signature as `0x${string}`
      })
    } catch (error) {
      console.error('Signature verification error:', error)
      return NextResponse.json({
        success: false,
        error: 'Invalid signature',
        message: 'Failed to verify signature'
      }, { status: 400 })
    }

    if (!isValidSignature) {
      return NextResponse.json({
        success: false,
        error: 'Invalid signature',
        message: 'Signature verification failed'
      }, { status: 400 })
    }

    // Verify ownership through Zora
    const isOwner = await zoraClient.verifyOwnership(coinAddress, userAddress)
    
    if (!isOwner) {
      return NextResponse.json({
        success: false,
        error: 'Ownership verification failed',
        message: 'The provided address does not match the coin creator address'
      }, { status: 403 })
    }

    // Create or update ownership claim
    const claim = await dbHelpers.verifyClaim(coinAddress, userAddress, signature)

    // Update user profile
    await dbHelpers.upsertUser(userAddress, {
      verificationStatus: 'verified',
      claimedCoins: [coinAddress] // This will be merged with existing claims
    })

    const response: ApiResponse<{ claim: OwnershipClaim, verified: boolean }> = {
      success: true,
      data: {
        claim,
        verified: true
      },
      message: 'Ownership verified successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error verifying ownership:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Verification failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Get ownership status for a coin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const coinAddress = searchParams.get('coinAddress')
    const userAddress = searchParams.get('userAddress')

    if (!coinAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing coinAddress parameter'
      }, { status: 400 })
    }

    if (!isValidAddress(coinAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coinAddress format'
      }, { status: 400 })
    }

    // If userAddress is provided, check if that specific user has claimed the coin
    if (userAddress) {
      if (!isValidAddress(userAddress)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid userAddress format'
        }, { status: 400 })
      }

      const hasClaimed = await dbHelpers.hasUserClaimedCoin(coinAddress, userAddress)
      
      return NextResponse.json({
        success: true,
        data: {
          coinAddress,
          userAddress,
          isClaimed: hasClaimed,
          isVerified: hasClaimed // In our simple implementation, claimed = verified
        }
      })
    }

    // Get all verified claims for the coin
    const verifiedClaims = await dbHelpers.getVerifiedClaimsForCoin(coinAddress)
    
    return NextResponse.json({
      success: true,
      data: {
        coinAddress,
        totalClaims: verifiedClaims.length,
        claims: verifiedClaims.map(claim => ({
          userAddress: claim.userAddress,
          claimedAt: claim.claimedAt,
          verified: claim.verified
        }))
      }
    })
  } catch (error) {
    console.error('Error checking ownership status:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to check ownership status',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}