"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { TrustScoreBadge } from "@/components/trust-score-badge"
import { TrendingUp, TrendingDown } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Pagination } from "@/components/pagination"
import type { CreatorCoin } from "@/types"

interface CoinsTableProps {
  sortBy?: string
  searchTerm?: string
}

export function CoinsTable({ sortBy = "mostValuable", searchTerm = "" }: CoinsTableProps) {
  const [coins, setCoins] = useState<CreatorCoin[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [cursors, setCursors] = useState<{ [page: number]: string }>({}) // Track cursors for each page
  const limit = 20

  // Reset page to 1 when search term or sort changes
  useEffect(() => {
    setPage(1)
    setCursors({}) // Clear cursors when sort/search changes
  }, [searchTerm, sortBy])

  useEffect(() => {
    const fetchCoins = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // When searching, fetch more coins to improve search results
        const fetchLimit = searchTerm ? 100 : limit
        
        // Get cursor for current page (page 1 has no cursor, page 2+ use cursor from previous page)
        const cursor = page > 1 ? cursors[page - 1] : undefined
        
        const params = new URLSearchParams({
          sortBy,
          limit: fetchLimit.toString(),
          page: searchTerm ? '1' : page.toString(), // Always page 1 when searching
          ...(searchTerm && { search: searchTerm }),
          ...(cursor && { after: cursor }) // Add cursor for pagination
        })

        console.log(`Fetching coins with params:`, {sortBy, limit: fetchLimit, page: searchTerm ? 1 : page, cursor, searchTerm})
        const response = await fetch(`/api/coins?${params}`)
        const data = await response.json()
        
        console.log(`API Response:`, {success: data.success, coinCount: data.data?.coins?.length, total: data.data?.total})

        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch coins')
        }

        if (data.success) {
          setCoins(data.data.coins)
          setHasNextPage(data.data.hasNextPage || false)
          
          // Store cursor for next page if available
          if (data.data.endCursor && data.data.hasNextPage) {
            setCursors(prev => ({ ...prev, [page]: data.data.endCursor }))
          }
          
          // Calculate total pages based on response
          const calculatedPages = Math.max(1, Math.ceil(data.data.total / limit))
          setTotalPages(calculatedPages)
          console.log(`Page ${page}: Got ${data.data.coins.length} coins, hasNextPage: ${data.data.hasNextPage}, endCursor: ${data.data.endCursor ? 'Yes' : 'No'}`)
        } else {
          throw new Error(data.error || 'Failed to fetch coins')
        }
      } catch (err) {
        console.error('Error fetching coins:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setCoins([])
      } finally {
        setLoading(false)
      }
    }

    fetchCoins()
  }, [page, sortBy, searchTerm, limit])

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 text-primary hover:underline"
        >
          Try again
        </button>
      </div>
    )
  }

  if (coins.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No coins found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="glass-card rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-border/50">
              <TableHead className="w-12">#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">24h %</TableHead>
              <TableHead className="text-right">Market Cap</TableHead>
              <TableHead className="text-right">Volume (24h)</TableHead>
              <TableHead className="text-right">Holders</TableHead>
              <TableHead className="text-right">Trust Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {coins.map((coin, index) => (
              <TableRow key={coin.id} className="border-border/50 hover:bg-white/5 transition-colors">
                <TableCell className="font-medium text-muted-foreground">
                  {searchTerm ? index + 1 : (page - 1) * limit + index + 1}
                </TableCell>
                <TableCell>
                  <Link
                    href={`/coin/${coin.contractAddress}`}
                    className="flex items-center gap-3 hover:text-primary transition-colors"
                  >
                    <Avatar className="w-8 h-8 rounded-xl">
                      <AvatarImage src={coin.metadata.image || "/placeholder.svg"} alt={coin.name} />
                      <AvatarFallback>{coin.symbol.slice(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{coin.name}</div>
                      <div className="text-sm text-muted-foreground">{coin.symbol}</div>
                    </div>
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${coin.currentPrice.toFixed(6)}
                </TableCell>
                <TableCell className="text-right">
                  <div
                    className={`flex items-center justify-end gap-1 ${
                      coin.priceChange24h >= 0 ? "text-green-500" : "text-red-500"
                    }`}
                  >
                    {coin.priceChange24h >= 0 ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="font-medium">{Math.abs(coin.priceChange24h).toFixed(2)}%</span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${coin.marketCap >= 1000000 
                    ? (coin.marketCap / 1000000).toFixed(2) + 'M'
                    : coin.marketCap >= 1000
                    ? (coin.marketCap / 1000).toFixed(2) + 'K'
                    : coin.marketCap.toFixed(2)
                  }
                </TableCell>
                <TableCell className="text-right font-mono">
                  ${coin.volume24h >= 1000000 
                    ? (coin.volume24h / 1000000).toFixed(2) + 'M'
                    : coin.volume24h >= 1000
                    ? (coin.volume24h / 1000).toFixed(2) + 'K'
                    : coin.volume24h.toFixed(2)
                  }
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {coin.holders.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  {coin.trustScore ? (
                    <TrustScoreBadge score={coin.trustScore} showDetails />
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {searchTerm ? (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Found {coins.length} coin{coins.length !== 1 ? 's' : ''} matching "{searchTerm}"
          </p>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(page - 1) * limit + 1} to {Math.min(page * limit, (page - 1) * limit + coins.length)} coins
          </p>
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            onPageChange={setPage}
            hasNextPage={hasNextPage}
          />
        </div>
      )}
    </div>
  )
}