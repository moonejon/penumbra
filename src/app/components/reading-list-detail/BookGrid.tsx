'use client'

import * as React from 'react'
import { Reorder } from 'motion/react'
import { cn } from '@/lib/utils'
import type { BookInReadingListEntry } from '@/shared.types'
import { BookCard } from './BookCard'

interface BookGridProps {
  books: BookInReadingListEntry[]
  onReorder: (newOrder: BookInReadingListEntry[]) => void
  onRemoveBook: (bookId: number) => void
  onViewBookDetails: (entry: BookInReadingListEntry) => void
  isReordering?: boolean
  isOwner: boolean
  className?: string
}

/**
 * BookGrid Component
 * Displays books in a responsive grid layout
 * Supports drag-and-drop reordering on desktop using Motion v11
 * Shows empty state if no books
 */
export function BookGrid({
  books,
  onReorder,
  onRemoveBook,
  onViewBookDetails,
  isReordering = false,
  isOwner,
  className,
}: BookGridProps) {
  // Empty state
  if (books.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-zinc-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-zinc-100 mb-2">
          No books in this list yet
        </h3>
        <p className="text-sm text-zinc-400 max-w-sm">
          Add books from your library to start building this reading list.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Desktop: Drag-and-drop enabled grid (only for owners) */}
      {isOwner ? (
        <div className="hidden md:block">
          <Reorder.Group
            axis="y"
            values={books}
            onReorder={onReorder}
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4"
          >
            {books.map((entry) => (
              <Reorder.Item
                key={entry.book.id}
                value={entry}
                className="cursor-grab active:cursor-grabbing"
                drag={!isReordering}
                whileDrag={{ scale: 1.05, zIndex: 50 }}
                transition={{ duration: 0.2 }}
              >
                <BookCard
                  book={entry.book}
                  notes={entry.notes}
                  onRemove={() => onRemoveBook(entry.book.id)}
                  onViewDetails={() => onViewBookDetails(entry)}
                  isOwner={isOwner}
                />
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      ) : (
        // Desktop: Static grid for non-owners
        <div className="hidden md:block">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {books.map((entry) => (
              <BookCard
                key={entry.book.id}
                book={entry.book}
                notes={entry.notes}
                onRemove={() => onRemoveBook(entry.book.id)}
                onViewDetails={() => onViewBookDetails(entry)}
                isOwner={isOwner}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mobile: Static grid without drag-and-drop */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {books.map((entry) => (
            <BookCard
              key={entry.book.id}
              book={entry.book}
              notes={entry.notes}
              onRemove={() => onRemoveBook(entry.book.id)}
              onViewDetails={() => onViewBookDetails(entry)}
              isOwner={isOwner}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export type { BookGridProps }
