'use client'

import * as React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { createReadingList } from '@/utils/actions/reading-lists'
import type { ReadingListVisibilityEnum } from '@/shared.types'

interface CreateReadingListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (listId: number) => void
}

interface FormData {
  title: string
  description: string
  visibility: ReadingListVisibilityEnum
}

interface FormErrors {
  title?: string
  description?: string
  general?: string
}

const VISIBILITY_OPTIONS: Array<{
  value: ReadingListVisibilityEnum
  label: string
  description: string
}> = [
  {
    value: 'PUBLIC',
    label: 'Public',
    description: 'Anyone can see and access this list'
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Only you can see this list'
  },
  {
    value: 'UNLISTED',
    label: 'Unlisted',
    description: 'Only people with the link can access this list'
  }
]

/**
 * CreateReadingListModal Component
 * Modal form for creating a new reading list
 * Includes title and description inputs with validation
 * Visibility dropdown to control list access
 */
export function CreateReadingListModal({
  isOpen,
  onClose,
  onSuccess
}: CreateReadingListModalProps) {
  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    title: '',
    description: '',
    visibility: 'PUBLIC'
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const titleInputRef = React.useRef<HTMLInputElement>(null)

  // Reset form when modal closes
  React.useEffect(() => {
    if (!isOpen) {
      setFormData({
        title: '',
        description: '',
        visibility: 'PUBLIC'
      })
      setErrors({})
    }
  }, [isOpen])

  /**
   * Validate form data
   * Returns true if valid, false otherwise
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = 'List title is required'
    } else if (formData.title.length > 100) {
      newErrors.title = 'Title must be 100 characters or less'
    }

    // Description validation (optional but has length limit)
    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setErrors({})

    try {
      const result = await createReadingList(
        formData.title,
        formData.description || undefined,
        formData.visibility,
        'STANDARD'
      )

      if (result.success && result.data) {
        // Success - call callback and close modal
        onSuccess(result.data.id)
        onClose()
      } else {
        // Handle error from server action
        setErrors({
          general: result.error || 'Failed to create reading list'
        })
      }
    } catch (error) {
      console.error('Error creating reading list:', error)
      setErrors({
        general: 'An unexpected error occurred. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof Omit<FormData, 'visibility'>, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  const handleVisibilityChange = (value: ReadingListVisibilityEnum) => {
    setFormData(prev => ({
      ...prev,
      visibility: value
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Reading List"
      size="md"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error Message */}
        {errors.general && (
          <div
            className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-3"
            role="alert"
          >
            <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-400">{errors.general}</p>
          </div>
        )}

        {/* Title Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="title"
            className="text-sm font-medium text-zinc-300"
          >
            List Title
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            ref={titleInputRef}
            type="text"
            id="title"
            placeholder="e.g., Summer Reading 2024"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            maxLength={100}
            className={cn(
              'px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100',
              'placeholder:text-zinc-600',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-zinc-800 focus:ring-zinc-600'
            )}
          />
          {/* Title Error */}
          {errors.title && (
            <p
              id="title-error"
              className="text-xs text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.title}
            </p>
          )}
          {/* Character Count */}
          <p className="text-xs text-zinc-500 text-right">
            {formData.title.length}/100
          </p>
        </div>

        {/* Description Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="description"
            className="text-sm font-medium text-zinc-300"
          >
            Description
          </label>
          <textarea
            id="description"
            placeholder="What's this list about?"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.description}
            aria-describedby={errors.description ? 'description-error' : undefined}
            rows={3}
            maxLength={500}
            className={cn(
              'px-3 py-2 bg-zinc-900 border rounded-lg text-zinc-100',
              'placeholder:text-zinc-600',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'resize-vertical transition-colors',
              errors.description
                ? 'border-red-500 focus:ring-red-500'
                : 'border-zinc-800 focus:ring-zinc-600'
            )}
          />
          {/* Description Error */}
          {errors.description && (
            <p
              id="description-error"
              className="text-xs text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.description}
            </p>
          )}
          {/* Character Count */}
          <p className="text-xs text-zinc-500 text-right">
            {formData.description.length}/500
          </p>
        </div>

        {/* Visibility Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            Visibility
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map(option => (
              <label
                key={option.value}
                className="flex items-start gap-3 p-3 bg-zinc-900 border border-zinc-800 rounded-lg cursor-pointer hover:bg-zinc-800/50 transition-colors"
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={formData.visibility === option.value}
                  onChange={() => handleVisibilityChange(option.value)}
                  disabled={isSubmitting}
                  className="mt-1 accent-blue-500"
                  aria-label={option.label}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-zinc-100">
                    {option.label}
                  </p>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {option.description}
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-4 border-t border-zinc-800">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting || !formData.title.trim()}
            className="flex-1"
          >
            {isSubmitting ? 'Creating...' : 'Create List'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export type { CreateReadingListModalProps }
