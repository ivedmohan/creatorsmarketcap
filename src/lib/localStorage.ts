// Local storage utilities for caching user data and preferences

import { UserProfile, OwnershipClaim, BuilderScore } from '@/types'

const STORAGE_KEYS = {
  USER_PROFILE: 'cmc_user_profile',
  CLAIMED_COINS: 'cmc_claimed_coins',
  TALENT_SCORES: 'cmc_talent_scores',
  USER_PREFERENCES: 'cmc_user_preferences',
} as const

// Generic localStorage wrapper with error handling
class LocalStorageManager {
  private isClient = typeof window !== 'undefined'

  setItem<T>(key: string, value: T): void {
    if (!this.isClient) return
    
    try {
      const serializedValue = JSON.stringify(value)
      localStorage.setItem(key, serializedValue)
    } catch (error) {
      console.error(`Error saving to localStorage:`, error)
    }
  }

  getItem<T>(key: string): T | null {
    if (!this.isClient) return null
    
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : null
    } catch (error) {
      console.error(`Error reading from localStorage:`, error)
      return null
    }
  }

  removeItem(key: string): void {
    if (!this.isClient) return
    
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing from localStorage:`, error)
    }
  }

  clear(): void {
    if (!this.isClient) return
    
    try {
      // Only clear our app's keys
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key)
      })
    } catch (error) {
      console.error(`Error clearing localStorage:`, error)
    }
  }
}

const storage = new LocalStorageManager()

// User Profile Management
export const userProfileStorage = {
  save: (profile: UserProfile) => {
    storage.setItem(STORAGE_KEYS.USER_PROFILE, profile)
  },

  get: (): UserProfile | null => {
    return storage.getItem<UserProfile>(STORAGE_KEYS.USER_PROFILE)
  },

  update: (updates: Partial<UserProfile>) => {
    const existing = userProfileStorage.get()
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date() }
      userProfileStorage.save(updated)
      return updated
    }
    return null
  },

  remove: () => {
    storage.removeItem(STORAGE_KEYS.USER_PROFILE)
  }
}

// Ownership Claims Management
export const claimsStorage = {
  save: (claims: OwnershipClaim[]) => {
    storage.setItem(STORAGE_KEYS.CLAIMED_COINS, claims)
  },

  get: (): OwnershipClaim[] => {
    return storage.getItem<OwnershipClaim[]>(STORAGE_KEYS.CLAIMED_COINS) || []
  },

  add: (claim: OwnershipClaim) => {
    const existing = claimsStorage.get()
    const updated = [...existing.filter(c => c.coinId !== claim.coinId), claim]
    claimsStorage.save(updated)
    return updated
  },

  remove: (coinId: string) => {
    const existing = claimsStorage.get()
    const updated = existing.filter(c => c.coinId !== coinId)
    claimsStorage.save(updated)
    return updated
  },

  getClaim: (coinId: string): OwnershipClaim | null => {
    const claims = claimsStorage.get()
    return claims.find(c => c.coinId === coinId) || null
  }
}

// Talent Scores Cache
export const talentScoresStorage = {
  save: (scores: Record<string, { score: BuilderScore; timestamp: number }>) => {
    storage.setItem(STORAGE_KEYS.TALENT_SCORES, scores)
  },

  get: (): Record<string, { score: BuilderScore; timestamp: number }> => {
    return storage.getItem<Record<string, { score: BuilderScore; timestamp: number }>>(STORAGE_KEYS.TALENT_SCORES) || {}
  },

  setScore: (address: string, score: BuilderScore) => {
    const existing = talentScoresStorage.get()
    existing[address] = {
      score,
      timestamp: Date.now()
    }
    talentScoresStorage.save(existing)
  },

  getScore: (address: string): BuilderScore | null => {
    const scores = talentScoresStorage.get()
    const cached = scores[address]
    
    // Return cached score if it's less than 1 hour old
    if (cached && (Date.now() - cached.timestamp) < 3600000) {
      return cached.score
    }
    
    return null
  },

  removeScore: (address: string) => {
    const existing = talentScoresStorage.get()
    delete existing[address]
    talentScoresStorage.save(existing)
  }
}

// User Preferences
interface UserPreferences {
  theme: 'light' | 'dark'
  currency: 'ETH' | 'USD'
  sortBy: 'marketCap' | 'price' | 'volume' | 'trustScore'
  sortOrder: 'asc' | 'desc'
  itemsPerPage: number
}

const defaultPreferences: UserPreferences = {
  theme: 'light',
  currency: 'ETH',
  sortBy: 'marketCap',
  sortOrder: 'desc',
  itemsPerPage: 20
}

export const preferencesStorage = {
  save: (preferences: UserPreferences) => {
    storage.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences)
  },

  get: (): UserPreferences => {
    return storage.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES) || defaultPreferences
  },

  update: (updates: Partial<UserPreferences>) => {
    const existing = preferencesStorage.get()
    const updated = { ...existing, ...updates }
    preferencesStorage.save(updated)
    return updated
  }
}

// Utility to clear all app data
export const clearAllData = () => {
  storage.clear()
}