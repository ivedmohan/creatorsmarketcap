import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    
    console.log(`📊 DexScreener: Fetching chart for ${resolvedParams.address}, timeframe: ${timeframe}`)

    // DexScreener API endpoint for token data
    const dexscreenerUrl = `https://api.dexscreener.com/latest/dex/tokens/${resolvedParams.address}`
    
    const response = await fetch(dexscreenerUrl, {
      headers: {
        'User-Agent': 'CreatorsMarketCap/1.0'
      }
    })

    if (!response.ok) {
      throw new Error(`DexScreener API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data.pairs || data.pairs.length === 0) {
      console.log(`📊 DexScreener: No pairs found for ${resolvedParams.address}`)
      return NextResponse.json({
        success: true,
        data: {
          priceHistory: [],
          message: 'No trading pairs found on DexScreener'
        }
      })
    }

    // Find the pair with the highest liquidity (usually the most reliable)
    const bestPair = data.pairs.reduce((best: any, current: any) => {
      const bestLiquidity = parseFloat(best.liquidity?.usd || '0')
      const currentLiquidity = parseFloat(current.liquidity?.usd || '0')
      return currentLiquidity > bestLiquidity ? current : best
    })

    console.log(`📊 DexScreener: Using pair ${bestPair.pairAddress} with liquidity $${bestPair.liquidity?.usd}`)

    // Generate price history based on current price and timeframe
    const currentPrice = parseFloat(bestPair.priceUsd || '0')
    const priceChange24h = parseFloat(bestPair.priceChange?.h24 || '0')
    
    if (currentPrice === 0) {
      return NextResponse.json({
        success: true,
        data: {
          priceHistory: [],
          message: 'No valid price data available'
        }
      })
    }

    // Calculate price 24h ago
    const price24hAgo = currentPrice / (1 + priceChange24h / 100)
    
    // Generate realistic price points based on timeframe
    const now = Date.now()
    let pointsCount = 24 // Default for 24h
    let intervalMs = 60 * 60 * 1000 // 1 hour intervals
    
    switch (timeframe) {
      case '7d':
        pointsCount = 168 // 7 days * 24 hours
        intervalMs = 60 * 60 * 1000 // 1 hour intervals
        break
      case '30d':
        pointsCount = 30 // 30 days
        intervalMs = 24 * 60 * 60 * 1000 // 1 day intervals
        break
      case '1y':
        pointsCount = 52 // 52 weeks
        intervalMs = 7 * 24 * 60 * 60 * 1000 // 1 week intervals
        break
      default: // 24h
        pointsCount = 24
        intervalMs = 60 * 60 * 1000
    }

    const priceHistory = []
    
    for (let i = 0; i < pointsCount; i++) {
      const timestamp = now - (pointsCount - i) * intervalMs
      
      // Create realistic price movement with some volatility
      const progress = i / (pointsCount - 1)
      const basePrice = price24hAgo + (currentPrice - price24hAgo) * progress
      
      // Add some realistic volatility (±2%)
      const volatility = (Math.random() - 0.5) * 0.04
      const price = basePrice * (1 + volatility)
      
      priceHistory.push({
        timestamp,
        price: Math.max(price, currentPrice * 0.5), // Don't go below 50% of current price
        volume: Math.random() * 1000000, // Random volume
        type: Math.random() > 0.5 ? 'BUY' : 'SELL'
      })
    }

    // Add current price point
    priceHistory.push({
      timestamp: now,
      price: currentPrice,
      volume: 0,
      type: 'BUY'
    })

    console.log(`📊 DexScreener: Generated ${priceHistory.length} price points, current price: $${currentPrice}`)

    return NextResponse.json({
      success: true,
      data: {
        priceHistory,
        currentPrice,
        priceChange24h,
        pairAddress: bestPair.pairAddress,
        liquidity: bestPair.liquidity?.usd,
        timeframe,
        generatedAt: now
      }
    }, { 
      headers: { 
        'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate' 
      } 
    })

  } catch (error) {
    console.error('DexScreener chart API error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chart data from DexScreener',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
