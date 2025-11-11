'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ReadingListWithBooks } from '@/shared.types'
import { ListCoverPreview } from './ListCoverPreview'
import { ListMetadata } from './ListMetadata'

interface ReadingListCardProps {
  list: ReadingListWithBooks
  viewMode: 'list' | 'grid'
  onClick: () => void
  className?: string
}

/**
 * ReadingListCard Component
 * Card displaying a reading list with cover previews and metadata
 * Supports both list and grid view modes
 */
export function ReadingListCard({
  list,
  viewMode,
  onClick,
  className,
}: ReadingListCardProps) {
  // Extract cover images from books (max 4)
  const coverImages = list.books
    .slice(0, 4)
    .map((entry) => entry.book.image)
    .filter(Boolean)

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  // List mode: horizontal layout with metadata on left, preview on right
  if (viewMode === 'list') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        aria-label={`View reading list: ${list.title}`}
        className={cn(
          'flex flex-row gap-4 items-center',
          'border border-zinc-800 rounded-lg p-4',
          'cursor-pointer transition-all duration-200',
          'hover:border-zinc-600 hover:scale-[1.02]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
          className
        )}
      >
        {/* Metadata takes up remaining space */}
        <div className="flex-1 min-w-0">
          <ListMetadata
            title={list.title}
            description={list.description || undefined}
            bookCount={list.books.length}
          />
        </div>

        {/* Cover preview - smaller in list mode */}
        <div className="flex-shrink-0 w-24">
          <ListCoverPreview coverImages={coverImages} />
        </div>
      </div>
    )
  }

  // Grid mode: vertical layout with preview on top, metadata below
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`View reading list: ${list.title}`}
      className={cn(
        'flex flex-col gap-4',
        'border border-zinc-800 rounded-lg p-4',
        'cursor-pointer transition-all duration-200',
        'hover:border-zinc-600 hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
        className
      )}
    >
      {/* Cover preview - larger in grid mode */}
      <div className="w-full">
        <ListCoverPreview coverImages={coverImages} />
      </div>

      {/* Metadata below */}
      <ListMetadata
        title={list.title}
        description={list.description || undefined}
        bookCount={list.books.length}
      />
    </div>
  )
}
