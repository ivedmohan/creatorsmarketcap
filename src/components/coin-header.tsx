"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { CreatorCoin } from "@/types"
import { TrendingUp, TrendingDown } from "lucide-react"

interface CoinHeaderProps {
  address: string
  coin: CreatorCoin
}

export function CoinHeader({ address, coin }: CoinHeaderProps) {
  return (
    <div className="glass-card rounded-2xl p-8">
      <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
        <Avatar className="w-24 h-24 rounded-2xl ring-4 ring-primary/20">
          <AvatarImage src={coin.metadata?.image || "/placeholder.svg"} alt={coin.name} />
          <AvatarFallback className="text-2xl">{coin.symbol?.slice(0, 2) || coin.name?.slice(0, 2) || '??'}</AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-bold">{coin.name}</h1>
            {coin.isVerified && (
              <Badge variant="default" className="bg-primary">
                Verified
              </Badge>
            )}
            {coin.isClaimed && (
              <Badge variant="outline" className="border-chart-4 text-chart-4">
                Claimed
              </Badge>
            )}
          </div>
          <p className="text-xl text-muted-foreground mb-4">{coin.symbol}</p>
          <div className="flex flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Price</p>
              <p className="text-2xl font-bold">${coin.currentPrice?.toFixed(6) || '0.000000'}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">24h Change</p>
              <div
                className={`flex items-center gap-1 text-2xl font-bold ${
                  (coin.priceChange24h || 0) >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {(coin.priceChange24h || 0) >= 0 ? (
                  <TrendingUp className="w-6 h-6" />
                ) : (
                  <TrendingDown className="w-6 h-6" />
                )}
                <span>{Math.abs(coin.priceChange24h || 0).toFixed(2)}%</span>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Market Cap</p>
              <p className="text-2xl font-bold">
                ${(coin.marketCap || 0) >= 1000000
                  ? ((coin.marketCap || 0) / 1000000).toFixed(2) + 'M'
                  : (coin.marketCap || 0) >= 1000
                  ? ((coin.marketCap || 0) / 1000).toFixed(2) + 'K'
                  : (coin.marketCap || 0).toFixed(2)
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Holders</p>
              <p className="text-2xl font-bold">{(coin.holders || 0).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
