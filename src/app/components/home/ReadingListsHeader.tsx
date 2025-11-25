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
    <div className={cn('flex items-center gap-3', className)}>
      {/* Section Title */}
      <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">
        Reading Lists
      </h2>

      {/* Create Button - Owner only */}
      {isOwner && (
        <Button
          onClick={onCreateList}
          variant="default"
          size="sm"
          className="gap-1.5 text-sm"
          aria-label="Create new reading list"
        >
          <Plus size={16} aria-hidden="true" />
          <span className="hidden sm:inline">Create List</span>
          <span className="sm:hidden">Create</span>
        </Button>
      )}
    </div>
  )
}
