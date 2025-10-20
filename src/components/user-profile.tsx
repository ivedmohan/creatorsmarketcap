"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrustScoreBadge } from "@/components/trust-score-badge"
import { ExternalLink } from "lucide-react"

export function UserProfile({ address }: { address: string }) {
  const profile = {
    handle: "@creator",
    displayName: "Creator Name",
    bio: "Building the future of creator economy on Base",
    avatar: "/diverse-user-avatars.png",
    trustScore: 85,
    verified: true,
  }

  return (
    <Card className="glass-card border-border rounded-2xl">
      <CardContent className="pt-6">
        <div className="flex flex-col md:flex-row items-start gap-6">
          <Avatar className="w-24 h-24 rounded-2xl ring-2 ring-primary/20">
            <AvatarImage src={profile.avatar || "/placeholder.svg"} alt={profile.displayName} />
            <AvatarFallback className="text-2xl">{profile.displayName[0]}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-3xl font-bold">{profile.displayName}</h1>
              {profile.verified && (
                <Badge variant="outline" className="border-primary text-primary rounded-full">
                  Verified
                </Badge>
              )}
              <TrustScoreBadge score={profile.trustScore} showDetails />
            </div>
            <p className="text-muted-foreground mb-2 text-lg">{profile.handle}</p>
            <p className="text-sm text-muted-foreground mb-4 max-w-2xl">{profile.bio}</p>
            <div className="flex items-center gap-2 mb-6">
              <code className="text-xs font-mono bg-muted px-3 py-1.5 rounded-lg text-muted-foreground">{address}</code>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => navigator.clipboard.writeText(address)}
              >
                <ExternalLink className="w-4 h-4" />
              </Button>
            </div>

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
