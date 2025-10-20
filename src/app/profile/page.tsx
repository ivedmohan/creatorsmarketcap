"use client"

import { use } from "react"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { UserProfile } from "@/components/user-profile"
import { UserCoins } from "@/components/user-coins"
import { Header } from "@/components/header"

interface ProfilePageProps {
  params: Promise<{ address: string }>
}

export default function ProfilePage({ params }: ProfilePageProps) {
  const resolvedParams = use(params)
  
  // If no address in params, show connect wallet prompt
  if (!resolvedParams.address) {
    return <ConnectWalletPrompt />
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <UserProfile address={resolvedParams.address} />
        <div className="mt-8">
          <UserCoins address={resolvedParams.address} />
        </div>
      </main>
    </div>
  )
}
