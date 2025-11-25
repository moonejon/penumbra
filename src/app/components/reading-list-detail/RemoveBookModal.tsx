'use client'

import * as React from 'react'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { removeBookFromReadingList } from '@/utils/actions/reading-lists'

interface RemoveBookModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  listId: number
  bookId: number | null
  bookTitle: string | null
}

/**
 * RemoveBookModal Component
 * Confirmation modal for removing a book from a reading list
 */
export function RemoveBookModal({
  isOpen,
  onClose,
  onSuccess,
  listId,
  bookId,
  bookTitle,
}: RemoveBookModalProps) {
  const [isRemoving, setIsRemoving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleRemove = async () => {
    if (!bookId) return

    setIsRemoving(true)
    setError(null)

    try {
      const result = await removeBookFromReadingList(listId, bookId)

      if (!result.success) {
        setError(result.error || 'Failed to remove book')
        return
      }

      // Success - close modal and refresh
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Error removing book:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsRemoving(false)
    }
  }

  const handleClose = () => {
    if (!isRemoving) {
      setError(null)
      onClose()
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Remove Book from List"
      size="sm"
    >
      <div className="space-y-6">
        {/* Confirmation Message */}
        <p className="text-sm text-zinc-300">
          Are you sure you want to remove{' '}
          <span className="font-medium text-zinc-100">
            &quot;{bookTitle}&quot;
          </span>{' '}
          from this list?
        </p>

        {/* Error Message */}
        {error && (
          <div className="px-4 py-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex-1 min-h-[44px]"
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemove}
            className="flex-1 min-h-[44px]"
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export type { RemoveBookModalProps }
