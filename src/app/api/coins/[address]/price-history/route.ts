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

    // Always append a live point using the current coin price so the chart includes "now"
    try {
      const origin = new URL(request.url).origin
      const coinRes = await fetch(`${origin}/api/coins/${resolvedParams.address}`, { cache: 'no-store' })
      const coinJson = await coinRes.json()
      const currentPrice = coinJson?.data?.coin?.currentPrice
      
      console.log(`📊 Live point: currentPrice=${currentPrice}, filteredPoints.length=${filteredPoints.length}`)
      
      if (typeof currentPrice === 'number' && currentPrice > 0) {
        const nowTs = Date.now()
        const last = filteredPoints[filteredPoints.length - 1]
        
        console.log(`📊 Last point: timestamp=${last?.timestamp}, price=${last?.price}, age=${last ? (nowTs - last.timestamp) / 1000 : 'N/A'}s`)
        
        // Always append a live point if we have fewer than 2 points or the last point is older than 1 minute
        if (filteredPoints.length < 2 || !last || nowTs - last.timestamp > 60 * 1000) {
          const livePoint = { timestamp: nowTs, price: currentPrice, volume: 0, type: 'BUY' as any }
          filteredPoints = [...filteredPoints, livePoint]
          console.log(`📊 Added live point: ${new Date(nowTs).toISOString()}, price=$${currentPrice}`)
        }
      }
    } catch (e) {
      console.warn('Failed to append live price point:', e)
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
    }, { headers: { 'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate' } })

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
