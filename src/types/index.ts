// Core data models for the Creator Coins Dashboard

export interface CreatorCoin {
  id: string
  name: string
  symbol: string
  creatorAddress: string
  contractAddress: string
  chainId: number
  currentPrice: number
  marketCap: number
  volume24h: number
  priceChange24h: number
  holders: number
  trustScore?: number
  isVerified: boolean
  isClaimed: boolean
  metadata: {
    description?: string
    image?: string
    externalUrl?: string
  }
  priceHistory: PricePoint[]
}

export interface PricePoint {
  timestamp: number
  price: number
  volume: number
}

export interface UserProfile {
  id: string
  walletAddress: string
  claimedCoins: string[]
  talentScore?: BuilderScore
  verificationStatus: 'unverified' | 'pending' | 'verified'
  createdAt: Date
  updatedAt: Date
}

export interface BuilderScore {
  score: number
  rank: number
  verified: boolean
  components: {
    onChainActivity: number
    githubActivity: number
    socialCredibility: number
  }
}

export interface Credential {
  id: string
  type: string
  verified: boolean
  data: Record<string, any>
}

export interface ProfileVerification {
  verified: boolean
  credentials: Credential[]
  lastUpdated: Date
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface CoinListResponse {
  coins: CreatorCoin[]
  total: number
  page: number
  limit: number
  hasNextPage?: boolean
  endCursor?: string
}

// Wallet and Web3 types
export interface WalletConnection {
  address: string
  isConnected: boolean
  chainId: number
}

export interface OwnershipClaim {
  coinId: string
  userAddress: string
  signature: string
  verified: boolean
  claimedAt: Date
}

// Type aliases for backward compatibility
export type Coin = CreatorCoin
export type Profile = UserProfile

// Additional types for API
export interface Transaction {
  id: string
  type: 'buy' | 'sell' | 'transfer'
  from: string
  to: string
  amount: number
  price: number
  timestamp: number
  txHash: string
}

export interface Holder {
  address: string
  balance: number
  value: number
  percentage: number
}

export interface PaginationParams {
  page: number
  limit: number
  total: number
  hasNextPage?: boolean
  endCursor?: string
}