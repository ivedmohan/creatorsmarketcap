// Zora SDK integration for Base chain creator coins

import {
    getCoin,
    getCoins,
    getCoinHolders,
    getCoinSwaps,
    getCoinComments,
    getProfile,
    getProfileCoins,
    getCoinsTopGainers,
    getCoinsTopVolume24h,
    getCoinsMostValuable,
    getCoinsNew,
    getCoinsLastTraded,
    getCreatorCoins,
    getMostValuableCreatorCoins,
    setApiKey
} from '@zoralabs/coins-sdk'

import { CreatorCoin } from '@/types'
import { transformZoraCoin } from './dataTransforms'

// Base chain configuration
const BASE_CHAIN_ID = 8453

// Initialize Zora API key if available
if (process.env.ZORA_API_KEY) {
    setApiKey(process.env.ZORA_API_KEY)
}

// Zora client configuration for Base chain
export class ZoraClient {
    private chainId: number

    constructor(chainId: number = BASE_CHAIN_ID) {
        this.chainId = chainId
    }

    // Get a specific coin by contract address
    async getCoin(address: string): Promise<CreatorCoin | null> {
        try {
            const response = await getCoin({
                address,
                chain: this.chainId
            })

            if (response.data?.zora20Token) {
                return transformZoraCoin(response.data.zora20Token)
            }

            return null
        } catch (error) {
            console.error('Error fetching coin:', error)
            throw new Error(`Failed to fetch coin ${address}: ${error}`)
        }
    }

    // Get multiple coins by their addresses
    async getMultipleCoins(addresses: string[]): Promise<CreatorCoin[]> {
        try {
            const coins = addresses.map(address => ({
                collectionAddress: address,
                chainId: this.chainId
            }))

            const response = await getCoins({ coins })

            if (response.data?.zora20Tokens) {
                return response.data.zora20Tokens
                    .filter(token => token !== null)
                    .map(token => transformZoraCoin(token))
            }

            return []
        } catch (error) {
            console.error('Error fetching multiple coins:', error)
            throw new Error(`Failed to fetch coins: ${error}`)
        }
    }

    // Get coin holders with pagination
    async getCoinHolders(address: string, count: number = 20, after?: string) {
        try {
            const response = await getCoinHolders({
                chainId: this.chainId,
                address,
                count,
                after
            })

            if (response.data?.zora20Token?.tokenBalances) {
                const holders = response.data.zora20Token.tokenBalances.edges.map(({ node }) => ({
                    address: node.ownerAddress,
                    balance: node.balance,
                    profile: node.ownerProfile ? {
                        id: node.ownerProfile.id,
                        handle: node.ownerProfile.handle,
                        avatar: node.ownerProfile.avatar?.previewImage?.medium
                    } : null
                }))

                return {
                    holders,
                    hasNextPage: response.data.zora20Token.tokenBalances.pageInfo?.hasNextPage || false,
                    endCursor: response.data.zora20Token.tokenBalances.pageInfo?.endCursor
                }
            }

            return { holders: [], hasNextPage: false, endCursor: null }
        } catch (error) {
            console.error('Error fetching coin holders:', error)
            throw new Error(`Failed to fetch holders for ${address}: ${error}`)
        }
    }

    // Get coin swap activities (trading history)
    async getCoinSwaps(address: string, first: number = 10, after?: string) {
        try {
            const response = await getCoinSwaps({
                address,
                chain: this.chainId,
                first,
                after
            })

            if (response.data?.zora20Token?.swapActivities) {
                const swaps = response.data.zora20Token.swapActivities.edges.map(({ node }) => ({
                    activityType: node.activityType, // "BUY" or "SELL"
                    coinAmount: node.coinAmount,
                    senderAddress: node.senderAddress,
                    blockTimestamp: node.blockTimestamp,
                    transactionHash: node.transactionHash
                }))

                return {
                    swaps,
                    hasNextPage: response.data.zora20Token.swapActivities.pageInfo?.hasNextPage || false,
                    endCursor: response.data.zora20Token.swapActivities.pageInfo?.endCursor
                }
            }

            return { swaps: [], hasNextPage: false, endCursor: null }
        } catch (error) {
            console.error('Error fetching coin swaps:', error)
            throw new Error(`Failed to fetch swaps for ${address}: ${error}`)
        }
    }

    // Get coin comments
    async getCoinComments(address: string, count: number = 10, after?: string) {
        try {
            const response = await getCoinComments({
                address,
                chain: this.chainId,
                count,
                after
            })

            if (response.data?.zora20Token?.zoraComments) {
                const comments = response.data.zora20Token.zoraComments.edges.map(({ node }) => ({
                    id: node.commentId,
                    content: node.comment,
                    author: {
                        address: node.userAddress,
                        handle: node.userProfile?.handle,
                        avatar: node.userProfile?.avatar?.previewImage?.medium
                    },
                    createdAt: new Date(node.timestamp * 1000).toISOString(),
                    likes: 0, // Not available in current structure
                    txHash: node.txHash
                }))

                return {
                    comments,
                    hasNextPage: response.data.zora20Token.zoraComments.pageInfo?.hasNextPage || false,
                    endCursor: response.data.zora20Token.zoraComments.pageInfo?.endCursor
                }
            }

            return { comments: [], hasNextPage: false, endCursor: null }
        } catch (error) {
            console.error('Error fetching coin comments:', error)
            throw new Error(`Failed to fetch comments for ${address}: ${error}`)
        }
    }

