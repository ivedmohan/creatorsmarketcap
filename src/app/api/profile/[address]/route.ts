// API route for user profiles
import { NextRequest, NextResponse } from 'next/server'
import { zoraClient } from '@/lib/zora'
import { dbHelpers } from '@/lib/database'
import { ApiResponse } from '@/types'
import { isValidAddress } from '@/lib/dataTransforms'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  
  try {
    const { searchParams } = new URL(request.url)
    const includeCoins = searchParams.get('includeCoins') === 'true'

    // Validate address format
    if (!address || !isValidAddress(address)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      }, { status: 400 })
    }

    // Get user profile from local database
    const { db } = await import('@/lib/database')
    const localProfile = await db.getUser(address)
    
    // Get Zora profile
    const zoraProfile = await zoraClient.getProfile(address)
    
    // Get claimed coins
    const claimedCoins = await db.getClaimsByUser(address)

    // Get created coins if requested
    let createdCoins = null
    if (includeCoins) {
      const coinsResult = await zoraClient.getProfileCoins(address, 20)
      createdCoins = coinsResult.coins
    }

    // Combine profile data
    const profile = {
      address,
      // Local data
      localProfile: localProfile ? {
        id: localProfile.id,
        verificationStatus: localProfile.verificationStatus,
        claimedCoins: localProfile.claimedCoins,
        createdAt: localProfile.createdAt,
        updatedAt: localProfile.updatedAt
      } : null,
      // Zora data
      zoraProfile: zoraProfile ? {
        id: zoraProfile.id,
        handle: zoraProfile.handle,
        displayName: zoraProfile.displayName,
        bio: zoraProfile.bio,
        website: zoraProfile.website,
        avatar: zoraProfile.avatar,
        socialAccounts: zoraProfile.socialAccounts,
        linkedWallets: zoraProfile.linkedWallets,
        creatorCoin: zoraProfile.creatorCoin
      } : null,
      // Claims and coins
      claimedCoins: claimedCoins.map(claim => ({
        coinId: claim.coinId,
        verified: claim.verified,
        claimedAt: claim.claimedAt
      })),
      createdCoins: createdCoins || [],
      // Stats
      stats: {
        totalClaimedCoins: claimedCoins.length,
        verifiedClaims: claimedCoins.filter(c => c.verified).length,
        totalCreatedCoins: createdCoins?.length || 0
      }
    }

    const response: ApiResponse<typeof profile> = {
      success: true,
      data: profile
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching profile ${address}:`, error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch profile',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Update user profile (for future use)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  
  try {
    const body = await request.json()

    // Validate address format
    if (!address || !isValidAddress(address)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      }, { status: 400 })
    }

    // Update user profile
    const updatedProfile = await dbHelpers.upsertUser(address, body)

    const response: ApiResponse<typeof updatedProfile> = {
      success: true,
      data: updatedProfile,
      message: 'Profile updated successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error updating profile ${address}:`, error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to update profile',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Handle CORS for development
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}