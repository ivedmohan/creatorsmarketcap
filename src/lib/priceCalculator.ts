// Price calculation utilities for Zora creator coins
// Based on bonding curve mechanics

interface PricePoint {
  timestamp: number
  price: number
  volume: number
  type: 'BUY' | 'SELL'
}

interface BondingCurveParams {
  basePrice: number
  reserveRatio: number
  curveFactor: number
}

export class PriceCalculator {
  // Zora bonding curve parameters (typical values)
  private static readonly DEFAULT_CURVE: BondingCurveParams = {
    basePrice: 0.0001, // Base price in ETH
    reserveRatio: 0.5,  // Reserve ratio
    curveFactor: 1.0    // Curve steepness
  }

  /**
   * Calculate price using bonding curve formula
   * Price = Base Price * (1 + Supply / Reserve) ^ Curve Factor
   */
  static calculatePrice(
    supply: number, 
    curve: BondingCurveParams = this.DEFAULT_CURVE
  ): number {
    const { basePrice, reserveRatio, curveFactor } = curve
    const reserve = supply * reserveRatio
    
    if (reserve === 0) return basePrice
    
    return basePrice * Math.pow(1 + supply / reserve, curveFactor)
  }

  /**
   * Calculate ETH amount for a given coin amount using bonding curve
   */
  static calculateEthAmount(
    coinAmount: number,
    currentSupply: number,
    curve: BondingCurveParams = this.DEFAULT_CURVE
  ): number {
    const priceBefore = this.calculatePrice(currentSupply, curve)
    const priceAfter = this.calculatePrice(currentSupply + coinAmount, curve)
    
    // Average price method
    return coinAmount * ((priceBefore + priceAfter) / 2)
  }

  /**
   * Calculate price per coin from swap data
   */
  static calculatePriceFromSwap(
    coinAmount: number,
    ethAmount: number,
    currentSupply: number
  ): number {
    if (coinAmount === 0) return 0
    return ethAmount / coinAmount
  }

  /**
   * Generate price history from swap data
   */
  static async generatePriceHistory(
    swaps: any[],
    coinAddress: string
  ): Promise<PricePoint[]> {
    // Sort swaps by timestamp
    const sortedSwaps = swaps.sort((a, b) => {
      const timeA = typeof a.blockTimestamp === 'string' 
        ? new Date(a.blockTimestamp).getTime()
        : a.blockTimestamp * 1000
      const timeB = typeof b.blockTimestamp === 'string' 
        ? new Date(b.blockTimestamp).getTime()
        : b.blockTimestamp * 1000
      return timeA - timeB
    })

    // Track supply over time
    let currentSupply = 0
    const pricePoints: PricePoint[] = []

    for (const swap of sortedSwaps) {
      const timestamp = typeof swap.blockTimestamp === 'string' 
        ? new Date(swap.blockTimestamp).getTime()
        : swap.blockTimestamp * 1000

      const coinAmount = parseFloat(swap.coinAmount || '0')
      
      // Update supply based on swap type
      if (swap.activityType === 'BUY') {
        currentSupply += coinAmount
      } else if (swap.activityType === 'SELL') {
        currentSupply -= coinAmount
      }

      // Calculate price at this point
      const price = this.calculatePrice(currentSupply)
      
      pricePoints.push({
        timestamp,
        price,
        volume: coinAmount,
        type: swap.activityType
      })
    }

    return pricePoints
  }

  /**
   * Fetch historical ETH prices from CoinGecko
   */
  static async fetchEthPriceHistory(days: number = 7): Promise<Map<number, number>> {
    try {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=${days}`
      )
      const data = await response.json()
      
      const priceMap = new Map<number, number>()
      
      if (data.prices) {
        data.prices.forEach(([timestamp, price]: [number, number]) => {
          // Round timestamp to hour for caching
          const hourTimestamp = Math.floor(timestamp / (1000 * 60 * 60)) * (1000 * 60 * 60)
          priceMap.set(hourTimestamp, price)
        })
      }
      
      return priceMap
    } catch (error) {
      console.error('Failed to fetch ETH price history:', error)
      return new Map()
    }
  }

  /**
   * Convert ETH prices to USD using historical data
   */
  static convertToUSD(
    pricePoints: PricePoint[],
    ethPriceHistory: Map<number, number>
  ): PricePoint[] {
    return pricePoints.map(point => {
      // Find closest ETH price for this timestamp
      const hourTimestamp = Math.floor(point.timestamp / (1000 * 60 * 60)) * (1000 * 60 * 60)
      const ethPrice = ethPriceHistory.get(hourTimestamp) || 3500 // Fallback
      
      return {
        ...point,
        price: point.price * ethPrice // Convert ETH to USD
      }
    })
  }
}
