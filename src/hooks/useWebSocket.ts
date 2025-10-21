"use client"

import { useEffect, useState, useRef } from 'react'

interface CoinUpdate {
  coinAddress: string
  timestamp: number
  coin: {
    currentPrice: number
    priceChange24h: number
    volume24h: number
    marketCap: number
    holders: number
  }
  recentSwaps: any[]
  latestPrice: number
  priceHistory: Array<{
    timestamp: number
    price: number
    volume: number
    type: 'BUY' | 'SELL'
  }>
  ethPrice: number
}

interface MarketUpdate {
  timestamp: number
  type: 'market-update'
  data: {
    trendingCoins: any[]
    totalCoins: number
  }
}

interface UseWebSocketOptions {
  autoConnect?: boolean
  reconnectAttempts?: number
  reconnectDelay?: number
}

// Mock WebSocket implementation for development
class MockWebSocket {
  private url: string
  private listeners: Map<string, ((...args: any[]) => void)[]> = new Map()
  private isConnected = false
  private reconnectCount = 0
  private maxReconnects = 5
  private reconnectDelay = 1000

  constructor(url: string) {
    this.url = url
    this.connect()
  }

  private connect() {
    // Simulate connection delay
    setTimeout(() => {
      this.isConnected = true
      this.emit('connect')
      console.log('🔌 Mock WebSocket connected')
    }, 1000)
  }

  on(event: string, callback: (...args: any[]) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(callback)
  }

  off(event: string, callback: (...args: any[]) => void) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      const index = listeners.indexOf(callback)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }

  emit(event: string, ...args: any[]) {
    const listeners = this.listeners.get(event)
    if (listeners) {
      listeners.forEach(callback => callback(...args))
    }
  }

  send(data: any) {
    console.log('📤 Mock WebSocket send:', data)
    // Simulate server response
    setTimeout(() => {
      if (data === 'subscribe-coin') {
        this.emit('coin-update', {
          coinAddress: 'mock-address',
          timestamp: Date.now(),
          coin: {
            currentPrice: Math.random() * 0.001 + 0.0001,
            priceChange24h: (Math.random() - 0.5) * 20,
            volume24h: Math.random() * 1000000,
            marketCap: Math.random() * 10000000,
            holders: Math.floor(Math.random() * 1000) + 100
          },
          recentSwaps: [],
          latestPrice: Math.random() * 0.001 + 0.0001,
          priceHistory: [],
          ethPrice: 3500
        })
      }
    }, 500)
  }

  close() {
    this.isConnected = false
    this.emit('disconnect')
    console.log('🔌 Mock WebSocket disconnected')
  }

  get connected() {
    return this.isConnected
  }
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    autoConnect = true,
    reconnectAttempts = 5,
    reconnectDelay = 1000
  } = options

  const [socket, setSocket] = useState<MockWebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (autoConnect) {
      const newSocket = new MockWebSocket('ws://localhost:3000')
      
      newSocket.on('connect', () => {
        setIsConnected(true)
        setError(null)
      })

      newSocket.on('disconnect', () => {
        setIsConnected(false)
      })

      newSocket.on('connect_error', (err: any) => {
        setError(err.message)
      })

      setSocket(newSocket)

      return () => {
        newSocket.close()
      }
    }
  }, [autoConnect, reconnectAttempts, reconnectDelay])

  return { socket, isConnected, error }
}

export function useCoinUpdates(coinAddress: string | null) {
  const { socket, isConnected } = useWebSocket()
  const [coinData, setCoinData] = useState<CoinUpdate | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!socket || !coinAddress || !isConnected) return

    console.log(`📊 Subscribing to updates for ${coinAddress}`)
    setIsLoading(true)

    // Subscribe to coin updates
    socket.emit('subscribe-coin', coinAddress)

    // Listen for coin updates
    const handleCoinUpdate = (data: CoinUpdate) => {
      if (data.coinAddress === coinAddress) {
        console.log(`📈 Received update for ${coinAddress}:`, data.latestPrice)
        setCoinData(data)
        setIsLoading(false)
      }
    }

    socket.on('coin-update', handleCoinUpdate)

    return () => {
      console.log(`📊 Unsubscribing from ${coinAddress}`)
      socket.emit('unsubscribe-coin', coinAddress)
      socket.off('coin-update', handleCoinUpdate)
    }
  }, [socket, coinAddress, isConnected])

  return { coinData, isLoading }
}

export function useMarketUpdates() {
  const { socket, isConnected } = useWebSocket()
  const [marketData, setMarketData] = useState<MarketUpdate | null>(null)

  useEffect(() => {
    if (!socket || !isConnected) return

    const handleMarketUpdate = (data: MarketUpdate) => {
      console.log('📈 Received market update:', data)
      setMarketData(data)
    }

    socket.on('market-update', handleMarketUpdate)

    return () => {
      socket.off('market-update', handleMarketUpdate)
    }
  }, [socket, isConnected])

  return { marketData }
}

export function useRealtimePrice(coinAddress: string | null) {
  const { coinData } = useCoinUpdates(coinAddress)
  
  return {
    currentPrice: coinData?.latestPrice || 0,
    priceChange24h: coinData?.coin.priceChange24h || 0,
    volume24h: coinData?.coin.volume24h || 0,
    marketCap: coinData?.coin.marketCap || 0,
    holders: coinData?.coin.holders || 0,
    ethPrice: coinData?.ethPrice || 3500,
    lastUpdate: coinData?.timestamp || 0,
    isLive: !!coinData
  }
}

export function useRealtimeChart(coinAddress: string | null) {
  const { coinData } = useCoinUpdates(coinAddress)
  
  return {
    priceHistory: coinData?.priceHistory || [],
    recentSwaps: coinData?.recentSwaps || [],
    lastUpdate: coinData?.timestamp || 0,
    isLive: !!coinData
  }
}

export function useRealtimeActivity(coinAddress: string | null) {
  const { coinData } = useCoinUpdates(coinAddress)
  
  return {
    recentSwaps: coinData?.recentSwaps || [],
    lastUpdate: coinData?.timestamp || 0,
    isLive: !!coinData
  }
}
