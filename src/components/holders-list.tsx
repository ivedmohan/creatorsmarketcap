"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

interface HoldersListProps {
  address: string
}

interface Holder {
  address: string
  balance: string
  percentage: number
}

export function HoldersList({ address }: HoldersListProps) {
  const [holders, setHolders] = useState<Holder[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchHolders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const response = await fetch(`/api/coins/${address}?includeDetails=true`)
        const data = await response.json()
        
        if (data.success && data.data?.holders) {
          // Take the top 5 holders
          const topHolders = data.data.holders.slice(0, 5)
          setHolders(topHolders)
        } else {
          setHolders([])
        }
      } catch (err) {
        console.error('Failed to fetch holders:', err)
        setError('Failed to load holders data')
        setHolders([])
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchHolders()
    }
  }, [address])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toFixed(2)
  }

  if (loading) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Top Holders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Top Holders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (holders.length === 0) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Top Holders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No holder data available</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Top Holders</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {holders.map((holder, i) => {
          const shortAddress = formatAddress(holder.address)
          const formattedBalance = formatBalance(holder.balance)
          
          return (
            <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
              <div className="flex items-center gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs">{i + 1}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-mono">{shortAddress}</p>
                  <p className="text-xs text-muted-foreground">{formattedBalance} tokens</p>
                </div>
              </div>
              <span className="text-sm font-semibold">{holder.percentage.toFixed(2)}%</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
