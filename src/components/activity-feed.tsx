"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowUpRight, ArrowDownRight, Wifi, WifiOff } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { useRealtimeActivity, useWebSocket } from '@/hooks/useWebSocket'

interface ActivityFeedProps {
  address: string
}

interface SwapActivity {
  activityType: string
  coinAmount: string
  senderAddress: string
  blockTimestamp: string | number
  transactionHash: string
}

export function ActivityFeed({ address }: ActivityFeedProps) {
  const [activities, setActivities] = useState<SwapActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Real-time data hooks
  const { isConnected } = useWebSocket()
  const { recentSwaps, lastUpdate, isLive } = useRealtimeActivity(address)

  // Update activities when real-time data changes
  useEffect(() => {
    if (recentSwaps.length > 0) {
      console.log(`📊 Updated activity feed with ${recentSwaps.length} real-time swaps`)
      setActivities(recentSwaps.slice(0, 10)) // Take most recent 10
      setLoading(false)
      setError(null)
    }
  }, [recentSwaps])

  // Fallback to API if no real-time data
  useEffect(() => {
    if (!isLive && address) {
      const fetchActivities = async () => {
        try {
          setLoading(true)
          setError(null)
          
          const response = await fetch(`/api/coins/${address}?includeDetails=true`)
          const data = await response.json()
          
          if (data.success && data.data?.recentSwaps) {
            const recentSwaps = data.data.recentSwaps.slice(0, 10)
            setActivities(recentSwaps)
          } else {
            setActivities([])
          }
        } catch (err) {
          console.error('Failed to fetch activities:', err)
          setError('Failed to load recent activity')
          setActivities([])
        } finally {
          setLoading(false)
        }
      }

      fetchActivities()
    }
  }, [address, isLive])

  const formatTimeAgo = (timestamp: string | number) => {
    const now = Date.now()
    const time = typeof timestamp === 'string' ? new Date(timestamp).getTime() : timestamp * 1000
    const diffMs = now - time
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatAmount = (amount: string) => {
    const num = parseFloat(amount)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(2)
  }

  if (loading) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No recent trading activity</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          {isLive && (
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              {isConnected ? (
                <>
                  <Wifi className="w-3 h-3 text-green-500" />
                  Live
                </>
              ) : (
                <>
                  <WifiOff className="w-3 h-3 text-red-500" />
                  Offline
                </>
              )}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {activities.map((activity, i) => {
            const isBuy = activity.activityType === 'BUY'
            const amount = formatAmount(activity.coinAmount)
            const timeAgo = formatTimeAgo(activity.blockTimestamp)
            const shortAddress = formatAddress(activity.senderAddress)
            
            return (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge
                    variant={isBuy ? "default" : "secondary"}
                    className={`rounded-full ${isBuy ? "bg-green-500 text-white" : "bg-red-500 text-white"}`}
                  >
                    {isBuy ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {isBuy ? 'BUY' : 'SELL'}
                  </Badge>
                  <span className="text-sm font-mono">{shortAddress}</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">{amount} tokens</div>
                  <div className="text-xs text-muted-foreground">
                    {timeAgo}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

