'use client'

import * as React from 'react'
import { Bookmark } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'

interface EmptyReadingListsStateProps {
  isOwner: boolean
  onCreateList: () => void
}

/**
 * EmptyReadingListsState Component
 * Displays empty state when user has no reading lists
 * Shows different content for owners vs guests
 */
export function EmptyReadingListsState({
  isOwner,
  onCreateList,
}: EmptyReadingListsStateProps) {
  // Owner view: Encourage creating first reading list
  if (isOwner) {
    return (
      <EmptyState
        icon={<Bookmark size={48} aria-hidden="true" />}
        title="Create your first reading list"
        description="Organize your books into curated lists"
        action={{
          label: 'Create Reading List',
          onClick: onCreateList,
        }}
      />
    )
  }

  // Guest view: Simple message with no action
  return (
    <EmptyState
      icon={<Bookmark size={48} aria-hidden="true" />}
      title="No reading lists yet"
      description="Check back later"
    />
  )
}
