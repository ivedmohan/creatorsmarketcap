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
  const { isConnected, connectionStatus } = useWebSocket()
  const { activities: realtimeActivities, isLive } = useRealtimeActivity(address)

  // Update activities when real-time data changes
  useEffect(() => {
    if (realtimeActivities.length > 0) {
      console.log(`📊 Updated activity feed with ${realtimeActivities.length} real-time activities`)
      setActivities(realtimeActivities.slice(0, 10)) // Take most recent 10
      setLoading(false)
      setError(null)
    }
  }, [realtimeActivities])

  // Fallback to API if no real-time data
  useEffect(() => {
    if (!isLive && address) {
      const fetchActivities = async () => {
        try {
          setLoading(true)
          setError(null)
          
          // Try DexScreener first, fallback to our API
          let response = await fetch(`/api/coins/${address}/dexscreener-activity`)
          let data = await response.json()
          
          // If DexScreener fails, fallback to our API
          if (!data.success || !data.data?.activities) {
            console.log('📊 DexScreener activity failed, falling back to API')
            response = await fetch(`/api/coins/${address}?includeDetails=true`)
            data = await response.json()
            
            if (data.success && data.data?.recentSwaps) {
              const recentSwaps = data.data.recentSwaps.slice(0, 10)
              console.log('📊 Activity feed received swaps from API:', recentSwaps.length, recentSwaps)
              setActivities(recentSwaps)
            } else {
              console.log('📊 No recent swaps found in API response:', data)
              setActivities([])
            }
          } else {
            const activities = data.data.activities.slice(0, 10)
            console.log('📊 Activity feed received activities from DexScreener:', activities.length, activities)
            setActivities(activities)
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
    
    // Handle very large numbers (like the ones we're seeing)
    if (num >= 1e18) return `${(num / 1e18).toFixed(1)}Q` // Quintillion
    if (num >= 1e15) return `${(num / 1e15).toFixed(1)}P` // Quadrillion  
    if (num >= 1e12) return `${(num / 1e12).toFixed(1)}T` // Trillion
    if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`   // Billion
    if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`  // Million
    if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`  // Thousand
    
    // For smaller numbers, show more precision
    if (num >= 1) return num.toFixed(2)
    if (num >= 0.01) return num.toFixed(4)
    return num.toFixed(6)
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
                  <div className="text-sm font-semibold">{amount}</div>
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

