"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

interface SearchBarProps {
  onSearchChange?: (search: string) => void
  onSortChange?: (sortBy: string) => void
  loading?: boolean
}

export function SearchBar({ onSearchChange, onSortChange, loading = false }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchParams?.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams?.get("sortBy") || "mostValuable")
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [searchType, setSearchType] = useState<string>("")

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmedSearch = search.trim()
      
      if (!trimmedSearch) {
        setSearchType("")
        if (onSearchChange) onSearchChange("")
        return
      }
      
      // 1. Check if search looks like a full contract address (starts with 0x and is 42 chars)
      if (trimmedSearch.startsWith('0x') && trimmedSearch.length === 42) {
        console.log('Detected contract address, redirecting to coin page...')
        setSearchType("coin")
        setIsRedirecting(true)
        router.push(`/coin/${trimmedSearch}`)
        // Clear search after a short delay
        setTimeout(() => {
          setSearch('')
          setIsRedirecting(false)
          setSearchType("")
        }, 1000)
        return
      }
      
      // 2. Check if search looks like a creator username (starts with @)
      if (trimmedSearch.startsWith('@')) {
        console.log('Detected creator username, searching for creator coins...')
        setSearchType("creator")
        const username = trimmedSearch.substring(1) // Remove @ symbol
        if (onSearchChange) {
          onSearchChange(username) // Search by creator username
        }
        return
      }
      
      // 3. Check if it's a partial address
      if (trimmedSearch.startsWith('0x')) {
        setSearchType("address")
      } else {
        setSearchType("name")
      }
      
      // 4. Normal search (name, symbol, partial address)
      if (onSearchChange) {
        onSearchChange(trimmedSearch)
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [search, onSearchChange, router])

  useEffect(() => {
    if (onSortChange) {
      onSortChange(sortBy)
    }
  }, [sortBy, onSortChange])

  if (loading) {
    return (
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-12 w-48 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="flex flex-col md:flex-row gap-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search: name, @username, creator address, or coin address (0x...)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 glass-card rounded-xl h-12"
          disabled={isRedirecting}
        />
        {isRedirecting && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="flex items-center gap-2 text-sm text-primary">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Opening coin...
            </div>
          </div>
        )}
        {!isRedirecting && searchType && search && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="text-xs text-muted-foreground px-2 py-1 bg-muted rounded-md">
              {searchType === "creator" && "👤 Creator"}
              {searchType === "address" && "📍 Address"}
              {searchType === "name" && "🔍 Name"}
              {searchType === "coin" && "🪙 Coin"}
            </div>
          </div>
        )}
      </div>

      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-full md:w-[200px] glass-card rounded-xl h-12">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mostValuable">Most Valuable</SelectItem>
          <SelectItem value="topGainers">Top Gainers</SelectItem>
          <SelectItem value="topVolume">Top Volume</SelectItem>
          <SelectItem value="new">New Coins</SelectItem>
          <SelectItem value="recentlyTraded">Recently Traded</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}