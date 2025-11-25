'use client'

import * as React from 'react'
import { AlertCircle, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import {
  updateBookNotesInList,
  removeBookFromReadingList,
} from '@/utils/actions/reading-lists'
import type { BookInReadingListEntry } from '@/shared.types'
import Image from 'next/image'

interface BookDetailModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  listId: number
  entry: BookInReadingListEntry | null
  isOwner: boolean
}

const MAX_NOTES_LENGTH = 2000

/**
 * BookDetailModal Component
 * Shows full book details with notes editor
 * Allows updating notes and removing book from list
 */
export function BookDetailModal({
  isOpen,
  onClose,
  onSuccess,
  listId,
  entry,
  isOwner,
}: BookDetailModalProps) {
  const [notes, setNotes] = React.useState('')
  const [isSaving, setIsSaving] = React.useState(false)
  const [isRemoving, setIsRemoving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = React.useState(false)

  // Initialize notes when entry changes
  React.useEffect(() => {
    if (entry) {
      setNotes(entry.notes || '')
      setHasUnsavedChanges(false)
      setError(null)
    }
  }, [entry])

  /**
   * Handle notes change
   */
  const handleNotesChange = (value: string) => {
    setNotes(value)
    setHasUnsavedChanges(value !== (entry?.notes || ''))
  }

  /**
   * Save notes
   */
  const handleSaveNotes = async () => {
    if (!entry) return

    setIsSaving(true)
    setError(null)

    try {
      const result = await updateBookNotesInList(listId, entry.book.id, notes)

      if (result.success) {
        setHasUnsavedChanges(false)
        onSuccess()
      } else {
        setError(result.error || 'Failed to save notes')
      }
    } catch (err) {
      console.error('Error saving notes:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  /**
   * Remove book from list
   */
  const handleRemoveBook = async () => {
    if (!entry) return

    // Confirm removal
    if (
      !window.confirm(
        `Are you sure you want to remove "${entry.book.title}" from this list?`
      )
    ) {
      return
    }

    setIsRemoving(true)
    setError(null)

    try {
      const result = await removeBookFromReadingList(listId, entry.book.id)

      if (result.success) {
        onSuccess()
        onClose()
      } else {
        setError(result.error || 'Failed to remove book')
      }
    } catch (err) {
      console.error('Error removing book:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsRemoving(false)
    }
  }

  if (!entry) return null

  const { book } = entry

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Book Details"
      size="lg"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Book Info Section */}
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Book Cover */}
          <div className="flex-shrink-0">
            <div className="relative w-32 aspect-[2/3] bg-zinc-800 rounded-lg overflow-hidden">
              <Image
                src={book.image || '/placeholder-book.png'}
                alt={`Cover of ${book.title}`}
                fill
                sizes="128px"
                className="object-cover"
                priority
              />
            </div>
          </div>

          {/* Book Metadata */}
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-zinc-100 mb-2">
              {book.title}
            </h3>

            {book.authors && book.authors.length > 0 && (
              <p className="text-sm text-zinc-400 mb-3">
                by {book.authors.join(', ')}
              </p>
            )}

            {book.synopsis && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-zinc-300 mb-2">
                  Synopsis
                </h4>
                <p className="text-sm text-zinc-400 line-clamp-4">
                  {book.synopsis}
                </p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-zinc-500">
              {book.publisher && (
                <div>
                  <span className="font-medium">Publisher:</span> {book.publisher}
                </div>
              )}
              {book.pageCount > 0 && (
                <div>
                  <span className="font-medium">Pages:</span> {book.pageCount}
                </div>
              )}
              {book.datePublished && (
                <div>
                  <span className="font-medium">Published:</span>{' '}
                  {book.datePublished}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Notes Section - Only visible to owner */}
        {isOwner && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="notes" className="text-sm font-medium text-zinc-300">
              Notes
              <span className="text-zinc-500 font-normal ml-2">(Optional)</span>
            </label>
            <textarea
              id="notes"
              placeholder="Add your thoughts, quotes, or reminders about this book..."
              value={notes}
              onChange={(e) => handleNotesChange(e.target.value)}
              disabled={isSaving || isRemoving}
              rows={6}
              maxLength={MAX_NOTES_LENGTH}
              inputMode="text"
              autoComplete="off"
              className={cn(
                'px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg',
                'text-base sm:text-sm text-zinc-100',
                'placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'resize-vertical transition-colors'
              )}
            />
            {/* Character Count */}
            <div className="flex items-center justify-between">
              <p className="text-xs text-zinc-500">
                {notes.length}/{MAX_NOTES_LENGTH}
              </p>
              {hasUnsavedChanges && (
                <p className="text-xs text-yellow-500">Unsaved changes</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-800">
          {/* Remove from List Button - Only for owner */}
          {isOwner && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemoveBook}
              disabled={isSaving || isRemoving}
              className="gap-2 sm:w-auto min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              {isRemoving ? 'Removing...' : 'Remove from List'}
            </Button>
          )}

          <div className="flex-1" />

          {/* Close Button */}
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSaving || isRemoving}
            className="sm:w-auto min-h-[44px]"
          >
            Close
          </Button>

          {/* Save Notes Button - Only for owner */}
          {isOwner && (
            <Button
              type="button"
              variant="default"
              onClick={handleSaveNotes}
              disabled={!hasUnsavedChanges || isSaving || isRemoving}
              className="sm:w-auto min-h-[44px]"
            >
              {isSaving ? 'Saving...' : 'Save Notes'}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}

export type { BookDetailModalProps }
