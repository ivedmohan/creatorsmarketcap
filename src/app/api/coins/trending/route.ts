// API route for fetching trending coins
import { NextRequest, NextResponse } from 'next/server'
import { zoraUtils } from '@/lib/zora'
import { ApiResponse } from '@/types'

// Cache trending coins for 3 minutes
const CACHE_DURATION = 3 * 60 * 1000 // 3 minutes
let cachedTrending: { data: any, timestamp: number } | null = null

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const count = parseInt(searchParams.get('count') || '20')

    // Check cache first
    if (cachedTrending && (Date.now() - cachedTrending.timestamp) < CACHE_DURATION) {
      return NextResponse.json(cachedTrending.data)
    }

    // Fetch trending coins (use top gainers as trending)
    let trendingCoins
    try {
      trendingCoins = await zoraUtils.getTrendingCoins(count)
    } catch (error) {
      console.log('getTrendingCoins failed, using top gainers as fallback')
      // Fallback to top gainers
      const { zoraClient } = await import('@/lib/zora')
      const result = await zoraClient.getTopGainers(count)
      trendingCoins = result.coins || []
    }

    const response: ApiResponse<typeof trendingCoins> = {
      success: true,
      data: trendingCoins
    }

    // Cache the result
    cachedTrending = { data: response, timestamp: Date.now() }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching trending coins:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch trending coins',
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