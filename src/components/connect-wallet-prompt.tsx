"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wallet, ExternalLink } from "lucide-react"
import { WalletConnect } from "@/components/wallet-connect"

export function ConnectWalletPrompt() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Card className="glass-card border-border rounded-2xl">
            <CardHeader className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary/20 to-chart-1/20 flex items-center justify-center">
                <Wallet className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
              <p className="text-muted-foreground mt-2">
                Connect your wallet to view your profile, claim coin ownership, and access personalized features.
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">What you can do with your wallet connected:</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-primary"></div>
                    <span>View your profile and created coins</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-chart-1"></div>
                    <span>Claim ownership of coins you hold</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-chart-2"></div>
                    <span>Swap ETH for creator coins</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-chart-3"></div>
                    <span>Track your portfolio performance</span>
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <WalletConnect />
              </div>

              <div className="text-xs text-muted-foreground space-y-2">
                <p>🔒 Your wallet connection is secure and only used for:</p>
                <ul className="list-disc list-inside space-y-1 text-left max-w-md mx-auto">
                  <li>Reading your wallet address</li>
                  <li>Signing messages for verification</li>
                  <li>Executing transactions you approve</li>
                </ul>
                <p className="pt-2">
                  <a
                    href="https://zora.co"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    Learn more about Zora <ExternalLink className="w-3 h-3" />
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
