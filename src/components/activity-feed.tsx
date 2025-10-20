import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight } from "lucide-react"

interface ActivityFeedProps {
  address: string
}

export function ActivityFeed({ address }: ActivityFeedProps) {
  const activities = Array.from({ length: 10 }, (_, i) => ({
    type: Math.random() > 0.5 ? "buy" : "sell",
    address: `0x${Math.random().toString(16).slice(2, 10)}...`,
    amount: Math.floor(Math.random() * 1000),
    price: (Math.random() * 100).toFixed(2),
    time: `${Math.floor(Math.random() * 60)}m ago`,
  }))

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant={activity.type === "buy" ? "default" : "secondary"}
                  className={`rounded-full ${activity.type === "buy" ? "bg-chart-4 text-white" : ""}`}
                >
                  {activity.type === "buy" ? (
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-3 h-3 mr-1" />
                  )}
                  {activity.type.toUpperCase()}
                </Badge>
                <span className="text-sm font-mono">{activity.address}</span>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">{activity.amount} tokens</div>
                <div className="text-xs text-muted-foreground">
                  ${activity.price} · {activity.time}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

