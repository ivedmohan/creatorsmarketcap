"use client"

import { use } from "react"
import { Header } from "@/components/header"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExternalLink, Twitter, Globe } from "lucide-react"
import Link from "next/link"

export default function UserProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params)
  const user = {
    address: resolvedParams.address,
    displayName: "Creator Name",
    handle: "@creator",
    bio: "Building amazing things on Base blockchain. Creator of multiple successful coins.",
    avatar: "/creator-avatar.png",
    trustScore: 85,
    followers: 12500,
    following: 342,
  }

  const createdCoins = Array.from({ length: 3 }, (_, i) => ({
    id: `created-${i}`,
    name: `Created Coin ${i + 1}`,
    symbol: `CRT${i + 1}`,
    image: `/placeholder.svg?height=40&width=40&query=coin+${i + 1}`,
    currentPrice: Math.random() * 100,
    priceChange24h: Math.random() * 20 - 10,
    marketCap: Math.random() * 10000000,
  }))

  const claimedCoins = Array.from({ length: 5 }, (_, i) => ({
    id: `claimed-${i}`,
    name: `Claimed Coin ${i + 1}`,
    symbol: `CLM${i + 1}`,
    image: `/placeholder.svg?height=40&width=40&query=claimed+${i + 1}`,
    balance: Math.floor(Math.random() * 10000),
    value: Math.random() * 50000,
  }))

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="glass-card rounded-2xl p-8 mb-8 border border-white/10">
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-32 h-32 ring-4 ring-primary/20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.displayName} />
              <AvatarFallback className="text-3xl">{user.displayName[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{user.displayName}</h1>
                    <Badge variant="outline" className="border-chart-4 text-chart-4 rounded-full">
                      Trust Score: {user.trustScore}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-lg">{user.handle}</p>
                  <p className="text-sm font-mono text-muted-foreground mt-1">{user.address}</p>
                </div>
              </div>

              <p className="text-muted-foreground mb-4 text-pretty">{user.bio}</p>

              <div className="flex items-center gap-6 mb-4">
                <div>
                  <span className="font-bold text-lg">{user.followers.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold text-lg">{user.following.toLocaleString()}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" size="sm" className="rounded-full bg-transparent hover:bg-white/10">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent hover:bg-white/10">
                  <Globe className="w-4 h-4 mr-2" />
                  Website
                </Button>
                <Button variant="outline" size="sm" className="rounded-full bg-transparent hover:bg-white/10">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Basescan
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle>Created Coins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {createdCoins.map((coin) => (
                <Link key={coin.id} href={`/coin/${coin.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                        <AvatarImage src={coin.image || "/placeholder.svg"} alt={coin.name} />
                        <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{coin.name}</div>
                        <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${coin.currentPrice.toFixed(2)}</div>
                      <div className={`text-sm ${coin.priceChange24h >= 0 ? "text-chart-4" : "text-destructive"}`}>
                        {coin.priceChange24h >= 0 ? "+" : ""}
                        {coin.priceChange24h.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-white/10 rounded-2xl">
            <CardHeader>
              <CardTitle>Claimed Coins</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {claimedCoins.map((coin) => (
                <Link key={coin.id} href={`/coin/${coin.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10 ring-2 ring-primary/20">
                        <AvatarImage src={coin.image || "/placeholder.svg"} alt={coin.name} />
                        <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">{coin.name}</div>
                        <div className="text-sm text-muted-foreground">{coin.balance.toLocaleString()} tokens</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">${coin.value.toFixed(2)}</div>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

