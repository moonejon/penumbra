'use client'

import * as React from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReadingListWithBooks } from '@/shared.types'
import { ListCoverPreview } from './ListCoverPreview'
import { ListMetadata } from './ListMetadata'

interface ReadingListCardProps {
  list: ReadingListWithBooks
  viewMode: 'list' | 'grid'
  onClick: () => void
  isOwner?: boolean
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
  isOwner = false,
  className,
}: ReadingListCardProps) {
  // Extract cover images from books (max 4)
  // Handle both books array (full data) and _count (summary data)
  const coverImages = list.books
    ? list.books
        .slice(0, 4)
        .map((entry) => entry.book.image)
        .filter(Boolean)
    : []

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onClick()
    }
  }

  // Determine visibility icon
  const isPublic = list.visibility === 'PUBLIC'
  const VisibilityIcon = isPublic ? Eye : EyeOff
  const visibilityLabel = isPublic ? 'Public' : 'Private'

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
          'flex flex-row gap-3 items-center',
          'border border-zinc-800 rounded-lg p-3 sm:p-4',
          'cursor-pointer transition-all duration-200',
          'hover:border-zinc-600 hover:scale-[1.02]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
          'relative',
          className
        )}
      >
        {/* Visibility indicator - top right corner */}
        {isOwner && (
          <div className="absolute top-2 right-2">
            <VisibilityIcon
              size={14}
              className="text-zinc-500"
              aria-label={visibilityLabel}
            />
          </div>
        )}

        {/* Metadata takes up remaining space */}
        <div className="flex-1 min-w-0">
          <ListMetadata
            title={list.title}
            description={list.description || undefined}
            bookCount={list._count?.books || list.books?.length || 0}
          />
        </div>

        {/* Cover preview - smaller in list mode */}
        <div className="flex-shrink-0 w-24">
          <ListCoverPreview
            coverImages={coverImages}
            customCoverImage={list.coverImage}
          />
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
        'flex flex-col gap-3',
        'border border-zinc-800 rounded-lg p-3',
        'cursor-pointer transition-all duration-200',
        'hover:border-zinc-600 hover:scale-[1.02]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500',
        'relative',
        className
      )}
    >
      {/* Visibility indicator - top right corner */}
      {isOwner && (
        <div className="absolute top-2 right-2">
          <VisibilityIcon
            size={14}
            className="text-zinc-500"
            aria-label={visibilityLabel}
          />
        </div>
      )}

      {/* Cover preview - centered in grid mode */}
      <div className="w-full flex justify-center">
        <ListCoverPreview
          coverImages={coverImages}
          customCoverImage={list.coverImage}
        />
      </div>

      {/* Metadata below */}
      <ListMetadata
        title={list.title}
        description={list.description || undefined}
        bookCount={list._count?.books || list.books?.length || 0}
      />
    </div>
  )
}
