import { NextRequest, NextResponse } from 'next/server'
import { zoraClient } from '@/lib/zora'
import { PriceCalculator } from '@/lib/priceCalculator'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const resolvedParams = await params
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')
    const timeframe = searchParams.get('timeframe') || '24h'

    console.log(`📊 Fetching price history for ${resolvedParams.address}, ${days} days`)

    // Fetch swap data
    const swapData = await zoraClient.getCoinSwaps(resolvedParams.address, 100)
    const swaps = swapData.swaps || []

          console.log(`📊 Price history API: Found ${swaps.length} swaps for ${resolvedParams.address}`)
          if (swaps.length > 0) {
            console.log('📊 Sample swap:', swaps[0])
            console.log('📊 All swap timestamps:', swaps.map(s => s.blockTimestamp))
          }

    if (swaps.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          priceHistory: [],
          message: 'No trading data available'
        }
      })
    }

    // Generate price history from swaps
          const pricePoints = PriceCalculator.generatePriceHistory(swaps, resolvedParams.address)
    
    // Fetch ETH price history for USD conversion
    const ethPriceHistory = await PriceCalculator.fetchEthPriceHistory(days)
    
    // Convert to USD
    const usdPricePoints = PriceCalculator.convertToUSD(pricePoints, ethPriceHistory)

    // Filter by timeframe
    let filteredPoints = usdPricePoints
    if (timeframe === '24h') {
      const dayAgo = Date.now() - (24 * 60 * 60 * 1000)
      filteredPoints = usdPricePoints.filter(point => point.timestamp >= dayAgo)
    } else if (timeframe === '7d') {
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
      filteredPoints = usdPricePoints.filter(point => point.timestamp >= weekAgo)
    }

    console.log(`📈 Generated ${filteredPoints.length} price points from ${swaps.length} swaps`)

    return NextResponse.json({
      success: true,
      data: {
        priceHistory: filteredPoints,
        totalSwaps: swaps.length,
        timeframe,
        generatedAt: Date.now()
      }
    })

  } catch (error) {
    console.error('Price history API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch price history',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