    // Get user profile by address or handle
    async getProfile(identifier: string) {
        try {
            const response = await getProfile({ identifier })

            if (response.data?.profile) {
                const profile = response.data.profile
                return {
                    id: profile.id,
                    handle: profile.handle,
                    displayName: profile.displayName,
                    bio: profile.bio,
                    website: profile.website,
                    avatar: profile.avatar?.medium,
                    walletAddress: profile.publicWallet?.walletAddress,
                    socialAccounts: profile.socialAccounts,
                    linkedWallets: profile.linkedWallets?.edges?.map(edge => ({
                        type: edge.node?.walletType,
                        address: edge.node?.walletAddress
                    })),
                    creatorCoin: profile.creatorCoin ? {
                        address: profile.creatorCoin.address,
                        marketCap: profile.creatorCoin.marketCap,
                        marketCapDelta24h: profile.creatorCoin.marketCapDelta24h
                    } : null
                }
            }

            return null
        } catch (error) {
            console.error('Error fetching profile:', error)
            throw new Error(`Failed to fetch profile ${identifier}: ${error}`)
        }
    }

    // Get coins created by a user
    async getProfileCoins(identifier: string, count: number = 20, after?: string) {
        try {
            const response = await getProfileCoins({
                identifier,
                count,
                after
            })

            if (response.data?.profile?.createdCoins) {
                const coins = response.data.profile.createdCoins.edges?.map(({ node }) =>
                    transformZoraCoin(node)
                ) || []

                return {
                    coins,
                    totalCount: response.data.profile.createdCoins.count || 0,
                    hasNextPage: response.data.profile.createdCoins.pageInfo?.hasNextPage || false,
                    endCursor: response.data.profile.createdCoins.pageInfo?.endCursor
                }
            }

            return { coins: [], totalCount: 0, hasNextPage: false, endCursor: null }
        } catch (error) {
            console.error('Error fetching profile coins:', error)
            throw new Error(`Failed to fetch coins for ${identifier}: ${error}`)
        }
    }

    // Verify ownership by checking if address matches coin creator
    async verifyOwnership(coinAddress: string, userAddress: string): Promise<boolean> {
        try {
            const coin = await this.getCoin(coinAddress)

            if (!coin) {
                throw new Error('Coin not found')
            }

            // Check if user address matches creator address
            return coin.creatorAddress.toLowerCase() === userAddress.toLowerCase()
        } catch (error) {
            console.error('Error verifying ownership:', error)
            return false
        }
    }

    // Explore queries for dashboard
    async getTopGainers(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getCoinsTopGainers({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching top gainers:', error)
            throw new Error(`Failed to fetch top gainers: ${error}`)
        }
    }

    async getTopVolume(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getCoinsTopVolume24h({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching top volume coins:', error)
            throw new Error(`Failed to fetch top volume coins: ${error}`)
        }
    }

    async getMostValuable(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getCoinsMostValuable({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching most valuable coins:', error)
            throw new Error(`Failed to fetch most valuable coins: ${error}`)
        }
    }

    async getNewCoins(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getCoinsNew({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching new coins:', error)
            throw new Error(`Failed to fetch new coins: ${error}`)
        }
    }

    async getRecentlyTraded(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getCoinsLastTraded({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching recently traded coins:', error)
            throw new Error(`Failed to fetch recently traded coins: ${error}`)
        }
    }

    async getCreatorCoins(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getCreatorCoins({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching creator coins:', error)
            throw new Error(`Failed to fetch creator coins: ${error}`)
        }
    }

    async getMostValuableCreatorCoins(count: number = 20, after?: string): Promise<{ coins: CreatorCoin[], hasNextPage: boolean, endCursor?: string }> {
        try {
            const response = await getMostValuableCreatorCoins({ count, after })

            const coins = response.data?.exploreList?.edges?.map(({ node }) =>
                transformZoraCoin(node)
            ) || []

            return {
                coins,
                hasNextPage: response.data?.exploreList?.pageInfo?.hasNextPage || false,
                endCursor: response.data?.exploreList?.pageInfo?.endCursor
            }
        } catch (error) {
            console.error('Error fetching most valuable creator coins:', error)
            throw new Error(`Failed to fetch most valuable creator coins: ${error}`)
        }
    }
}

// Default client instance for Base chain
export const zoraClient = new ZoraClient(BASE_CHAIN_ID)

// Utility functions for common operations
export const zoraUtils = {
    // Get trending coins (combination of top gainers and high volume)
    getTrendingCoins: async (count: number = 20): Promise<CreatorCoin[]> => {
        try {
            const [gainers, volume] = await Promise.all([
                zoraClient.getTopGainers(count / 2),
                zoraClient.getTopVolume(count / 2)
            ])

            // Combine and deduplicate
            const combined = [...gainers.coins, ...volume.coins]
            const unique = combined.filter((coin, index, self) =>
                index === self.findIndex(c => c.id === coin.id)
            )

            return unique.slice(0, count)
        } catch (error) {
            console.error('Error fetching trending coins:', error)
            return []
        }
    },

    // Get comprehensive coin data including holders and recent activity
    getCoinWithDetails: async (address: string) => {
        try {
            const [coin, holders, swaps, comments] = await Promise.all([
                zoraClient.getCoin(address),
                zoraClient.getCoinHolders(address, 10),
                zoraClient.getCoinSwaps(address, 10),
                zoraClient.getCoinComments(address, 5)
            ])

            return {
                coin,
                holders: holders.holders,
                recentSwaps: swaps.swaps,
                comments: comments.comments
            }
        } catch (error) {
            console.error('Error fetching coin details:', error)
            throw error
        }
    }
}