import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  size?: 'sm' | 'default'
  disabled?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  size = 'default',
  disabled = false,
}: PaginationProps) {
  const buttonSize = size === 'sm' ? 'h-8 w-8 text-sm' : 'h-10 w-10'

  const getPageNumbers = () => {
    const delta = size === 'sm' ? 1 : 2
    const range = []
    const rangeWithDots = []

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i)
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...')
    } else {
      rangeWithDots.push(1)
    }

    rangeWithDots.push(...range)

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages)
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages)
    }

    return rangeWithDots
  }

  return (
    <nav className="flex items-center gap-1" aria-label="Pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || disabled}
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-md border border-border bg-background',
          'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        )}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {getPageNumbers().map((pageNum, idx) =>
        pageNum === '...' ? (
          <span
            key={`dots-${idx}`}
            className={cn(buttonSize, 'flex items-center justify-center')}
          >
            ...
          </span>
        ) : (
          <button
            key={pageNum}
            onClick={() => onPageChange(pageNum as number)}
            disabled={disabled}
            className={cn(
              buttonSize,
              'flex items-center justify-center rounded-md border transition-colors',
              currentPage === pageNum
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-background hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed'
            )}
            aria-label={`Page ${pageNum}`}
            aria-current={currentPage === pageNum ? 'page' : undefined}
          >
            {pageNum}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || disabled}
        className={cn(
          buttonSize,
          'flex items-center justify-center rounded-md border border-border bg-background',
          'hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
        )}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  )
}
