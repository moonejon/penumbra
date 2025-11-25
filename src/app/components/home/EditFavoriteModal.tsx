'use client'

import * as React from 'react'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { BookCoverCard } from '@/components/ui/BookCoverCard'
import { setFavorite, removeFavorite } from '@/utils/actions/reading-lists'
import type { FavoriteBook } from '@/shared.types'
import { cn } from '@/lib/utils'

export interface EditFavoriteModalProps {
  isOpen: boolean
  onClose: () => void
  favorite: FavoriteBook
  year: 'all-time' | number
  onSuccess: () => void
}

export const EditFavoriteModal = React.forwardRef<
  HTMLDivElement,
  EditFavoriteModalProps
>(({ isOpen, onClose, favorite, year, onSuccess }, ref) => {
  // State management
  const [newPosition, setNewPosition] = React.useState<number | null>(null)
  const [isChangingPosition, setIsChangingPosition] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)
  const [showRemoveConfirm, setShowRemoveConfirm] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setNewPosition(null)
      setShowRemoveConfirm(false)
      setError(null)
    }
  }, [isOpen])

  // Handle position change
  const handleChangePosition = async () => {
    if (!newPosition) return

    setIsChangingPosition(true)
    setError(null)

    try {
      const yearParam = year === 'all-time' ? undefined : year.toString()
      const result = await setFavorite(favorite.book.id, newPosition, yearParam)

      if (!result.success) {
        setError(result.error || 'Failed to change position')
        return
      }

      // Success - call onSuccess and close modal
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Error changing position:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsChangingPosition(false)
    }
  }

  // Handle remove favorite
  const handleRemoveFavorite = async () => {
    setIsRemoving(true)
    setError(null)

    try {
      const yearParam = year === 'all-time' ? undefined : year.toString()
      const result = await removeFavorite(favorite.book.id, yearParam)

      if (!result.success) {
        setError(result.error || 'Failed to remove favorite')
        return
      }

      // Success - call onSuccess and close modal
      onSuccess()
      handleClose()
    } catch (err) {
      console.error('Error removing favorite:', err)
      setError('An unexpected error occurred')
    } finally {
      setIsRemoving(false)
      setShowRemoveConfirm(false)
    }
  }

  // Handle modal close
  const handleClose = () => {
    setNewPosition(null)
    setShowRemoveConfirm(false)
    setError(null)
    onClose()
  }

  // Generate available positions (1-6, excluding current)
  const availablePositions = [1, 2, 3, 4, 5, 6].filter(
    (pos) => pos !== favorite.position
  )

  // Confirmation Dialog Component
  const ConfirmationDialog = () => (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={() => setShowRemoveConfirm(false)}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div className="relative bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-zinc-100 mb-2">
          Remove Favorite
        </h3>
        <p className="text-zinc-400 mb-6">
          Are you sure you want to remove this book from your favorites?
        </p>

        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowRemoveConfirm(false)}
            className="flex-1 min-h-[44px]"
            disabled={isRemoving}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleRemoveFavorite}
            className="flex-1 min-h-[44px]"
            disabled={isRemoving}
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Edit Favorite"
        size="md"
      >
        <div ref={ref} className="flex flex-col gap-6">
          {/* Book Preview */}
          <div className="flex flex-col items-center">
            <BookCoverCard book={favorite.book} size="lg" />
            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-zinc-100">
                {favorite.book.title}
              </h3>
              <p className="text-sm text-zinc-400 mt-1">
                {favorite.book.authors.join(', ')}
              </p>
              <div className="mt-3 inline-block px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full">
                <span className="text-xs text-zinc-300">
                  Currently in position #{favorite.position}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="px-4 py-3 bg-red-900/20 border border-red-800 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Change Position Section */}
          <div className="space-y-3">
            <label
              htmlFor="position-select"
              className="block text-sm font-medium text-zinc-300"
            >
              Move to position
            </label>
            <select
              id="position-select"
              value={newPosition || ''}
              onChange={(e) =>
                setNewPosition(
                  e.target.value ? parseInt(e.target.value, 10) : null
                )
              }
              className={cn(
                'w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg',
                'text-base sm:text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-[44px]'
              )}
              disabled={isChangingPosition || isRemoving}
              aria-label="Select new position"
            >
              <option value="">Select a position...</option>
              {availablePositions.map((pos) => (
                <option key={pos} value={pos}>
                  Position #{pos}
                </option>
              ))}
            </select>

            {newPosition && (
              <Button
                variant="default"
                onClick={handleChangePosition}
                disabled={isChangingPosition || isRemoving}
                className="w-full min-h-[44px]"
              >
                {isChangingPosition ? 'Moving...' : `Move to Position #${newPosition}`}
              </Button>
            )}
          </div>

          {/* Remove from Favorites Section */}
          <div className="pt-4 border-t border-zinc-800">
            <Button
              variant="destructive"
              onClick={() => setShowRemoveConfirm(true)}
              disabled={isChangingPosition || isRemoving}
              className="w-full min-h-[44px]"
            >
              Remove from Favorites
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirmation Dialog */}
      {showRemoveConfirm && <ConfirmationDialog />}
    </>
  )
})

EditFavoriteModal.displayName = 'EditFavoriteModal'
