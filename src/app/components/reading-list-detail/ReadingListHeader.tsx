'use client'

import * as React from 'react'
import { ArrowLeft, Pencil, Trash2, Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { ReadingListWithBooks } from '@/shared.types'

interface ReadingListHeaderProps {
  list: ReadingListWithBooks
  isOwner: boolean
  onEdit: () => void
  onDelete: () => void
  onAddBooks: () => void
  className?: string
}

/**
 * ReadingListHeader Component
 * Displays list title, description, book count
 * Action buttons: Edit, Delete, Add Books, Back
 * Only shows edit/delete if user is owner
 */
export function ReadingListHeader({
  list,
  isOwner,
  onEdit,
  onDelete,
  onAddBooks,
  className,
}: ReadingListHeaderProps) {
  const router = useRouter()

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Back Button */}
      <button
        onClick={handleBack}
        className={cn(
          'inline-flex items-center gap-2 mb-6',
          'text-sm text-zinc-400 hover:text-zinc-100',
          'transition-colors',
          'min-h-[44px] min-w-[44px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-md px-2 py-1'
        )}
        aria-label="Back to home"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      {/* Header Content */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        {/* Title and Description */}
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold text-zinc-100 tracking-tight mb-2">
            {list.title}
          </h1>

          {list.description && (
            <p className="text-base text-zinc-400 mb-3 whitespace-pre-wrap">
              {list.description}
            </p>
          )}

          {/* Book Count */}
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <svg
              className="w-4 h-4"
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
            <span>
              {list.books.length} {list.books.length === 1 ? 'book' : 'books'}
            </span>
          </div>
        </div>

        {/* Action Buttons - Only for owners */}
        {isOwner && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Add Books Button */}
            <Button
              variant="default"
              size="default"
              onClick={onAddBooks}
              className="gap-2 min-h-[44px]"
              aria-label="Add books to list"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Books</span>
            </Button>

            {/* Edit Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={onEdit}
              aria-label="Edit list"
              className="min-h-[44px] min-w-[44px]"
            >
              <Pencil className="w-4 h-4" />
            </Button>

            {/* Delete Button */}
            <Button
              variant="destructive"
              size="icon"
              onClick={onDelete}
              aria-label="Delete list"
              className="min-h-[44px] min-w-[44px]"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export type { ReadingListHeaderProps }
