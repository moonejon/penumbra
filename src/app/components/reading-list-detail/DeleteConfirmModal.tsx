'use client'

import * as React from 'react'
import { AlertCircle, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { deleteReadingList } from '@/utils/actions/reading-lists'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  listId: number
  listTitle: string
}

/**
 * DeleteConfirmModal Component
 * Confirmation dialog for deleting a reading list
 * Shows warning message and confirm/cancel buttons
 * Redirects to home page on successful deletion
 */
export function DeleteConfirmModal({
  isOpen,
  onClose,
  listId,
  listTitle,
}: DeleteConfirmModalProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setError(null)
    }
  }, [isOpen])

  /**
   * Handle delete confirmation
   */
  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const result = await deleteReadingList(listId)

      if (result.success) {
        // Redirect to home page
        router.push('/')
        router.refresh()
      } else {
        setError(result.error || 'Failed to delete reading list')
      }
    } catch (err) {
      console.error('Error deleting reading list:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Reading List"
      size="sm"
      showCloseButton={true}
    >
      <div className="space-y-6">
        {/* Warning Icon and Message */}
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-400" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-zinc-100 mb-2">
              Are you sure?
            </h3>
            <p className="text-sm text-zinc-400">
              You are about to delete{' '}
              <span className="font-medium text-zinc-300">&quot;{listTitle}&quot;</span>.
              This action cannot be undone.
            </p>
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

        {/* Buttons */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex-1 min-h-[44px]"
          >
            {isDeleting ? 'Deleting...' : 'Delete List'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export type { DeleteConfirmModalProps }
