"use client"

import Link from "next/link"
import { WalletConnect } from "@/components/wallet-connect"
import Image from "next/image"

export function Header() {
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
            <Link
              href="/profile"
              className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Profile
            </Link>
          </nav>

          <WalletConnect />
        </div>
      </div>
    </header>
  )
}