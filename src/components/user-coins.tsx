"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"

interface CreatorCoin {
  id: string
  name: string
  symbol: string
  contractAddress: string
  image?: string
  currentPrice: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  holders: number
  verified?: boolean
}

export function UserCoins({ address }: { address: string }) {
  const [createdCoins, setCreatedCoins] = useState<CreatorCoin[]>([])
  const [claimedCoins, setClaimedCoins] = useState<CreatorCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserCoins = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/profile/${address}?includeCoins=true`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const profileData = data.data
          
          // Set created coins
          if (profileData.createdCoins && Array.isArray(profileData.createdCoins)) {
            setCreatedCoins(profileData.createdCoins.map((coin: any) => ({
              id: coin.id,
              name: coin.name,
              symbol: coin.symbol,
              contractAddress: coin.contractAddress,
              image: coin.metadata?.image,
              currentPrice: coin.currentPrice || 0,
              marketCap: coin.marketCap || 0,
              volume24h: coin.volume24h || 0,
              priceChange24h: coin.priceChange24h || 0,
              holders: coin.holders || 0,
              verified: coin.isVerified || false
            })))
          }

          // For now, we'll use mock claimed coins since we don't have that data yet
          // TODO: Implement claimed coins API endpoint
          setClaimedCoins([])
        }
      } catch (err) {
        console.error('Failed to fetch user coins:', err)
        setError('Failed to load coin data')
      } finally {
        setLoading(false)
      }
    }

    fetchUserCoins()
  }, [address])

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass-card border-border rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="glass-card border-border rounded-2xl">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-border rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="text-primary hover:underline">
              Retry
            </button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Claimed Coins */}
      <Card className="glass-card border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Claimed Coins</span>
            <Badge variant="outline" className="text-xs">
              {claimedCoins.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {claimedCoins.length > 0 ? (
            claimedCoins.map((coin) => (
              <Link
                key={coin.id}
                href={`/coin/${coin.contractAddress}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-xl">
                    <AvatarImage src={coin.image || "/placeholder.svg"} alt={coin.name} />
                    <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                  </div>
                  {coin.verified && (
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold font-mono">${coin.currentPrice.toFixed(6)}</div>
                  <div className="text-sm text-muted-foreground">${(coin.marketCap / 1000000).toFixed(1)}M</div>
                  <div
                    className={`text-xs flex items-center justify-end gap-1 ${
                      coin.priceChange24h >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {coin.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(coin.priceChange24h).toFixed(2)}%
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No claimed coins yet</p>
              <p className="text-sm">Claim ownership of coins you hold</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Created Coins */}
      <Card className="glass-card border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span>Created Coins</span>
            <Badge variant="outline" className="text-xs">
              {createdCoins.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {createdCoins.length > 0 ? (
            createdCoins.map((coin) => (
              <Link
                key={coin.id}
                href={`/coin/${coin.contractAddress}`}
                className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-primary/20"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 rounded-xl">
                    <AvatarImage src={coin.image || "/placeholder.svg"} alt={coin.name} />
                    <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                  </div>
                  {coin.verified && (
                    <Badge variant="outline" className="border-primary text-primary text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold font-mono">${coin.currentPrice.toFixed(6)}</div>
                  <div className="text-sm text-muted-foreground">{coin.holders} holders</div>
                  <div
                    className={`text-xs flex items-center justify-end gap-1 ${
                      coin.priceChange24h >= 0 ? "text-primary" : "text-destructive"
                    }`}
                  >
                    {coin.priceChange24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(coin.priceChange24h).toFixed(2)}%
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No coins created yet</p>
              <p className="text-sm">Create your first creator coin on Zora</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}