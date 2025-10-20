// API utility functions for integrating with backend
// Replace mock data with actual API calls

import type { Coin, Profile, Transaction, Holder, ApiResponse, PaginationParams } from "@/types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api"

// Coins API
export async function fetchCoins(params: {
  sortBy?: "mostValuable" | "topGainers" | "topVolume" | "newCoins" | "recentlyTraded"
  limit?: number
  page?: number
  search?: string
}): Promise<ApiResponse<{ coins: Coin[]; pagination: PaginationParams }>> {
  try {
    const queryParams = new URLSearchParams({
      sortBy: params.sortBy || "mostValuable",
      limit: String(params.limit || 20),
      page: String(params.page || 1),
      ...(params.search && { search: params.search }),
    })

    const response = await fetch(`${API_BASE_URL}/coins?${queryParams}`)
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to fetch coins:", error)
    return {
      data: { coins: [], pagination: { page: 1, limit: 20, total: 0 } },
      error: "Failed to fetch coins",
      success: false,
    }
  }
}

export async function fetchTrendingCoins(count = 10): Promise<ApiResponse<Coin[]>> {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/trending?count=${count}`)
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to fetch trending coins:", error)
    return {
      data: [],
      error: "Failed to fetch trending coins",
      success: false,
    }
  }
}

export async function fetchCoinDetails(address: string): Promise<
  ApiResponse<
    Coin & {
      transactions: Transaction[]
      holders: Holder[]
    }
  >
> {
  try {
    const response = await fetch(`${API_BASE_URL}/coins/${address}?includeDetails=true`)
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to fetch coin details:", error)
    return {
      data: null as any,
      error: "Failed to fetch coin details",
      success: false,
    }
  }
}

// Profile API
export async function fetchProfile(address: string): Promise<ApiResponse<Profile>> {
  try {
    const response = await fetch(`${API_BASE_URL}/profile/${address}?includeCoins=true`)
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to fetch profile:", error)
    return {
      data: null as any,
      error: "Failed to fetch profile",
      success: false,
    }
  }
}

// Ownership & Trust API
export async function verifyOwnership(
  coinAddress: string,
  userAddress: string,
): Promise<ApiResponse<{ verified: boolean }>> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/verify-ownership?coinAddress=${coinAddress}&userAddress=${userAddress}`,
    )
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to verify ownership:", error)
    return {
      data: { verified: false },
      error: "Failed to verify ownership",
      success: false,
    }
  }
}

export async function claimOwnership(
  coinAddress: string,
  userAddress: string,
): Promise<ApiResponse<{ success: boolean }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-ownership`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ coinAddress, userAddress }),
    })
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to claim ownership:", error)
    return {
      data: { success: false },
      error: "Failed to claim ownership",
      success: false,
    }
  }
}

export async function fetchTalentScore(address: string): Promise<ApiResponse<{ score: number }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/talent/score?address=${address}`)
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to fetch talent score:", error)
    return {
      data: { score: 0 },
      error: "Failed to fetch talent score",
      success: false,
    }
  }
}

export async function connectTalentProtocol(address: string): Promise<ApiResponse<{ connected: boolean }>> {
  try {
    const response = await fetch(`${API_BASE_URL}/talent/connect`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ address }),
    })
    const data = await response.json()

    return {
      data,
      success: true,
    }
  } catch (error) {
    console.error("Failed to connect Talent Protocol:", error)
    return {
      data: { connected: false },
      error: "Failed to connect Talent Protocol",
      success: false,
    }
  }
}
