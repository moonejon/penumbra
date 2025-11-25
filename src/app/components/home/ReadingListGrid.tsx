'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { ReadingListWithBooks } from '@/shared.types'
import { ReadingListCard } from './ReadingListCard'

interface ReadingListGridProps {
  lists: ReadingListWithBooks[]
  viewMode: 'list' | 'grid'
  isOwner?: boolean
  className?: string
}

/**
 * ReadingListGrid Component
 * Container for reading list cards with responsive grid layout
 * Handles navigation to individual reading list pages
 */
export function ReadingListGrid({
  lists,
  viewMode,
  isOwner = false,
  className,
}: ReadingListGridProps) {
  const router = useRouter()

  // Handle navigation to reading list detail page
  const handleListClick = (listId: number) => {
    router.push(`/reading-lists/${listId}`)
  }

  // Empty array case - parent component should show EmptyState instead
  if (lists.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'grid gap-3',
        // Responsive grid columns
        viewMode === 'grid'
          ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
          : 'grid-cols-1',
        className
      )}
    >
      {lists.map((list) => (
        <ReadingListCard
          key={list.id}
          list={list}
          viewMode={viewMode}
          onClick={() => handleListClick(list.id)}
          isOwner={isOwner}
        />
      ))}
    </div>
  )
}
