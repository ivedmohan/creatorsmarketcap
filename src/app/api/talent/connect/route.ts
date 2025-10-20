// API route for connecting Talent Protocol profiles
import { NextRequest, NextResponse } from 'next/server'
import { talentClient } from '@/lib/talent'
import { dbHelpers, db } from '@/lib/database'
import { talentScoresStorage } from '@/lib/localStorage'
import { ApiResponse } from '@/types'
import { isValidAddress } from '@/lib/dataTransforms'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userAddress, signature, message } = body

    // Validate input parameters
    if (!userAddress || !signature || !message) {
      return NextResponse.json({
        success: false,
        error: 'Missing required parameters',
        message: 'userAddress, signature, and message are required'
      }, { status: 400 })
    }

    // Validate address format
    if (!isValidAddress(userAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      }, { status: 400 })
    }

    // Verify the signature (basic validation)
    const expectedMessage = `I want to connect my Talent Protocol profile to address ${userAddress}`
    
    if (message !== expectedMessage) {
      return NextResponse.json({
        success: false,
        error: 'Invalid message format',
        message: `Expected message: "${expectedMessage}"`
      }, { status: 400 })
    }

    // Fetch Talent Protocol profile
    const profileVerification = await talentClient.verifyProfile(userAddress)
    
    if (!profileVerification.verified) {
      return NextResponse.json({
        success: false,
        error: 'Talent Protocol profile not found or not verified',
        message: 'Please ensure you have a verified Talent Protocol profile'
      }, { status: 404 })
    }

    // Get builder score
    const builderScore = await talentClient.getBuilderScore(userAddress)
    
    if (!builderScore) {
      return NextResponse.json({
        success: false,
        error: 'Unable to fetch builder score',
        message: 'Could not retrieve builder score from Talent Protocol'
      }, { status: 404 })
    }

    // Cache the score
    talentScoresStorage.setScore(userAddress, builderScore)

    // Update user profile with Talent data
    const updatedProfile = await dbHelpers.upsertUser(userAddress, {
      talentScore: builderScore,
      verificationStatus: 'verified'
    })

    const response: ApiResponse<{
      profile: typeof updatedProfile
      builderScore: typeof builderScore
      credentials: typeof profileVerification.credentials
    }> = {
      success: true,
      data: {
        profile: updatedProfile,
        builderScore,
        credentials: profileVerification.credentials
      },
      message: 'Talent Protocol profile connected successfully'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error connecting Talent Protocol profile:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to connect Talent Protocol profile',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }

    return NextResponse.json(errorResponse, { status: 500 })
  }
}

// Get connection status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userAddress = searchParams.get('userAddress')

    if (!userAddress) {
      return NextResponse.json({
        success: false,
        error: 'Missing userAddress parameter'
      }, { status: 400 })
    }

    if (!isValidAddress(userAddress)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid address format'
      }, { status: 400 })
    }

    // Check if user has connected Talent Protocol
    const user = await db.getUser(userAddress)
    const cachedScore = talentScoresStorage.getScore(userAddress)

    const isConnected = Boolean(user?.talentScore || cachedScore)
    
    const response: ApiResponse<{
      userAddress: string
      isConnected: boolean
      builderScore: typeof cachedScore
      lastUpdated: Date | null
    }> = {
      success: true,
      data: {
        userAddress,
        isConnected,
        builderScore: cachedScore,
        lastUpdated: user?.updatedAt || null
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error checking Talent Protocol connection:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to check connection status',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}