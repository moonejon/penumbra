'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

interface ListMetadataProps {
  title: string
  description?: string
  bookCount: number
  className?: string
}

/**
 * ListMetadata Component
 * Displays reading list metadata: title, description, and book count
 */
export function ListMetadata({
  title,
  description,
  bookCount,
  className,
}: ListMetadataProps) {
  // Format book count as "X books" or "1 book"
  const bookCountText = bookCount === 1 ? '1 book' : `${bookCount} books`

  return (
    <div className={cn('flex flex-col gap-1', className)}>
      {/* Title */}
      <h3 className="text-sm sm:text-base font-semibold text-zinc-100 line-clamp-2">
        {title}
      </h3>

      {/* Description - only show if provided */}
      {description && (
        <p className="text-xs text-zinc-400 line-clamp-2">
          {description}
        </p>
      )}

      {/* Book count */}
      <p className="text-xs text-zinc-500">
        {bookCountText}
      </p>
    </div>
  )
}
