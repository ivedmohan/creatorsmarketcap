// Background jobs for data refresh and maintenance

import { talentClient, talentUtils } from './talent'
import { zoraClient } from './zora'
import { talentScoresStorage } from './localStorage'
import { CreatorCoin } from '@/types'

// Job scheduler class
export class JobScheduler {
  private jobs: Map<string, NodeJS.Timeout> = new Map()
  private isRunning = false

  start() {
    if (this.isRunning) return
    
    this.isRunning = true
    console.log('Background job scheduler started')

    // Schedule talent score refresh every 30 minutes
    this.scheduleJob('talent-refresh', () => this.refreshTalentScores(), 30 * 60 * 1000)

    // Schedule coin data refresh every 5 minutes
    this.scheduleJob('coin-refresh', () => this.refreshCoinData(), 5 * 60 * 1000)

    // Schedule cache cleanup every hour
    this.scheduleJob('cache-cleanup', () => this.cleanupCache(), 60 * 60 * 1000)
  }

  stop() {
    this.jobs.forEach((timeout, jobName) => {
      clearInterval(timeout)
      console.log(`Stopped job: ${jobName}`)
    })
    
    this.jobs.clear()
    this.isRunning = false
    console.log('Background job scheduler stopped')
  }

  private scheduleJob(name: string, job: () => Promise<void>, intervalMs: number) {
    // Run immediately
    job().catch(error => console.error(`Error in job ${name}:`, error))
    
    // Schedule recurring execution
    const timeout = setInterval(async () => {
      try {
        await job()
      } catch (error) {
        console.error(`Error in scheduled job ${name}:`, error)
      }
    }, intervalMs)

    this.jobs.set(name, timeout)
    console.log(`Scheduled job: ${name} (every ${intervalMs / 1000}s)`)
  }

  // Refresh talent scores for active users
  private async refreshTalentScores(): Promise<void> {
    console.log('Starting talent score refresh...')
    
    try {
      // Get all cached scores
      const cachedScores = talentScoresStorage.get()
      const addresses = Object.keys(cachedScores)

      if (addresses.length === 0) {
        console.log('No cached scores to refresh')
        return
      }

      console.log(`Refreshing ${addresses.length} talent scores`)

      // Refresh scores in batches
      const batchSize = 5
      let refreshed = 0

      for (let i = 0; i < addresses.length; i += batchSize) {
        const batch = addresses.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (address) => {
          try {
            const score = await talentClient.getBuilderScore(address)
            if (score) {
              talentScoresStorage.setScore(address, score)
              refreshed++
            }
          } catch (error) {
            console.error(`Failed to refresh score for ${address}:`, error)
          }
        })

        await Promise.all(batchPromises)

        // Add delay between batches to respect rate limits
        if (i + batchSize < addresses.length) {
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

      console.log(`Talent score refresh completed: ${refreshed}/${addresses.length} updated`)
    } catch (error) {
      console.error('Error in talent score refresh:', error)
    }
  }

  // Refresh coin data (placeholder for future implementation)
  private async refreshCoinData(): Promise<void> {
    console.log('Starting coin data refresh...')
    
    try {
      // This would refresh trending coins, new coins, etc.
      // For now, just log that it's running
      console.log('Coin data refresh completed')
    } catch (error) {
      console.error('Error in coin data refresh:', error)
    }
  }

  // Clean up old cache entries
  private async cleanupCache(): Promise<void> {
    console.log('Starting cache cleanup...')
    
    try {
      const cachedScores = talentScoresStorage.get()
      const now = Date.now()
      const maxAge = 24 * 60 * 60 * 1000 // 24 hours
      let cleaned = 0

      Object.entries(cachedScores).forEach(([address, cached]) => {
        if (now - cached.timestamp > maxAge) {
          talentScoresStorage.removeScore(address)
          cleaned++
        }
      })

      console.log(`Cache cleanup completed: ${cleaned} entries removed`)
    } catch (error) {
      console.error('Error in cache cleanup:', error)
    }
  }
}

// Singleton instance
export const jobScheduler = new JobScheduler()

// Utility functions for manual job execution
export const jobUtils = {
  // Manually refresh scores for specific addresses
  refreshScoresForAddresses: async (addresses: string[]): Promise<void> => {
    console.log(`Manually refreshing scores for ${addresses.length} addresses`)
    
    for (const address of addresses) {
      try {
        const score = await talentClient.getBuilderScore(address)
        if (score) {
          talentScoresStorage.setScore(address, score)
        }
      } catch (error) {
        console.error(`Failed to refresh score for ${address}:`, error)
      }
    }
  },

  // Get job status
  getJobStatus: (): { running: boolean, activeJobs: string[] } => {
    return {
      running: jobScheduler['isRunning'],
      activeJobs: Array.from(jobScheduler['jobs'].keys())
    }
  },

  // Force cache cleanup
  forceCleanup: async (): Promise<number> => {
    const cachedScores = talentScoresStorage.get()
    const addresses = Object.keys(cachedScores)
    
    // Clear all cached scores
    addresses.forEach(address => {
      talentScoresStorage.removeScore(address)
    })

    return addresses.length
  }
}

// Initialize jobs in production
if (typeof window === 'undefined' && process.env.NODE_ENV === 'production') {
  // Start jobs after a delay to allow app initialization
  setTimeout(() => {
    jobScheduler.start()
  }, 10000) // 10 second delay
}