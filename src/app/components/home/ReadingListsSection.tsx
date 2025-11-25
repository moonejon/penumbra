'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import type { ReadingListWithBooks } from '@/shared.types'
import { ViewModeToggle } from '@/components/ui/ViewModeToggle'
import { ReadingListsHeader } from './ReadingListsHeader'
import { ReadingListGrid } from './ReadingListGrid'
import { EmptyReadingListsState } from './EmptyReadingListsState'
import { CreateReadingListModal } from './CreateReadingListModal'
import { fetchUserReadingLists } from '@/utils/actions/reading-lists'

interface ReadingListsSectionProps {
  initialLists: ReadingListWithBooks[]
  isOwner: boolean
  className?: string
}

const STORAGE_KEY = 'penumbra-reading-lists-view-mode'

/**
 * ReadingListsSection Component
 * Main container managing reading lists state and view mode
 * Persists view mode to localStorage and composes child components
 */
export function ReadingListsSection({
  initialLists,
  isOwner,
  className,
}: ReadingListsSectionProps) {
  // State management
  const [lists, setLists] = React.useState<ReadingListWithBooks[]>(initialLists)
  const [viewMode, setViewMode] = React.useState<'list' | 'grid'>('grid')
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false)

  // Load view mode from localStorage on mount
  React.useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEY)
      if (savedMode === 'list' || savedMode === 'grid') {
        setViewMode(savedMode)
      }
    } catch (error) {
      console.error('Failed to load view mode from localStorage:', error)
    }
  }, [])

  // Save view mode to localStorage when changed
  const handleViewModeChange = React.useCallback((mode: 'list' | 'grid') => {
    setViewMode(mode)
    try {
      localStorage.setItem(STORAGE_KEY, mode)
    } catch (error) {
      console.error('Failed to save view mode to localStorage:', error)
    }
  }, [])

  // Handle create list action - open modal
  const handleCreateList = React.useCallback(() => {
    setIsCreateModalOpen(true)
  }, [])

  // Handle modal close
  const handleCloseModal = React.useCallback(() => {
    setIsCreateModalOpen(false)
  }, [])

  // Handle successful list creation - refresh lists
  const handleCreateSuccess = React.useCallback(async () => {
    try {
      const result = await fetchUserReadingLists()
      if (result.success && result.data) {
        // Cast data to ReadingListWithBooks array (it has _count property that we don't need to display)
        setLists(result.data as unknown as ReadingListWithBooks[])
      }
    } catch (error) {
      console.error('Failed to refresh reading lists:', error)
    }
  }, [])

  return (
    <>
      <section className={cn('flex flex-col gap-6', className)}>
        {/* Header with title and create button, plus view toggle */}
        <div className="flex flex-row justify-between items-center gap-3">
          <ReadingListsHeader isOwner={isOwner} onCreateList={handleCreateList} />

          {/* Only show view toggle if there are lists to view */}
          {lists.length > 0 && (
            <ViewModeToggle mode={viewMode} onChange={handleViewModeChange} />
          )}
        </div>

        {/* Conditional render: Empty state or grid */}
        {lists.length === 0 ? (
          <EmptyReadingListsState isOwner={isOwner} onCreateList={handleCreateList} />
        ) : (
          <ReadingListGrid lists={lists} viewMode={viewMode} isOwner={isOwner} />
        )}
      </section>

      {/* Create Reading List Modal */}
      {isOwner && (
        <CreateReadingListModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseModal}
          onSuccess={async () => {
            // Close modal and refresh lists
            handleCloseModal()
            await handleCreateSuccess()
          }}
        />
      )}
    </>
  )
}
