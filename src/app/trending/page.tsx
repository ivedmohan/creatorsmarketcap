"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Flame } from "lucide-react"
import Link from "next/link"
import type { CreatorCoin } from "@/types"

export default function TrendingPage() {
  const [trendingCoins, setTrendingCoins] = useState<CreatorCoin[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTrendingCoins = async () => {
      try {
        // Try trending first
        let response = await fetch('/api/coins/trending?count=20')
        let data = await response.json()
        
        // If trending returns empty, fallback to top gainers or most valuable
        if (data.success && data.data && data.data.length === 0) {
          console.log('Trending empty, trying top gainers...')
          response = await fetch('/api/coins?sortBy=topGainers&limit=20')
          data = await response.json()
          
          if (data.success && data.data?.coins) {
            setTrendingCoins(data.data.coins)
          }
        } else if (data.success && data.data) {
          setTrendingCoins(data.data)
        }
        
        // Final fallback to most valuable
        if (trendingCoins.length === 0) {
          console.log('Still empty, using most valuable...')
          response = await fetch('/api/coins?sortBy=mostValuable&limit=20')
          data = await response.json()
          
          if (data.success && data.data?.coins) {
            setTrendingCoins(data.data.coins)
          }
        }
      } catch (error) {
        console.error('Failed to fetch trending coins:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchTrendingCoins()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10 bg-gradient-to-br from-primary/10 to-chart-4/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-chart-4">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-4xl font-bold text-balance">Trending Coins</h1>
            </div>
            <p className="text-muted-foreground text-lg">Top performing creator coins in the last 24 hours</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10 bg-gradient-to-br from-primary/10 to-chart-4/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-chart-4">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-balance">Trending Coins</h1>
          </div>
          <p className="text-muted-foreground text-lg">Top performing creator coins in the last 24 hours</p>
        </div>

        {trendingCoins.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No trending coins found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trendingCoins.map((coin, index) => (
              <Link key={coin.id} href={`/coin/${coin.contractAddress}`}>
                <Card className="glass-card border-white/10 rounded-2xl hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20 transition-all cursor-pointer group">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Badge
                        variant="secondary"
                        className="text-lg font-bold rounded-full bg-gradient-to-br from-primary/20 to-chart-4/20"
                      >
                        #{index + 1}
                      </Badge>
                      <Avatar className="w-12 h-12 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        <AvatarImage src={coin.metadata?.image || "/placeholder.svg"} alt={coin.name} />
                        <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-semibold">{coin.name}</div>
                        <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${coin.currentPrice.toFixed(6)}</div>
                        <div className={`flex items-center gap-1 text-sm px-2 py-1 rounded-full ${
                          coin.priceChange24h >= 0 ? 'text-chart-4 bg-chart-4/10' : 'text-destructive bg-destructive/10'
                        }`}>
                          <TrendingUp className="w-4 h-4" />
                          <span>{Math.abs(coin.priceChange24h).toFixed(2)}%</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

