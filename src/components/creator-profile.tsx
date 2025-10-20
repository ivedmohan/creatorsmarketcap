                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                        
                                                                                                                                                                                                                                                                                                                                                                                                                        "use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"

interface CreatorProfileProps {
  address: string
}

interface CreatorData {
  id?: string
  handle?: string
  displayName?: string
  bio?: string
  avatar?: string
  website?: string
  walletAddress?: string
  verified?: boolean
}

export function CreatorProfile({ address }: CreatorProfileProps) {
  const [creator, setCreator] = useState<CreatorData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCreatorProfile = async () => {
      try {
        // Try to fetch profile from Zora API
        const response = await fetch(`/api/profile/${address}`)
        const data = await response.json()
        
        if (data.success && data.data) {
          setCreator(data.data)
        } else {
          // Fallback to basic data if profile not found
          setCreator({
            walletAddress: address,
            displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
            bio: "Creator on Base blockchain",
            verified: false
          })
        }
      } catch (error) {
        console.error('Failed to fetch creator profile:', error)
        // Fallback to basic data
        setCreator({
          walletAddress: address,
          displayName: `${address.slice(0, 6)}...${address.slice(-4)}`,
          bio: "Creator on Base blockchain",
          verified: false
        })
      } finally {
        setLoading(false)
      }
    }

    if (address) {
      fetchCreatorProfile()
    }
  }, [address])

  if (loading) {
    return (
      <Card className="glass-card border-white/10 rounded-2xl">
        <CardHeader>
          <CardTitle>Creator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!creator) {
    return null
  }

  const displayName = creator.displayName || creator.handle || `${address.slice(0, 6)}...${address.slice(-4)}`
  const creatorAddress = creator.walletAddress || address

  return (
    <Card className="glass-card border-white/10 rounded-2xl">
      <CardHeader>
        <CardTitle>Creator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="w-12 h-12 ring-2 ring-primary/20">
            <AvatarImage src={creator.avatar || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback>{displayName[0]?.toUpperCase() || '?'}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="font-semibold">{displayName}</p>
              {creator.verified && <Badge variant="default" className="text-xs bg-primary">Verified</Badge>}
            </div>
            <p className="text-xs text-muted-foreground font-mono">
              {creatorAddress.slice(0, 10)}...
            </p>
          </div>
        </div>

        {creator.bio && (
          <p className="text-sm text-muted-foreground">{creator.bio}</p>
        )}

        <div className="flex gap-2">
          <Link href={`/profile/${creatorAddress}`} className="flex-1">
            <Button variant="outline" className="w-full gap-2 bg-transparent hover:bg-white/10">
              <ExternalLink className="w-4 h-4" />
              View Profile
            </Button>
          </Link>
          {creator.website && (
            <Button 
              variant="outline" 
              size="icon"
              className="bg-transparent hover:bg-white/10"
              onClick={() => window.open(creator.website, '_blank')}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
