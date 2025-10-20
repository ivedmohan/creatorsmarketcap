"use client"

import { useEffect, useState, use } from "react"
import { CoinHeader } from "@/components/coin-header"
import { CoinStats } from "@/components/coin-stats"
import { CoinChart } from "@/components/coin-chart"
import { CreatorProfile } from "@/components/creator-profile"
import { HoldersList } from "@/components/holders-list"
import { ActivityFeed } from "@/components/activity-feed"
import { SwapWidget } from "@/components/swap-widget"
import { Header } from "@/components/header"
import { Skeleton } from "@/components/ui/skeleton"
import type { CreatorCoin } from "@/types"

export default function CoinDetailPage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params)
  const [coin, setCoin] = useState<CreatorCoin | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCoinDetails = async () => {
      try {
        const response = await fetch(`/api/coins/${resolvedParams.address}`)
        const data = await response.json()
        
        console.log('Coin detail API response:', data)
        
        if (data.success && data.data) {
          // API returns {data: {coin: {...}}}, extract the coin object
          const coinData = data.data.coin || data.data
          console.log('Coin data received:', coinData)
          setCoin(coinData)
        } else {
          setError(data.error || 'Failed to load coin details')
        }
      } catch (error) {
        console.error('Failed to fetch coin details:', error)
        setError('Failed to load coin details')
      } finally {
        setLoading(false)
      }
    }

    fetchCoinDetails()
  }, [resolvedParams.address])

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-32 w-full rounded-2xl mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-96 w-full rounded-2xl" />
              <Skeleton className="h-96 w-full rounded-2xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
              <Skeleton className="h-64 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (error || !coin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Coin Not Found</h2>
            <p className="text-muted-foreground">{error || 'This coin does not exist'}</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <CoinHeader address={resolvedParams.address} coin={coin} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          <div className="lg:col-span-2 space-y-6">
            <CoinChart address={resolvedParams.address} />
            <ActivityFeed address={resolvedParams.address} />
          </div>

          <div className="space-y-6">
            <SwapWidget coin={coin} />
            <CoinStats coin={coin} />
            <CreatorProfile address={coin.creatorAddress} />
            <HoldersList address={resolvedParams.address} />
          </div>
        </div>
      </main>
    </div>
  )
}
