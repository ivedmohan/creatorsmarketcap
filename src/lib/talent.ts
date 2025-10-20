// Talent Protocol API integration for trust scoring

import { BuilderScore, Credential, ProfileVerification } from '@/types'
import { transformTalentScore } from './dataTransforms'

// Talent Protocol API configuration
const TALENT_API_BASE_URL = 'https://api.talentprotocol.com'

// Talent Protocol API client
export class TalentClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl: string = TALENT_API_BASE_URL) {
    this.apiKey = apiKey || process.env.TALENT_API_KEY || ''
    this.baseUrl = baseUrl
  }

  // Make authenticated API request
  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`
    
    const headers = {
      'Content-Type': 'application/json',
      ...(this.apiKey && { 'X-API-KEY': this.apiKey }),
      ...options.headers
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Talent API error (${response.status}): ${errorText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`Talent API request failed for ${endpoint}:`, error)
      throw error
    }
  }

  // Get builder score by wallet address
  async getBuilderScore(address: string): Promise<BuilderScore | null> {
    try {
      // Validate address format
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error('Invalid wallet address format')
      }

      // First get profile by account identifier
      const profileResponse = await this.makeRequest<any>(`/profile?account_identifier=${address}`)
      
      if (!profileResponse || !profileResponse.profile) {
        return null
      }

      const profileId = profileResponse.profile.id

      // Then get the score data
      const scoreResponse = await this.makeRequest<any>(`/score?profile_id=${profileId}`)
      
      if (scoreResponse && scoreResponse.score) {
        return transformTalentScore(scoreResponse.score)
      }

      return null
    } catch (error) {
      console.error(`Error fetching builder score for ${address}:`, error)
      // Return null instead of throwing to allow graceful degradation
      return null
    }
  }

  // Get detailed credentials for a wallet address
  async getCredentials(address: string): Promise<Credential[]> {
    try {
      if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
        throw new Error('Invalid wallet address format')
      }

      // First get profile by account identifier
      const profileResponse = await this.makeRequest<any>(`/profile?account_identifier=${address}`)
      
      if (!profileResponse || !profileResponse.profile) {
        return []
      }

      const profileId = profileResponse.profile.id

      // Then get credentials data
      const credentialsResponse = await this.makeRequest<any>(`/credentials?profile_id=${profileId}`)
      
      if (credentialsResponse && credentialsResponse.credentials) {
        return credentialsResponse.credentials.map((cred: any) => ({
          id: cred.id,
          type: cred.type,
          verified: Boolean(cred.verified),
          data: cred.data || {}
        }))
      }

      return []
    } catch (error) {
      console.error(`Error fetching credentials for ${address}:`, error)
      return []
    }
  }

  // Verify profile and get comprehensive data
  async verifyProfile(address: string): Promise<ProfileVerification> {
    try {
      const [score, credentials] = await Promise.all([
        this.getBuilderScore(address),
        this.getCredentials(address)
      ])

      return {
        verified: score !== null && score.verified,
        credentials,
        lastUpdated: new Date()
      }
    } catch (error) {
      console.error(`Error verifying profile for ${address}:`, error)
      return {
        verified: false,
        credentials: [],
        lastUpdated: new Date()
      }
    }
  }

  // Get multiple builder scores (batch request)
  async getMultipleBuilderScores(addresses: string[]): Promise<Record<string, BuilderScore | null>> {
    const results: Record<string, BuilderScore | null> = {}
    
    // Process in batches to avoid rate limiting
    const batchSize = 5
    for (let i = 0; i < addresses.length; i += batchSize) {
      const batch = addresses.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (address) => {
        const score = await this.getBuilderScore(address)
        return { address, score }
      })

      const batchResults = await Promise.all(batchPromises)
      
      batchResults.forEach(({ address, score }) => {
        results[address] = score
      })

      // Add delay between batches to respect rate limits
      if (i + batchSize < addresses.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }

    return results
  }

  // Search for profiles by handle or other criteria
  async searchProfiles(query: string, limit: number = 10): Promise<any[]> {
    try {
      const response = await this.makeRequest<any>(`/search/advanced/profiles?q=${encodeURIComponent(query)}&limit=${limit}`)
      
      return response.profiles || []
    } catch (error) {
      console.error(`Error searching profiles for "${query}":`, error)
      return []
    }
  }

  // Get leaderboard data
  async getLeaderboard(limit: number = 50): Promise<BuilderScore[]> {
    try {
      const response = await this.makeRequest<any>(`/search/advanced/profiles?sort_by=builder_score&sort_order=desc&limit=${limit}`)
      
      if (response && response.profiles) {
        return response.profiles.map((profile: any) => transformTalentScore(profile.score))
      }

      return []
    } catch (error) {
      console.error('Error fetching leaderboard:', error)
      return []
    }
  }

  // Check API health and authentication
  async checkHealth(): Promise<{ healthy: boolean, authenticated: boolean }> {
    try {
      // Try a simple request to check if API is working
      await this.makeRequest<any>('/search/advanced/profiles?limit=1')
      
      return {
        healthy: true,
        authenticated: Boolean(this.apiKey)
      }
    } catch (error) {
      return {
        healthy: false,
        authenticated: Boolean(this.apiKey)
      }
    }
  }
}

// Default client instance
export const talentClient = new TalentClient()

// Utility functions for common operations
export const talentUtils = {
  // Calculate trust score based on Talent data
  calculateTrustScore: (builderScore: BuilderScore): number => {
    if (!builderScore.verified) return 0
    
    // Weighted calculation based on different components
    const weights = {
      score: 0.4,           // 40% - Overall Talent score
      onChain: 0.3,         // 30% - On-chain activity
      github: 0.2,          // 20% - GitHub activity  
      social: 0.1           // 10% - Social credibility
    }

    const normalizedScore = Math.min(builderScore.score / 100, 1) // Normalize to 0-1
    const normalizedOnChain = Math.min(builderScore.components.onChainActivity / 100, 1)
    const normalizedGithub = Math.min(builderScore.components.githubActivity / 100, 1)
    const normalizedSocial = Math.min(builderScore.components.socialCredibility / 100, 1)

    const trustScore = (
      normalizedScore * weights.score +
      normalizedOnChain * weights.onChain +
      normalizedGithub * weights.github +
      normalizedSocial * weights.social
    ) * 100

    return Math.round(Math.min(trustScore, 100))
  },

  // Get trust level based on score
  getTrustLevel: (score: number): 'low' | 'medium' | 'high' | 'excellent' => {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'high'
    if (score >= 40) return 'medium'
    return 'low'
  },

  // Format score for display
  formatScore: (score?: number): string => {
    if (score === undefined || score === null) return 'Unscored'
    return `${score}/100`
  },

  // Get score color for UI
  getScoreColor: (score?: number): string => {
    if (score === undefined || score === null) return 'gray'
    if (score >= 80) return 'green'
    if (score >= 60) return 'blue'
    if (score >= 40) return 'yellow'
    return 'red'
  },

  // Check if profile meets minimum trust threshold
  meetsMinimumTrust: (builderScore: BuilderScore | null, threshold: number = 40): boolean => {
    if (!builderScore || !builderScore.verified) return false
    const trustScore = talentUtils.calculateTrustScore(builderScore)
    return trustScore >= threshold
  }
}

// Error types for better error handling
export class TalentAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message)
    this.name = 'TalentAPIError'
  }
}

// Rate limiting helper
export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private timeWindow: number

  constructor(maxRequests: number = 100, timeWindowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.timeWindow = timeWindowMs
  }

  async checkLimit(): Promise<boolean> {
    const now = Date.now()
    
    // Remove old requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow)
    
    if (this.requests.length >= this.maxRequests) {
      return false
    }

    this.requests.push(now)
    return true
  }

  async waitForSlot(): Promise<void> {
    while (!(await this.checkLimit())) {
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }
}