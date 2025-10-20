// Simple database utilities for ownership claims
// This is a minimal implementation that can be easily migrated to a real database

import { OwnershipClaim, UserProfile } from '@/types'
import { claimsStorage, userProfileStorage } from './localStorage'

// Database interface that can be implemented with different backends
export interface Database {
  // User operations
  createUser(profile: UserProfile): Promise<UserProfile>
  getUser(walletAddress: string): Promise<UserProfile | null>
  updateUser(walletAddress: string, updates: Partial<UserProfile>): Promise<UserProfile | null>
  
  // Ownership claim operations
  createClaim(claim: OwnershipClaim): Promise<OwnershipClaim>
  getClaim(coinId: string, userAddress: string): Promise<OwnershipClaim | null>
  getClaimsByCoin(coinId: string): Promise<OwnershipClaim[]>
  getClaimsByUser(userAddress: string): Promise<OwnershipClaim[]>
  updateClaim(coinId: string, userAddress: string, updates: Partial<OwnershipClaim>): Promise<OwnershipClaim | null>
  deleteClaim(coinId: string, userAddress: string): Promise<boolean>
}

// Local storage implementation (for development/MVP)
class LocalStorageDatabase implements Database {
  async createUser(profile: UserProfile): Promise<UserProfile> {
    userProfileStorage.save(profile)
    return profile
  }

  async getUser(walletAddress: string): Promise<UserProfile | null> {
    const profile = userProfileStorage.get()
    return profile?.walletAddress === walletAddress ? profile : null
  }

  async updateUser(walletAddress: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
    const existing = await this.getUser(walletAddress)
    if (!existing) return null
    
    const updated = { ...existing, ...updates, updatedAt: new Date() }
    userProfileStorage.save(updated)
    return updated
  }

  async createClaim(claim: OwnershipClaim): Promise<OwnershipClaim> {
    claimsStorage.add(claim)
    return claim
  }

  async getClaim(coinId: string, userAddress: string): Promise<OwnershipClaim | null> {
    const claims = claimsStorage.get()
    return claims.find(c => c.coinId === coinId && c.userAddress === userAddress) || null
  }

  async getClaimsByCoin(coinId: string): Promise<OwnershipClaim[]> {
    const claims = claimsStorage.get()
    return claims.filter(c => c.coinId === coinId)
  }

  async getClaimsByUser(userAddress: string): Promise<OwnershipClaim[]> {
    const claims = claimsStorage.get()
    return claims.filter(c => c.userAddress === userAddress)
  }

  async updateClaim(coinId: string, userAddress: string, updates: Partial<OwnershipClaim>): Promise<OwnershipClaim | null> {
    const existing = await this.getClaim(coinId, userAddress)
    if (!existing) return null
    
    const updated = { ...existing, ...updates }
    claimsStorage.add(updated)
    return updated
  }

  async deleteClaim(coinId: string, userAddress: string): Promise<boolean> {
    const existing = await this.getClaim(coinId, userAddress)
    if (!existing) return false
    
    claimsStorage.remove(coinId)
    return true
  }
}

// Database instance (can be swapped for different implementations)
export const db: Database = new LocalStorageDatabase()

// Helper functions for common operations
export const dbHelpers = {
  // Create or update user profile
  upsertUser: async (walletAddress: string, updates: Partial<UserProfile> = {}): Promise<UserProfile> => {
    let user = await db.getUser(walletAddress)
    
    if (!user) {
      user = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        walletAddress,
        claimedCoins: [],
        verificationStatus: 'unverified',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...updates
      }
      return await db.createUser(user)
    } else {
      return await db.updateUser(walletAddress, updates) || user
    }
  },

  // Verify ownership claim
  verifyClaim: async (coinId: string, userAddress: string, signature: string): Promise<OwnershipClaim> => {
    const existingClaim = await db.getClaim(coinId, userAddress)
    
    const claim: OwnershipClaim = {
      coinId,
      userAddress,
      signature,
      verified: true, // In a real implementation, this would be verified against blockchain
      claimedAt: new Date()
    }

    if (existingClaim) {
      return await db.updateClaim(coinId, userAddress, claim) || claim
    } else {
      return await db.createClaim(claim)
    }
  },

  // Check if user has claimed a coin
  hasUserClaimedCoin: async (coinId: string, userAddress: string): Promise<boolean> => {
    const claim = await db.getClaim(coinId, userAddress)
    return claim?.verified || false
  },

  // Get all verified claims for a coin
  getVerifiedClaimsForCoin: async (coinId: string): Promise<OwnershipClaim[]> => {
    const claims = await db.getClaimsByCoin(coinId)
    return claims.filter(c => c.verified)
  }
}

// Migration utilities (for future database upgrades)
export const migrations = {
  // Export data for migration to a real database
  exportData: async () => {
    const users = userProfileStorage.get()
    const claims = claimsStorage.get()
    
    return {
      users: users ? [users] : [],
      claims,
      exportedAt: new Date().toISOString()
    }
  },

  // Import data from exported format
  importData: async (data: { users: UserProfile[], claims: OwnershipClaim[] }) => {
    if (data.users.length > 0) {
      userProfileStorage.save(data.users[0]) // Single user for localStorage
    }
    
    if (data.claims.length > 0) {
      claimsStorage.save(data.claims)
    }
  }
}