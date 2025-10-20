"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions
} from "chart.js"

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface CoinChartProps {
  address: string
}

interface SwapData {
  timestamp: number
  price: number
  volume: number
  type: 'BUY' | 'SELL'
}

export function CoinChart({ address }: CoinChartProps) {
  const [timeframe, setTimeframe] = useState("24h")
  const [chartData, setChartData] = useState<SwapData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Fetch coin details which includes recent swap data
        const response = await fetch(`/api/coins/${address}?includeDetails=true`)
        const data = await response.json()
        
        console.log('Chart data response:', data)
        
        const coin = data.data?.coin
        const swaps = data.data?.recentSwaps || []
        
        // If we have swaps and coin price data, generate chart
        if (swaps.length > 0 && coin) {
          const currentPrice = coin.currentPrice || 0
          const priceChange24h = coin.priceChange24h || 0
          
          // Calculate price 24h ago
          const price24hAgo = currentPrice / (1 + priceChange24h / 100)
          
          // Create synthetic price data from swap timestamps
          // We'll interpolate prices between 24h ago and current price
          const chartPoints = swaps
            .map((swap: any, index: number) => {
              const timestamp = typeof swap.blockTimestamp === 'string' 
                ? new Date(swap.blockTimestamp).getTime()
                : swap.blockTimestamp * 1000
              
              // Interpolate price based on time position
              const now = Date.now()
              const timeAgo24h = now - (24 * 60 * 60 * 1000)
              const timeProgress = (timestamp - timeAgo24h) / (now - timeAgo24h)
              const interpolatedPrice = price24hAgo + (currentPrice - price24hAgo) * timeProgress
              
              return {
                timestamp,
                price: interpolatedPrice > 0 ? interpolatedPrice : currentPrice,
                volume: parseFloat(swap.coinAmount || '0'),
                type: swap.activityType
              }
            })
            .filter((point: SwapData) => point.price > 0 && point.timestamp > 0)
            .sort((a: SwapData, b: SwapData) => a.timestamp - b.timestamp) // Oldest first
          
          console.log(`Chart: Generated ${chartPoints.length} price points from ${swaps.length} swaps`)
          setChartData(chartPoints)
        } else {
          console.log('No swap data or coin data available')
          setChartData([])
        }
      } catch (err) {
        console.error('Failed to fetch chart data:', err)
        setError('Failed to load chart data')
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchChartData()
    }
  }, [address, timeframe])

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => {
            const price = context.parsed.y
            return `Price: ${price?.toFixed(8) || '0.00000000'} ETH`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxRotation: 0,
          autoSkipPadding: 50
        },
        border: {
          display: false
        }
      },
      y: {
        display: true,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: (value) => {
            return typeof value === 'number' ? value.toFixed(8) : value
          }
        },
        border: {
          display: false
        }
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  }

  const getChartDataset = () => {
    if (chartData.length === 0) {
      return {
        labels: [],
        datasets: []
      }
    }

    const labels = chartData.map((swap) => {
      const date = new Date(swap.timestamp)
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    })

    const prices = chartData.map((swap) => swap.price)
    const isPositive = chartData.length > 1 && prices[prices.length - 1] >= prices[0]

    return {
      labels,
      datasets: [
        {
          label: 'Price (ETH)',
          data: prices,
          borderColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          backgroundColor: isPositive 
            ? 'rgba(34, 197, 94, 0.1)' 
            : 'rgba(239, 68, 68, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: isPositive ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 2
        }
      ]
    }
  }

  if (loading) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Price Chart</CardTitle>
            <div className="flex gap-2">
              {["24h", "7d", "30d", "1y"].map((tf) => (
                <Skeleton key={tf} className="h-8 w-12 rounded-full" />
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full rounded-xl" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Price Chart</CardTitle>
          <div className="flex gap-2">
            {["24h", "7d", "30d", "1y"].map((tf) => (
              <Button
                key={tf}
                variant={timeframe === tf ? "default" : "outline"}
                size="sm"
                onClick={() => setTimeframe(tf)}
                className="rounded-full"
              >
                {tf}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="h-[300px] flex items-center justify-center bg-gradient-to-br from-destructive/5 to-destructive/10 rounded-xl border border-destructive/20">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-primary/5 to-chart-4/5 rounded-xl border border-white/5 p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No recent trading data available for this coin
            </p>
            <p className="text-xs text-muted-foreground mt-2 opacity-60">
              Chart will appear once trading activity is recorded
            </p>
          </div>
        ) : (
          <div className="h-[300px]">
            <Line data={getChartDataset()} options={chartOptions} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}

