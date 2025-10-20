"use client"

import { use } from "react"
import { Header } from "@/components/header"
import { UserProfile } from "@/components/user-profile"
import { UserCoins } from "@/components/user-coins"

export default function ProfilePage({ params }: { params: Promise<{ address: string }> }) {
  const resolvedParams = use(params)
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

