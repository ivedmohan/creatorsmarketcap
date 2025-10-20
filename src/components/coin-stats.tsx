"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { CreatorCoin } from "@/types"

interface CoinStatsProps {
  coin: CreatorCoin
}

export function CoinStats({ coin }: CoinStatsProps) {
  const stats = [
    {
      label: "Market Cap",
      value: `$${(coin.marketCap || 0) >= 1000000 
        ? ((coin.marketCap || 0) / 1000000).toFixed(2) + 'M'
        : (coin.marketCap || 0) >= 1000
        ? ((coin.marketCap || 0) / 1000).toFixed(2) + 'K'
        : (coin.marketCap || 0).toFixed(2)
      }`
    },
    {
      label: "Volume (24h)",
      value: `$${(coin.volume24h || 0) >= 1000000 
        ? ((coin.volume24h || 0) / 1000000).toFixed(2) + 'M'
        : (coin.volume24h || 0) >= 1000
        ? ((coin.volume24h || 0) / 1000).toFixed(2) + 'K'
        : (coin.volume24h || 0).toFixed(2)
      }`
    },
    {
      label: "Total Holders",
      value: (coin.holders || 0).toLocaleString()
    },
    {
      label: "Chain",
      value: coin.chainId === 8453 ? "Base" : `Chain ${coin.chainId || 'Unknown'}`
    }
  ]

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Coin Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <span className="text-sm font-semibold">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

