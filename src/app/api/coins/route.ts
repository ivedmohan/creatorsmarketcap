// API route for fetching creator coins list
import { NextRequest, NextResponse } from 'next/server'
import { zoraClient } from '@/lib/zora'
import { ApiResponse, CoinListResponse } from '@/types'

// In-memory cache for API responses (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get('sortBy') || 'marketCap'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const after = searchParams.get('after') || undefined
    const search = searchParams.get('search') || ''

    // Create cache key
    const cacheKey = `coins-${sortBy}-${page}-${limit}-${after || 'none'}-${search}`
    
    // Check cache first
    const cachedResult = getCachedData(cacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    let result
    
    // Fetch coins based on sort criteria
    switch (sortBy) {
      case 'topGainers':
        result = await zoraClient.getTopGainers(limit, after)
        break
      case 'topVolume':
        result = await zoraClient.getTopVolume(limit, after)
        break
      case 'mostValuable':
      case 'marketCap':
        result = await zoraClient.getMostValuable(limit, after)
        break
      case 'new':
        result = await zoraClient.getNewCoins(limit, after)
        break
      case 'recentlyTraded':
        result = await zoraClient.getRecentlyTraded(limit, after)
        break
      case 'creators':
        result = await zoraClient.getCreatorCoins(limit, after)
        break
      case 'valuableCreators':
        result = await zoraClient.getMostValuableCreatorCoins(limit, after)
        break
      default:
        result = await zoraClient.getMostValuable(limit, after)
    }

    // Log how many coins were actually returned
    console.log(`API /coins: Requested ${limit} coins, got ${result.coins.length} coins from Zora SDK`)

    // Filter by search term if provided
    let filteredCoins = result.coins
    if (search) {
      const searchTerm = search.toLowerCase()
      filteredCoins = result.coins.filter(coin => 
        coin.name.toLowerCase().includes(searchTerm) ||
        coin.symbol.toLowerCase().includes(searchTerm) ||
        coin.creatorAddress.toLowerCase().includes(searchTerm) ||
        coin.contractAddress.toLowerCase().includes(searchTerm) // Also search by contract address
      )
    }

    const response: ApiResponse<CoinListResponse> = {
      success: true,
      data: {
        coins: filteredCoins,
        total: filteredCoins.length,
        page,
        limit,
        hasNextPage: result.hasNextPage,
        endCursor: result.endCursor
      }
    }

    // Cache the result
    setCachedData(cacheKey, response)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching coins:', error)
    
    const errorResponse: ApiResponse<null> = {
      success: false,
      error: 'Failed to fetch coins',
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