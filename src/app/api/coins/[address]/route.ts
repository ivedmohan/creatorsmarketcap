// API route for fetching individual coin details
import { NextRequest, NextResponse } from 'next/server'
import { zoraClient, zoraUtils } from '@/lib/zora'
import { ApiResponse } from '@/types'

// In-memory cache for coin details (2 minutes for more frequent updates)
const CACHE_DURATION = 2 * 60 * 1000 // 2 minutes
const cache = new Map<string, { data: any, timestamp: number }>()

function getCachedData(key: string) {
  const cached = cache.get(key)
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    return cached.data
  }
  return null
}

function setCachedData(key: string, data: any) {
  cache.set(key, { data, timestamp: Date.now() })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params
  
  try {
    const { searchParams } = new URL(request.url)
    const includeDetails = searchParams.get('includeDetails') === 'true'

    // Validate address format
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return NextResponse.json({
        success: false,
        error: 'Invalid coin address format'
      }, { status: 400 })
    }

    // Create cache key
    const cacheKey = `coin-${address}-${includeDetails ? 'detailed' : 'basic'}`
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    let result

    if (includeDetails) {
      // Get comprehensive coin data including holders, swaps, and comments
      result = await zoraUtils.getCoinWithDetails(address)
    } else {
      // Get basic coin information only
      const coin = await zoraClient.getCoin(address)
      result = { coin }
    }

    if (!result.coin) {
      return NextResponse.json({
        success: false,
        error: 'Coin not found',
        message: `No coin found with address ${address}`
      }, { status: 404 })
    }

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result
    }

    // Cache the result
    setCachedData(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error(`Error fetching coin ${address}:`, error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch coin details',
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