'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import type {
  ReadingListWithBooks,
  BookInReadingListEntry,
} from '@/shared.types'
import { reorderBooksInList } from '@/utils/actions/reading-lists'
import { ReadingListHeader } from './ReadingListHeader'
import { BookGrid } from './BookGrid'
import { EditListModal } from './EditListModal'
import { DeleteConfirmModal } from './DeleteConfirmModal'
import { AddBooksModal } from './AddBooksModal'
import { BookDetailModal } from './BookDetailModal'
import { RemoveBookModal } from './RemoveBookModal'

interface ReadingListDetailScreenProps {
  list: ReadingListWithBooks
  isOwner: boolean
}

/**
 * ReadingListDetailScreen Component
 * Main container for reading list detail page
 * Manages all modals and state for the reading list
 */
export function ReadingListDetailScreen({
  list: initialList,
  isOwner,
}: ReadingListDetailScreenProps) {
  const router = useRouter()

  // Local state for optimistic updates
  const [list, setList] = React.useState(initialList)

  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)
  const [isAddBooksModalOpen, setIsAddBooksModalOpen] = React.useState(false)
  const [isBookDetailModalOpen, setIsBookDetailModalOpen] = React.useState(false)
  const [isRemoveBookModalOpen, setIsRemoveBookModalOpen] = React.useState(false)
  const [selectedEntry, setSelectedEntry] =
    React.useState<BookInReadingListEntry | null>(null)
  const [bookToRemove, setBookToRemove] = React.useState<{
    id: number
    title: string
  } | null>(null)

  // Reordering state
  const [isReordering, setIsReordering] = React.useState(false)

  /**
   * Refresh data from server
   */
  const handleRefresh = React.useCallback(() => {
    router.refresh()
  }, [router])

  /**
   * Handle book reordering
   * Uses optimistic updates with proper error recovery
   */
  const handleReorder = async (newOrder: BookInReadingListEntry[]) => {
    // Optimistically update UI
    setList((prev) => ({
      ...prev,
      books: newOrder,
    }))

    setIsReordering(true)

    try {
      const bookIds = newOrder.map((entry) => entry.book.id)
      const result = await reorderBooksInList(list.id, bookIds)

      if (!result.success) {
        console.error('Failed to reorder books:', result.error)
        // Fetch fresh data from server instead of using stale initialList
        await fetchFreshListData()
      } else {
        // Success: refresh to sync with server state
        handleRefresh()
      }
    } catch (error) {
      console.error('Error reordering books:', error)
      // On network/unexpected errors, fetch fresh data from server
      await fetchFreshListData()
    } finally {
      setIsReordering(false)
    }
  }

  /**
   * Fetch fresh list data from server (error recovery)
   * Used when optimistic updates fail to ensure we have the latest server state
   */
  const fetchFreshListData = async () => {
    try {
      const { fetchReadingList } = await import('@/utils/actions/reading-lists')
      const result = await fetchReadingList(list.id)

      if (result.success && result.data) {
        // Update state with fresh server data
        setList(result.data)
      } else {
        console.error('Failed to fetch fresh list data:', result.error)
        // If we can't fetch fresh data, trigger a router refresh as fallback
        handleRefresh()
      }
    } catch (error) {
      console.error('Error fetching fresh list data:', error)
      // Last resort: trigger router refresh
      handleRefresh()
    }
  }

  /**
   * Handle opening book detail modal
   */
  const handleViewBookDetails = (entry: BookInReadingListEntry) => {
    setSelectedEntry(entry)
    setIsBookDetailModalOpen(true)
  }

  /**
   * Handle removing a book (quick remove from grid)
   */
  const handleRemoveBook = (bookId: number) => {
    // Find the book to remove
    const book = list.books.find((entry) => entry.book.id === bookId)
    if (!book) return

    // Open confirmation modal
    setBookToRemove({
      id: bookId,
      title: book.book.title,
    })
    setIsRemoveBookModalOpen(true)
  }

  /**
   * Handle successful book removal
   */
  const handleRemoveSuccess = () => {
    // Close modal and refresh
    setIsRemoveBookModalOpen(false)
    setBookToRemove(null)
    handleRefresh()
  }

  /**
   * Update list when initialList changes (from server refresh)
   */
  React.useEffect(() => {
    setList(initialList)
  }, [initialList])

  // Get existing book IDs for AddBooksModal
  const existingBookIds = list.books.map((entry) => entry.book.id)

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <ReadingListHeader
          list={list}
          isOwner={isOwner}
          onEdit={() => setIsEditModalOpen(true)}
          onDelete={() => setIsDeleteModalOpen(true)}
          onAddBooks={() => setIsAddBooksModalOpen(true)}
          className="mb-8"
        />

        {/* Books Grid Section */}
        <BookGrid
          books={list.books}
          onReorder={handleReorder}
          onRemoveBook={handleRemoveBook}
          onViewBookDetails={handleViewBookDetails}
          isReordering={isReordering}
          isOwner={isOwner}
        />

        {/* Modals */}
        {isOwner && (
          <>
            {/* Edit List Modal */}
            <EditListModal
              isOpen={isEditModalOpen}
              onClose={() => setIsEditModalOpen(false)}
              onSuccess={handleRefresh}
              listId={list.id}
              initialData={{
                title: list.title,
                description: list.description ?? null,
                visibility: list.visibility,
                coverImage: list.coverImage ?? null,
              }}
            />

            {/* Delete Confirmation Modal */}
            <DeleteConfirmModal
              isOpen={isDeleteModalOpen}
              onClose={() => setIsDeleteModalOpen(false)}
              listId={list.id}
              listTitle={list.title}
            />

            {/* Add Books Modal */}
            <AddBooksModal
              isOpen={isAddBooksModalOpen}
              onClose={() => setIsAddBooksModalOpen(false)}
              onSuccess={handleRefresh}
              listId={list.id}
              existingBookIds={existingBookIds}
            />
          </>
        )}

        {/* Book Detail Modal */}
        <BookDetailModal
          isOpen={isBookDetailModalOpen}
          onClose={() => {
            setIsBookDetailModalOpen(false)
            setSelectedEntry(null)
          }}
          onSuccess={handleRefresh}
          listId={list.id}
          entry={selectedEntry}
          isOwner={isOwner}
        />

        {/* Remove Book Confirmation Modal */}
        {isOwner && (
          <RemoveBookModal
            isOpen={isRemoveBookModalOpen}
            onClose={() => {
              setIsRemoveBookModalOpen(false)
              setBookToRemove(null)
            }}
            onSuccess={handleRemoveSuccess}
            listId={list.id}
            bookId={bookToRemove?.id || null}
            bookTitle={bookToRemove?.title || null}
          />
        )}
      </div>
    </div>
  )
}

export type { ReadingListDetailScreenProps }
