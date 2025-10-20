"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { WalletConnect } from "@/components/wallet-connect"
import { useAccount } from "wagmi"
import Image from "next/image"

export function Header() {
  const { address, isConnected } = useAccount()
  const router = useRouter()

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isConnected && address) {
      router.push(`/profile/${address}`)
    } else {
      // Show connect wallet prompt or redirect to connect
      router.push('/?connect=true')
    }
  }
  return (
    <header className="border-b border-border/50 glass sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl shadow-lg group-hover:shadow-primary/50 transition-shadow">
              <Image src="/logo.jpg" alt="CreatorsMarketCap" width={32} height={32} />
            </div>
            <span className="text-xl font-bold">CreatorsMarketCap</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Coins
            </Link>
            <Link
              href="/trending"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Trending
            </Link>
            <button
              onClick={handleProfileClick}
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              {isConnected ? "My Profile" : "Profile"}
            </button>
          </nav>

          <WalletConnect />
        </div>
      </div>
    </header>
  )
}