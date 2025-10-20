// API route for fetching Talent Protocol scores
import { NextRequest, NextResponse } from 'next/server'
import { talentClient, talentUtils } from '@/lib/talent'
import { talentScoresStorage } from '@/lib/localStorage'
import { ApiResponse, BuilderScore } from '@/types'
import { isValidAddress } from '@/lib/dataTransforms'

// Cache duration for talent scores (1 hour)
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')
    const addresses = searchParams.get('addresses')?.split(',')
    const forceRefresh = searchParams.get('forceRefresh') === 'true'

    // Handle single address request
    if (address) {
      if (!isValidAddress(address)) {
        return NextResponse.json({
          success: false,
          error: 'Invalid address format'
        }, { status: 400 })
      }

      // Check cache first (unless force refresh)
      let cachedScore = null
      if (!forceRefresh) {
        cachedScore = talentScoresStorage.getScore(address)
      }

      let builderScore: BuilderScore | null = cachedScore

      // Fetch from API if not cached or force refresh
      if (!builderScore || forceRefresh) {
        builderScore = await talentClient.getBuilderScore(address)
        
        // Cache the result if successful
        if (builderScore) {
          talentScoresStorage.setScore(address, builderScore)
        }
      }

      // Calculate trust score
      const trustScore = builderScore ? talentUtils.calculateTrustScore(builderScore) : null
      const trustLevel = trustScore ? talentUtils.getTrustLevel(trustScore) : null

      const response: ApiResponse<{
        address: string
        builderScore: BuilderScore | null
        trustScore: number | null
        trustLevel: string | null
        cached: boolean
      }> = {
        success: true,
        data: {
          address,
          builderScore,
          trustScore,
          trustLevel,
          cached: Boolean(cachedScore && !forceRefresh)
        }
      }

      return NextResponse.json(response)
    }

    // Handle multiple addresses request
    if (addresses && addresses.length > 0) {
      // Validate all addresses
      const invalidAddresses = addresses.filter(addr => !isValidAddress(addr))
      if (invalidAddresses.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Invalid address format',
          message: `Invalid addresses: ${invalidAddresses.join(', ')}`
        }, { status: 400 })
      }

      // Limit batch size to prevent abuse
      if (addresses.length > 20) {
        return NextResponse.json({
          success: false,
          error: 'Too many addresses',
          message: 'Maximum 20 addresses per request'
        }, { status: 400 })
      }

      const results: Record<string, {
        builderScore: BuilderScore | null
        trustScore: number | null
        trustLevel: string | null
        cached: boolean
      }> = {}

      // Process addresses
      for (const addr of addresses) {
        let cachedScore = null
        if (!forceRefresh) {
          cachedScore = talentScoresStorage.getScore(addr)
        }

        let builderScore: BuilderScore | null = cachedScore

        // Fetch from API if not cached
        if (!builderScore || forceRefresh) {
          try {
            builderScore = await talentClient.getBuilderScore(addr)
            
            if (builderScore) {
              talentScoresStorage.setScore(addr, builderScore)
            }
          } catch (error) {
            console.error(`Error fetching score for ${addr}:`, error)
            builderScore = null
          }
        }

        const trustScore = builderScore ? talentUtils.calculateTrustScore(builderScore) : null
        const trustLevel = trustScore ? talentUtils.getTrustLevel(trustScore) : null

        results[addr] = {
          builderScore,
          trustScore,
          trustLevel,
          cached: Boolean(cachedScore && !forceRefresh)
        }

        // Add delay between requests to respect rate limits
        if (addresses.indexOf(addr) < addresses.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      }

      const response: ApiResponse<typeof results> = {
        success: true,
        data: results
      }

      return NextResponse.json(response)
    }

    // No address provided
    return NextResponse.json({
      success: false,
      error: 'Missing address parameter',
      message: 'Provide either "address" for single lookup or "addresses" for batch lookup'
    }, { status: 400 })

  } catch (error) {
    console.error('Error fetching talent scores:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch talent scores',
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
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}