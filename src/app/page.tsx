"use client"

import { useState } from "react"
import { CoinsTable } from "@/components/coins-table"
import { Header } from "@/components/header"
import { StatsOverview } from "@/components/stats-overview"
import { SearchBar } from "@/components/search-bar"

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("mostValuable")

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Creator Coins Market</h1>
          <p className="text-muted-foreground text-lg">
            Track and discover creator coins on Base blockchain
          </p>
        </div>

        <StatsOverview />

        <div className="mt-8">
          <SearchBar 
            onSearchChange={setSearchTerm}
            onSortChange={setSortBy}
          />
        </div>

        <div className="mt-6">
          <CoinsTable 
            searchTerm={searchTerm}
            sortBy={sortBy}
          />
        </div>
      </main>
    </div>
  )
}