'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ReadingListsHeaderProps {
  isOwner: boolean
  onCreateList: () => void
  className?: string
}

/**
 * ReadingListsHeader Component
 * Header for the reading lists section with title and create button
 * Create button only visible to owners
 */
export function ReadingListsHeader({
  isOwner,
  onCreateList,
  className,
}: ReadingListsHeaderProps) {
  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4',
        className
      )}
    >
      {/* Section Title */}
      <h2 className="text-3xl font-bold text-zinc-100">
        Reading Lists
      </h2>

      {/* Create Button - Owner only */}
      {isOwner && (
        <Button
          onClick={onCreateList}
          variant="default"
          className="gap-2"
          aria-label="Create new reading list"
        >
          <Plus size={20} aria-hidden="true" />
          Create List
        </Button>
      )}
    </div>
  )
}
