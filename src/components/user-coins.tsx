import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { TrendingUp, TrendingDown } from "lucide-react"

export function UserCoins({ address }: { address: string }) {
  const claimedCoins = Array.from({ length: 3 }, (_, i) => ({
    id: `coin-${i}`,
    name: `Creator Coin ${i + 1}`,
    symbol: `CR${i + 1}`,
    image: `/placeholder.svg?height=40&width=40&query=coin+${i + 1}`,
    verified: i === 0,
    currentPrice: Math.random() * 100,
    marketCap: Math.random() * 10000000,
    priceChange24h: (Math.random() - 0.5) * 20,
  }))

  const createdCoins = Array.from({ length: 2 }, (_, i) => ({
    id: `created-${i}`,
    name: `My Coin ${i + 1}`,
    symbol: `MY${i + 1}`,
    image: `/placeholder.svg?height=40&width=40&query=my+coin+${i + 1}`,
    currentPrice: Math.random() * 100,
    holders: Math.floor(Math.random() * 1000),
    priceChange24h: (Math.random() - 0.5) * 20,
  }))

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="glass-card border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Claimed Coins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {claimedCoins.map((coin) => (
            <Link
              key={coin.id}
              href={`/coin/${coin.id}`}
              className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-primary/20"
            >
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 rounded-xl">
                  <AvatarImage src={coin.image || "/placeholder.svg"} alt={coin.name} />
                  <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-semibold flex items-center gap-2">
                    {coin.name}
                    {coin.verified && (
                      <Badge variant="outline" className="border-primary text-primary text-xs rounded-full">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold font-mono">${coin.currentPrice.toFixed(2)}</div>
                <div className="text-sm text-muted-foreground">${(coin.marketCap / 1000000).toFixed(2)}M</div>
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
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-border rounded-2xl">
        <CardHeader>
          <CardTitle className="text-xl">Created Coins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {createdCoins.map((coin) => (
            <Link
              key={coin.id}
              href={`/coin/${coin.id}`}
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
              </div>
              <div className="text-right">
                <div className="font-semibold font-mono">${coin.currentPrice.toFixed(2)}</div>
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
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
