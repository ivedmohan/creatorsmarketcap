import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as SocketIOServer } from 'socket.io'

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer
    }
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('🔌 Socket.IO server already running')
    res.end()
    return
  }

  console.log('🔌 Starting Socket.IO server...')
  
  const io = new SocketIOServer(res.socket.server, {
    path: '/api/socketio',
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.NEXTAUTH_URL 
        : 'http://localhost:3000',
      methods: ['GET', 'POST']
    }
  })

  res.socket.server.io = io

  io.on('connection', (socket) => {
    console.log('🔌 Client connected:', socket.id)

    // Handle coin subscriptions
    socket.on('subscribe-coin', (coinAddress: string) => {
      console.log(`📊 Client ${socket.id} subscribed to coin: ${coinAddress}`)
      socket.join(`coin-${coinAddress}`)
      
      // Send initial data
      socket.emit('coin-update', {
        type: 'initial',
        coinAddress,
        timestamp: Date.now()
      })
    })

    // Handle coin unsubscriptions
    socket.on('unsubscribe-coin', (coinAddress: string) => {
      console.log(`📊 Client ${socket.id} unsubscribed from coin: ${coinAddress}`)
      socket.leave(`coin-${coinAddress}`)
    })

    // Handle disconnect
    socket.on('disconnect', () => {
      console.log('🔌 Client disconnected:', socket.id)
    })
  })

  // Simulate real-time updates (in production, this would connect to real data sources)
  setInterval(async () => {
    if (io.sockets.adapter.rooms.size > 0) {
      // Get all coin rooms
      const rooms = Array.from(io.sockets.adapter.rooms.keys())
        .filter(room => room.startsWith('coin-'))
        .map(room => room.replace('coin-', ''))

      for (const coinAddress of rooms) {
        try {
          // Fetch latest data from DexScreener
          const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${coinAddress}`)
          if (response.ok) {
            const data = await response.json()
            if (data.pairs && data.pairs.length > 0) {
              const bestPair = data.pairs.reduce((best: any, current: any) => {
                const bestLiquidity = parseFloat(best.liquidity?.usd || '0')
                const currentLiquidity = parseFloat(current.liquidity?.usd || '0')
                return currentLiquidity > bestLiquidity ? current : best
              })

              // Broadcast price update
              io.to(`coin-${coinAddress}`).emit('coin-update', {
                type: 'price-update',
                coinAddress,
                price: parseFloat(bestPair.priceUsd || '0'),
                priceChange24h: parseFloat(bestPair.priceChange?.h24 || '0'),
                volume24h: parseFloat(bestPair.volume?.h24 || '0'),
                timestamp: Date.now()
              })

              // Simulate new trade activity
              if (Math.random() > 0.7) { // 30% chance of new trade
                const isBuy = Math.random() > 0.4
                const baseAmount = parseFloat(bestPair.volume?.h24 || '0') / 24 / 10
                const coinAmount = baseAmount * (0.5 + Math.random())

                io.to(`coin-${coinAddress}`).emit('coin-update', {
                  type: 'new-trade',
                  coinAddress,
                  trade: {
                    activityType: isBuy ? 'BUY' : 'SELL',
                    coinAmount: coinAmount.toString(),
                    senderAddress: `0x${Math.random().toString(16).substr(2, 8)}`,
                    blockTimestamp: Date.now(),
                    transactionHash: `0x${Math.random().toString(16).substr(2, 64)}`
                  },
                  timestamp: Date.now()
                })
              }
            }
          }
        } catch (error) {
          console.error(`Failed to fetch data for ${coinAddress}:`, error)
        }
      }
    }
  }, 10000) // Update every 10 seconds

  res.end()
}

export default SocketHandler
