'use client'

import * as React from 'react'
import { X, GripVertical, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BookType } from '@/shared.types'
import Image from 'next/image'

interface BookCardProps {
  book: BookType
  notes?: string | null
  onRemove?: () => void
  onViewDetails?: () => void
  isDragging?: boolean
  isOwner?: boolean
  className?: string
}

/**
 * BookCard Component
 * Displays a book in a reading list with cover, title, author
 * Includes remove button and notes indicator
 * Supports drag-and-drop via parent Reorder.Item
 */
export function BookCard({
  book,
  notes,
  onRemove,
  onViewDetails,
  isDragging = false,
  isOwner = true,
  className,
}: BookCardProps) {
  return (
    <div
      className={cn(
        'relative group',
        'bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden',
        'transition-all duration-200',
        'hover:border-zinc-600',
        isDragging && 'opacity-50 scale-95',
        className
      )}
    >
      {/* Drag Handle - Desktop Only */}
      <div
        className={cn(
          'hidden md:flex absolute top-2 left-2 z-10',
          'items-center justify-center',
          'w-8 h-8 bg-zinc-800/80 backdrop-blur-sm rounded-md',
          'cursor-grab active:cursor-grabbing',
          'opacity-0 group-hover:opacity-100',
          'transition-opacity'
        )}
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4 text-zinc-400" />
      </div>

      {/* Remove Button */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className={cn(
            'absolute top-2 right-2 z-10',
            'flex items-center justify-center',
            'min-w-[44px] min-h-[44px] bg-red-500/80 backdrop-blur-sm rounded-md',
            'opacity-0 group-hover:opacity-100',
            'transition-all duration-200',
            'hover:bg-red-500 hover:scale-110',
            'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500'
          )}
          aria-label={`Remove ${book.title} from list`}
        >
          <X className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Notes Indicator - Only visible to owner */}
      {notes && isOwner && (
        <div
          className="absolute bottom-2 right-2 z-10 flex items-center justify-center w-6 h-6 bg-blue-500/80 backdrop-blur-sm rounded-full"
          aria-label="Has notes"
        >
          <FileText className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Card Content - Clickable to view details */}
      <div
        role="button"
        tabIndex={0}
        onClick={onViewDetails}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onViewDetails?.()
          }
        }}
        className={cn(
          'cursor-pointer p-4',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500'
        )}
      >
        {/* Book Cover */}
        <div className="relative aspect-[2/3] w-full mb-3 bg-zinc-800 rounded-md overflow-hidden">
          <Image
            src={book.image || '/placeholder-book.png'}
            alt={`Cover of ${book.title}`}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
            className="object-cover"
            priority={false}
          />
        </div>

        {/* Book Title */}
        <h3 className="text-sm font-medium text-zinc-100 line-clamp-2 mb-1">
          {book.title}
        </h3>

        {/* Book Authors */}
        {book.authors && book.authors.length > 0 && (
          <p className="text-xs text-zinc-400 line-clamp-1">
            {book.authors.join(', ')}
          </p>
        )}
      </div>
    </div>
  )
}

export type { BookCardProps }
