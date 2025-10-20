"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  hasNextPage?: boolean
}

export function Pagination({ currentPage, totalPages, onPageChange, hasNextPage }: PaginationProps) {
  // Show pages 1-5 if we don't know total (rely on hasNextPage)
  const showPages = Math.min(5, totalPages || 5)
  const pages = Array.from({ length: showPages }, (_, i) => {
    if (!totalPages || totalPages <= 5) return i + 1
    if (currentPage <= 3) return i + 1
    if (currentPage >= totalPages - 2) return totalPages - 4 + i
    return currentPage - 2 + i
  })

  // Only show current page if we don't know total pages
  const displayPages = totalPages > 1 ? pages : [currentPage]

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="glass-card border-border hover:border-primary/40"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>

      {currentPage > 3 && totalPages > 5 && (
        <>
          <Button
            variant="outline"
            onClick={() => onPageChange(1)}
            className="glass-card border-border hover:border-primary/40"
          >
            1
          </Button>
          <span className="text-muted-foreground">...</span>
        </>
      )}

      {displayPages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "outline"}
          onClick={() => onPageChange(page)}
          className={
            page === currentPage
              ? "bg-primary hover:bg-primary/90 text-background"
              : "glass-card border-border hover:border-primary/40"
          }
        >
          {page}
        </Button>
      ))}

      {hasNextPage && currentPage < 3 && (
        <span className="text-muted-foreground">...</span>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNextPage}
        className="glass-card border-border hover:border-primary/40"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  )
}