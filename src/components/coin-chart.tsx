"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Wifi, WifiOff } from "lucide-react"
import { Line } from "react-chartjs-2"
import { useRealtimeChart, useWebSocket } from '@/hooks/useWebSocket'
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
  
  // Real-time data hooks
  const { isConnected } = useWebSocket()
  const { priceHistory, recentSwaps, lastUpdate, isLive } = useRealtimeChart(address)

  // Update chart data when real-time data changes
  useEffect(() => {
    if (priceHistory.length > 0) {
      const chartPoints = priceHistory.map((point: any) => ({
        timestamp: point.timestamp,
        price: point.price,
        volume: point.volume,
        type: point.type
      }))
      
      console.log(`📈 Updated chart with ${chartPoints.length} real-time price points`)
      setChartData(chartPoints)
      setLoading(false)
      setError(null)
    }
  }, [priceHistory])

  // Fallback to API if no real-time data
  useEffect(() => {
    if (!isLive && address) {
      const fetchChartData = async () => {
        setLoading(true)
        setError(null)
        
        try {
          const response = await fetch(`/api/coins/${address}/price-history?timeframe=${timeframe}`)
          const data = await response.json()
          
          if (data.success && data.data?.priceHistory) {
            const chartPoints = data.data.priceHistory.map((point: any) => ({
              timestamp: point.timestamp,
              price: point.price,
              volume: point.volume,
              type: point.type
            }))
            
            console.log(`📈 Loaded ${chartPoints.length} API price points`)
            setChartData(chartPoints)
          } else {
            setChartData([])
          }
        } catch (err) {
          console.error('Failed to fetch price history:', err)
          setError('Failed to load price history')
          setChartData([])
        } finally {
          setLoading(false)
        }
      }

      fetchChartData()
    }
  }, [address, timeframe, isLive])

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
          <div className="flex items-center gap-3">
            <CardTitle>Price Chart</CardTitle>
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
              No trading data available for this coin
            </p>
            <p className="text-xs text-muted-foreground mt-2 opacity-60">
              Real price history will appear once trading activity is recorded
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

