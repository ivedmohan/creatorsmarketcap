"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Twitter, Github, Globe, Copy } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface ZoraProfile {
  address: string
  displayName?: string
  bio?: string
  avatar?: string
  twitter?: string
  github?: string
  website?: string
  createdAt?: string
  stats?: {
    totalCoinsCreated: number
    totalMarketCap: number
    totalVolume: number
    followers?: number
  }
}

export function UserProfile({ address }: { address: string }) {
  const [profile, setProfile] = useState<ZoraProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch Zora profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/profile/${address}?includeCoins=true`)
        const data = await response.json()
        
        if (data.success && data.data) {
          const profileData = data.data
          const zoraProfile = profileData.zoraProfile
          
          console.log('🔍 Profile API response:', data)
          console.log('🖼️ Zora profile data:', zoraProfile)
          console.log('🖼️ Avatar URL:', zoraProfile?.avatar)
          console.log('🖼️ Avatar URL length:', zoraProfile?.avatar?.length)
          
          setProfile({
            address: profileData.address || address,
            displayName: zoraProfile?.displayName || `User ${address.slice(0, 6)}`,
            bio: zoraProfile?.bio || "Creator on Base blockchain",
            avatar: zoraProfile?.avatar, // Access from zoraProfile
            twitter: zoraProfile?.socialAccounts?.twitter,
            github: zoraProfile?.socialAccounts?.github,
            website: zoraProfile?.website,
            createdAt: profileData.createdAt,
            stats: {
              totalCoinsCreated: profileData.createdCoins?.length || 0,
              totalMarketCap: profileData.createdCoins?.reduce((sum: number, coin: any) => sum + (coin.marketCap || 0), 0) || 0,
              totalVolume: profileData.createdCoins?.reduce((sum: number, coin: any) => sum + (coin.volume24h || 0), 0) || 0,
              followers: zoraProfile?.followers
            }
          })
          
          console.log('✅ Profile state set with avatar:', zoraProfile?.avatar)
        } else {
          // Fallback for users without Zora profile
          setProfile({
            address,
            displayName: `User ${address.slice(0, 6)}`,
            bio: "Creator on Base blockchain",
            stats: {
              totalCoinsCreated: 0,
              totalMarketCap: 0,
              totalVolume: 0
            }
          })
        }
      } catch (err) {
        console.error('Failed to fetch profile:', err)
        console.error('Error details:', {
          message: err instanceof Error ? err.message : 'Unknown error',
          stack: err instanceof Error ? err.stack : undefined,
          address
        })
        setError(`Failed to load profile data: ${err instanceof Error ? err.message : 'Unknown error'}`)
        // Fallback profile
        setProfile({
          address,
          displayName: `User ${address.slice(0, 6)}`,
          bio: "Creator on Base blockchain",
          stats: {
            totalCoinsCreated: 0,
            totalMarketCap: 0,
            totalVolume: 0
          }
        })
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [address])

  const copyAddress = () => {
    navigator.clipboard.writeText(address)
  }

  if (loading) {
    return (
      <Card className="glass-card border-border rounded-2xl">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <Skeleton className="w-24 h-24 rounded-2xl" />
            <div className="flex-1 space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full max-w-2xl" />
              <Skeleton className="h-4 w-3/4 max-w-xl" />
              <div className="flex gap-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="glass-card border-border rounded-2xl">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <p className="text-destructive mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="glass-card border-border rounded-2xl">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-24 h-24 rounded-2xl ring-2 ring-primary/20">
            <AvatarImage 
              src={profile?.avatar || "/placeholder.svg"} 
              alt={profile?.displayName || "User"}
              onError={(e) => {
                console.log('🖼️ Avatar image failed to load:', profile?.avatar)
                console.log('🖼️ Trying fallback...')
                // Try to use a different avatar size or fallback
                if (profile?.avatar && !profile.avatar.includes('/placeholder.svg')) {
                  // If it's a Cloudinary URL, try to get a smaller size
                  const fallbackUrl = profile.avatar.replace('/rs:fit:1200:1200/', '/rs:fit:200:200/')
                  if (fallbackUrl !== profile.avatar) {
                    e.currentTarget.src = fallbackUrl
                    return
                  }
                }
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <AvatarFallback className="text-2xl bg-gradient-to-br from-primary/20 to-chart-1/20">
              {profile?.displayName?.[0]?.toUpperCase() || address[0]?.toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profile?.displayName}</h1>
              {(profile?.stats?.totalCoinsCreated || 0) > 0 && (
                <Badge variant="outline" className="border-primary text-primary rounded-full">
                  Creator
                </Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-2 text-lg">@{address.slice(0, 8)}...</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">{profile?.bio}</p>
            
            {/* Social Links */}
            {(profile?.twitter || profile?.github || profile?.website) && (
              <div className="flex items-center gap-3 mb-4">
                {profile.twitter && (
                  <a
                    href={`https://twitter.com/${profile.twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 transition-colors"
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                )}
                {profile.github && (
                  <a
                    href={`https://github.com/${profile.github}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 transition-colors"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                {profile.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white/5 border border-white/10 hover:border-primary/40 transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                )}
              </div>
            )}

            {/* Address */}
            <div className="flex items-center gap-2 mb-6">
              <code className="text-xs font-mono bg-muted px-3 py-1.5 rounded-lg text-muted-foreground">{address}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={copyAddress}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>

            {/* Profile Stats */}
            {profile?.stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 rounded-lg bg-white/5 border border-white/10">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{profile.stats.totalCoinsCreated}</div>
                  <div className="text-xs text-muted-foreground">Coins Created</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-1">${(profile.stats.totalMarketCap / 1000000).toFixed(1)}M</div>
                  <div className="text-xs text-muted-foreground">Total Market Cap</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-2">${(profile.stats.totalVolume / 1000).toFixed(1)}K</div>
                  <div className="text-xs text-muted-foreground">24h Volume</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-chart-3">{profile.stats.followers || 0}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
              </div>
            )}

            <div className="flex gap-3 flex-wrap">
              <Button className="bg-primary hover:bg-primary/90 text-background rounded-xl">Claim Ownership</Button>
              <Button
                variant="outline"
                className="glass-card border-border hover:border-primary/40 rounded-xl bg-transparent"
              >
                Connect Talent Protocol
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}