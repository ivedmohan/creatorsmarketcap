"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { TrendingUp, Users, DollarSign, Activity } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import type { CreatorCoin } from "@/types"

export function StatsOverview() {
  const [stats, setStats] = useState({
    totalCoins: 0,
    totalHolders: 0,
    totalVolume: 0,
    marketCap: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch coins (Zora API likely limits to 20 per request)
        const response = await fetch('/api/coins?sortBy=mostValuable&limit=100')
        const data = await response.json()
        
        if (data.success && data.data.coins) {
          const coins = data.data.coins as CreatorCoin[]
          
          // Note: Zora SDK likely returns max 20 coins per request
          // So we extrapolate stats based on available data
          const returnedCoins = coins.length
          
          // Sum up holders from returned coins
          const totalHolders = coins.reduce((sum: number, coin: CreatorCoin) => sum + (coin.holders || 0), 0)
          
          // Sum up 24h volume
          const totalVolume = coins.reduce((sum: number, coin: CreatorCoin) => sum + (coin.volume24h || 0), 0)
          
          // Sum up market cap
          const marketCap = coins.reduce((sum: number, coin: CreatorCoin) => sum + (coin.marketCap || 0), 0)

          console.log(`Stats Overview: ${returnedCoins} coins received from API, ${totalHolders.toLocaleString()} holders, $${(totalVolume/1000000).toFixed(2)}M volume`)

          setStats({
            totalCoins: returnedCoins,
            totalHolders,
            totalVolume,
            marketCap
          })
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    )
  }

      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Top Coins</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalCoins.toLocaleString()}</h3>
                <p className="text-xs text-muted-foreground mt-1">Most valuable</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-chart-1/20">
                <Activity className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Holders</p>
                <h3 className="text-2xl font-bold mt-1">{stats.totalHolders.toLocaleString()}</h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-chart-2/20">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.totalVolume >= 1000000
                    ? (stats.totalVolume / 1000000).toFixed(2) + 'M'
                    : stats.totalVolume >= 1000
                    ? (stats.totalVolume / 1000).toFixed(2) + 'K'
                    : stats.totalVolume.toFixed(2)
                  }
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-chart-3/20">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="glass-card rounded-2xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <h3 className="text-2xl font-bold mt-1">
                  ${stats.marketCap >= 1000000
                    ? (stats.marketCap / 1000000).toFixed(2) + 'M'
                    : stats.marketCap >= 1000
                    ? (stats.marketCap / 1000).toFixed(2) + 'K'
                    : stats.marketCap.toFixed(2)
                  }
                </h3>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary/20 to-chart-4/20">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>
      )
}
