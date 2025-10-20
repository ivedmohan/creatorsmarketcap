// Data transformation utilities for API responses

import { CreatorCoin, BuilderScore, PricePoint } from '@/types'

// Transform Zora API response to our CreatorCoin interface
export const transformZoraCoin = (zoraCoin: any): CreatorCoin => {
  // Calculate current price from market cap and total supply
  const marketCap = parseFloat(zoraCoin.marketCap || '0')
  const totalSupply = parseFloat(zoraCoin.totalSupply || '1')
  const currentPrice = totalSupply > 0 ? marketCap / totalSupply : 0

  // Calculate 24h price change percentage
  const marketCapDelta = parseFloat(zoraCoin.marketCapDelta24h || '0')
  const priceChange24h = marketCap > 0 ? (marketCapDelta / marketCap) * 100 : 0

  return {
    id: zoraCoin.id || zoraCoin.address,
    name: zoraCoin.name || 'Unknown Coin',
    symbol: zoraCoin.symbol || 'UNKNOWN',
    creatorAddress: zoraCoin.creatorAddress || zoraCoin.creator,
    contractAddress: zoraCoin.address,
    chainId: zoraCoin.chainId || 8453, // Base chain
    currentPrice,
    marketCap,
    volume24h: parseFloat(zoraCoin.volume24h || zoraCoin.totalVolume || '0'),
    priceChange24h,
    holders: parseInt(zoraCoin.uniqueHolders || zoraCoin.holders || '0'),
    trustScore: undefined, // Will be populated from Talent Protocol
    isVerified: false, // Will be updated based on claims
    isClaimed: false, // Will be updated based on local storage
    metadata: {
      description: zoraCoin.description,
      image: zoraCoin.mediaContent?.previewImage?.medium || zoraCoin.image,
      externalUrl: zoraCoin.tokenUri
    },
    priceHistory: [] // Will be populated separately if needed
  }
}

// Transform price history data
export const transformPriceHistory = (priceData: any[]): PricePoint[] => {
  if (!Array.isArray(priceData)) return []
  
  return priceData.map(point => ({
    timestamp: point.timestamp || point.time || Date.now(),
    price: parseFloat(point.price || point.value || '0'),
    volume: parseFloat(point.volume || '0')
  })).sort((a, b) => a.timestamp - b.timestamp)
}

// Transform Talent Protocol API response to our BuilderScore interface
export const transformTalentScore = (talentData: any): BuilderScore => {
  return {
    score: parseInt(talentData.score || talentData.builder_score || '0'),
    rank: parseInt(talentData.rank || talentData.global_rank || '0'),
    verified: Boolean(talentData.verified || talentData.is_verified),
    components: {
      onChainActivity: parseInt(talentData.on_chain_score || talentData.onchain_activity || '0'),
      githubActivity: parseInt(talentData.github_score || talentData.github_activity || '0'),
      socialCredibility: parseInt(talentData.social_score || talentData.social_credibility || '0')
    }
  }
}

// Format price for display
export const formatPrice = (price: number, currency: 'ETH' | 'USD' = 'ETH'): string => {
  if (price === 0) return '0'
  
  if (currency === 'ETH') {
    if (price < 0.001) {
      return `${(price * 1000000).toFixed(2)}μ`
    } else if (price < 1) {
      return `${price.toFixed(6)}`
    } else {
      return `${price.toFixed(4)}`
    }
  } else {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(price)
  }
}

// Format market cap for display
export const formatMarketCap = (marketCap: number): string => {
  if (marketCap === 0) return '0'
  
  if (marketCap >= 1000000) {
    return `${(marketCap / 1000000).toFixed(2)}M`
  } else if (marketCap >= 1000) {
    return `${(marketCap / 1000).toFixed(2)}K`
  } else {
    return marketCap.toFixed(2)
  }
}

// Format percentage change
export const formatPercentageChange = (change: number): string => {
  const sign = change >= 0 ? '+' : ''
  return `${sign}${change.toFixed(2)}%`
}

// Format trust score for display
export const formatTrustScore = (score?: number): string => {
  if (score === undefined || score === null) return 'Unscored'
  return `${score}/100`
}

// Get trust score color class for styling
export const getTrustScoreColor = (score?: number): string => {
  if (score === undefined || score === null) return 'text-gray-400'
  
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

// Validate wallet address format
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address)
}

// Truncate address for display
export const truncateAddress = (address: string, startLength = 6, endLength = 4): string => {
  if (!address || address.length <= startLength + endLength) return address
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`
}

// Sort coins by different criteria
export const sortCoins = (
  coins: CreatorCoin[], 
  sortBy: 'marketCap' | 'price' | 'volume' | 'trustScore', 
  order: 'asc' | 'desc' = 'desc'
): CreatorCoin[] => {
  return [...coins].sort((a, b) => {
    let aValue: number
    let bValue: number
    
    switch (sortBy) {
      case 'marketCap':
        aValue = a.marketCap
        bValue = b.marketCap
        break
      case 'price':
        aValue = a.currentPrice
        bValue = b.currentPrice
        break
      case 'volume':
        aValue = a.volume24h
        bValue = b.volume24h
        break
      case 'trustScore':
        aValue = a.trustScore || 0
        bValue = b.trustScore || 0
        break
      default:
        return 0
    }
    
    const result = aValue - bValue
    return order === 'desc' ? -result : result
  })
}

// Filter coins by search term
export const filterCoins = (coins: CreatorCoin[], searchTerm: string): CreatorCoin[] => {
  if (!searchTerm.trim()) return coins
  
  const term = searchTerm.toLowerCase()
  return coins.filter(coin => 
    coin.name.toLowerCase().includes(term) ||
    coin.symbol.toLowerCase().includes(term) ||
    coin.creatorAddress.toLowerCase().includes(term)
  )
}