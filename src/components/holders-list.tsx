import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface HoldersListProps {
  address: string
}

export function HoldersList({ address }: HoldersListProps) {
  const holders = Array.from({ length: 5 }, (_, i) => ({
    address: `0x${Math.random().toString(16).slice(2, 10)}...`,
    balance: Math.floor(Math.random() * 10000),
    percentage: (Math.random() * 20).toFixed(2),
  }))

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Top Holders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {holders.map((holder, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">{i + 1}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-mono">{holder.address}</p>
                <p className="text-xs text-muted-foreground">{holder.balance.toLocaleString()} tokens</p>
              </div>
            </div>
            <span className="text-sm font-semibold">{holder.percentage}%</span>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
