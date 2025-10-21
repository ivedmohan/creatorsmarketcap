"use client"

import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// Global Socket.IO client instance
let socket: Socket | null = null

const getSocket = () => {
  if (!socket) {
    socket = io(process.env.NODE_ENV === 'production' 
      ? process.env.NEXTAUTH_URL || 'https://creatorsmarketcap.vercel.app'
      : 'http://localhost:3000', {
      path: '/api/socketio',
      transports: ['websocket', 'polling']
    })

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected:', socket?.id)
    })

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected')
    })

    socket.on('connect_error', (error) => {
      console.error('🔌 WebSocket connection error:', error)
    })
  }
  return socket
}

interface CoinUpdate {
  type: 'initial' | 'price-update' | 'new-trade'
  coinAddress: string
  timestamp: number
  price?: number
  priceChange24h?: number
  volume24h?: number
  trade?: {
    activityType: 'BUY' | 'SELL'
    coinAmount: string
    senderAddress: string
    blockTimestamp: number
    transactionHash: string
  }
}

interface MarketUpdate {
  timestamp: number
  type: 'market-update'
  data: {
    trendingCoins: any[]
    marketStats: {
      totalMarketCap: number
      totalVolume: number
      totalCoins: number
    }
  }
}

interface ActivityUpdate {
  type: 'new-activity'
  coinAddress: string
  activity: {
    activityType: 'BUY' | 'SELL'
    coinAmount: string
    senderAddress: string
    blockTimestamp: number
    transactionHash: string
  }
  timestamp: number
}

interface ChartUpdate {
  type: 'chart-update'
  coinAddress: string
  pricePoint: {
    timestamp: number
    price: number
    volume: number
    type: 'BUY' | 'SELL'
  }
  timestamp: number
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting')

  useEffect(() => {
    const ws = getSocket()

    const handleConnect = () => {
      setIsConnected(true)
      setConnectionStatus('connected')
    }

    const handleDisconnect = () => {
      setIsConnected(false)
      setConnectionStatus('disconnected')
    }

    const handleError = () => {
      setConnectionStatus('error')
    }

    ws.on('connect', handleConnect)
    ws.on('disconnect', handleDisconnect)
    ws.on('connect_error', handleError)

    return () => {
      ws.off('connect', handleConnect)
      ws.off('disconnect', handleDisconnect)
      ws.off('connect_error', handleError)
    }
  }, [])

  return {
    isConnected,
    connectionStatus,
    socket: getSocket()
  }
}

export function useCoinUpdates(coinAddress: string | null) {
  const [updates, setUpdates] = useState<CoinUpdate[]>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!coinAddress) return

    const ws = getSocket()
    setIsLive(true)

    const handleCoinUpdate = (update: CoinUpdate) => {
      console.log('📊 Received coin update:', update)
      setUpdates(prev => [...prev.slice(-9), update]) // Keep last 10 updates
    }

    // Subscribe to coin updates
    ws.emit('subscribe-coin', coinAddress)
    ws.on('coin-update', handleCoinUpdate)

    return () => {
      ws.emit('unsubscribe-coin', coinAddress)
      ws.off('coin-update', handleCoinUpdate)
      setIsLive(false)
    }
  }, [coinAddress])

  return { updates, isLive }
}

export function useRealtimePrice(coinAddress: string | null) {
  const [price, setPrice] = useState<number | null>(null)
  const [priceChange24h, setPriceChange24h] = useState<number | null>(null)
  const [volume24h, setVolume24h] = useState<number | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!coinAddress) return

    const ws = getSocket()
    setIsLive(true)

    const handleCoinUpdate = (update: CoinUpdate) => {
      if (update.type === 'price-update' && update.price !== undefined) {
        setPrice(update.price)
        setPriceChange24h(update.priceChange24h || 0)
        setVolume24h(update.volume24h || 0)
      }
    }

    ws.emit('subscribe-coin', coinAddress)
    ws.on('coin-update', handleCoinUpdate)

    return () => {
      ws.emit('unsubscribe-coin', coinAddress)
      ws.off('coin-update', handleCoinUpdate)
      setIsLive(false)
    }
  }, [coinAddress])

  return { price, priceChange24h, volume24h, isLive }
}

export function useRealtimeChart(coinAddress: string | null) {
  const [pricePoints, setPricePoints] = useState<Array<{
    timestamp: number
    price: number
    volume: number
    type: 'BUY' | 'SELL'
  }>>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!coinAddress) return

    const ws = getSocket()
    setIsLive(true)

    const handleCoinUpdate = (update: CoinUpdate) => {
      if (update.type === 'price-update' && update.price !== undefined) {
        const newPoint = {
          timestamp: update.timestamp,
          price: update.price,
          volume: update.volume24h || 0,
          type: 'BUY' as const
        }
        setPricePoints(prev => [...prev.slice(-99), newPoint]) // Keep last 100 points
      }
    }

    ws.emit('subscribe-coin', coinAddress)
    ws.on('coin-update', handleCoinUpdate)

    return () => {
      ws.emit('unsubscribe-coin', coinAddress)
      ws.off('coin-update', handleCoinUpdate)
      setIsLive(false)
    }
  }, [coinAddress])

  return { pricePoints, isLive }
}

export function useRealtimeActivity(coinAddress: string | null) {
  const [activities, setActivities] = useState<Array<{
    activityType: 'BUY' | 'SELL'
    coinAmount: string
    senderAddress: string
    blockTimestamp: number
    transactionHash: string
  }>>([])
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    if (!coinAddress) return

    const ws = getSocket()
    setIsLive(true)

    const handleCoinUpdate = (update: CoinUpdate) => {
      if (update.type === 'new-trade' && update.trade) {
        setActivities(prev => [update.trade!, ...prev.slice(0, 9)]) // Keep last 10 activities
      }
    }

    ws.emit('subscribe-coin', coinAddress)
    ws.on('coin-update', handleCoinUpdate)

    return () => {
      ws.emit('unsubscribe-coin', coinAddress)
      ws.off('coin-update', handleCoinUpdate)
      setIsLive(false)
    }
  }, [coinAddress])

  return { activities, isLive }
}

export function useMarketUpdates() {
  const [marketData, setMarketData] = useState<MarketUpdate | null>(null)
  const [isLive, setIsLive] = useState(false)

  useEffect(() => {
    const ws = getSocket()
    setIsLive(true)

    const handleMarketUpdate = (update: MarketUpdate) => {
      setMarketData(update)
    }

    ws.on('market-update', handleMarketUpdate)

    return () => {
      ws.off('market-update', handleMarketUpdate)
      setIsLive(false)
    }
  }, [])

  return { marketData, isLive }
}

// Cleanup function for when the app unmounts
export function cleanupWebSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}