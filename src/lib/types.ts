export interface Coin {
  id: string
  name: string
  symbol: string
  currentPrice: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  holders: number
  trustScore?: number
  creatorAddress: string
  metadata: {
    description: string
    image: string
  }
}

export interface Profile {
  address: string
  zoraProfile: {
    handle: string
    displayName: string
    bio: string
    avatar: string
  }
  claimedCoins: Array<{ coinId: string; verified: boolean }>
  createdCoins: Array<Coin>
}

export interface Transaction {
  type: "buy" | "sell"
  address: string
  amount: number
  price: number
  timestamp: string
}
