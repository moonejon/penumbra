'use client'

import * as React from 'react'
import Image from 'next/image'
import { AlertCircle, Upload, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { updateReadingList, uploadReadingListCover } from '@/utils/actions/reading-lists'
import type { ReadingListVisibilityEnum } from '@/shared.types'

interface EditListModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  listId: number
  initialData: {
    title: string
    description: string | null
    visibility: ReadingListVisibilityEnum
    coverImage: string | null
  }
}

interface FormData {
  title: string
  description: string
  visibility: ReadingListVisibilityEnum
}

interface FormErrors {
  title?: string
  description?: string
  image?: string
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
    description: 'Anyone can see and access this list',
  },
  {
    value: 'PRIVATE',
    label: 'Private',
    description: 'Only you can see this list',
  },
  {
    value: 'UNLISTED',
    label: 'Unlisted',
    description: 'Only people with the link can access this list',
  },
]

/**
 * EditListModal Component
 * Modal form for editing an existing reading list
 * Allows updating title, description, visibility, and cover image
 * Supports image upload with preview and validation (JPG, PNG, WebP, max 5MB)
 */
export function EditListModal({
  isOpen,
  onClose,
  onSuccess,
  listId,
  initialData,
}: EditListModalProps) {
  // Form state
  const [formData, setFormData] = React.useState<FormData>({
    title: initialData.title,
    description: initialData.description || '',
    visibility: initialData.visibility,
  })

  const [errors, setErrors] = React.useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Image upload state
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [removeImage, setRemoveImage] = React.useState(false)
  const [showImageUpload, setShowImageUpload] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset form when modal opens with new data
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        title: initialData.title,
        description: initialData.description || '',
        visibility: initialData.visibility,
      })
      setErrors({})
      setImageFile(null)
      setImagePreview(null)
      setRemoveImage(false)
      setShowImageUpload(false)
    }
  }, [isOpen, initialData])

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Title validation
    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = 'List title is required'
    } else if (formData.title.length > 200) {
      newErrors.title = 'Title must be 200 characters or less'
    }

    // Description validation (optional but has length limit)
    if (formData.description && formData.description.length > 2000) {
      newErrors.description = 'Description must be 2000 characters or less'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * Validate file before upload
   */
  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or WebP.'
    }

    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return `File too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Maximum size is 5MB.`
    }

    return null
  }

  /**
   * Handle file selection
   */
  const handleFileSelect = (file: File) => {
    setErrors({ ...errors, image: undefined })

    const validationError = validateFile(file)
    if (validationError) {
      setErrors({ ...errors, image: validationError })
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    setImageFile(file)
    setRemoveImage(false)
  }

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  /**
   * Handle remove image
   */
  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview(null)
    setRemoveImage(true)
    setShowImageUpload(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Handle cancel image selection
   */
  const handleCancelImageSelection = () => {
    setImageFile(null)
    setImagePreview(null)
    setShowImageUpload(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  /**
   * Get current cover image for display
   */
  const getCurrentImage = () => {
    if (imagePreview) return imagePreview
    if (removeImage) return null
    return initialData.coverImage || null
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
      // 1. Upload cover image if changed
      if (imageFile) {
        const imageFormData = new FormData()
        imageFormData.append('file', imageFile)
        imageFormData.append('listId', listId.toString())
        const imageResult = await uploadReadingListCover(imageFormData)
        if (!imageResult.success) {
          throw new Error(imageResult.error || 'Failed to upload cover image')
        }
      }

      // 2. Update reading list metadata
      const updateData: {
        title?: string
        description?: string
        visibility?: ReadingListVisibilityEnum
        coverImage?: string
      } = {}

      // Always include changed fields
      if (formData.title !== initialData.title) {
        updateData.title = formData.title
      }
      if (formData.description !== (initialData.description || '')) {
        updateData.description = formData.description || undefined
      }
      if (formData.visibility !== initialData.visibility) {
        updateData.visibility = formData.visibility
      }

      // Handle image removal
      if (removeImage && initialData.coverImage) {
        updateData.coverImage = ''
      }

      // Only call update if there are changes to metadata (excluding image upload)
      if (Object.keys(updateData).length > 0) {
        const result = await updateReadingList(listId, updateData)

        if (!result.success) {
          throw new Error(result.error || 'Failed to update reading list')
        }
      }

      // Success
      onSuccess()
      onClose()
    } catch (error) {
      console.error('Error updating reading list:', error)
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : 'An unexpected error occurred. Please try again.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Handle input changes
   */
  const handleInputChange = (
    field: keyof Omit<FormData, 'visibility'>,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    // Clear field error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }))
    }
  }

  const handleVisibilityChange = (value: ReadingListVisibilityEnum) => {
    setFormData((prev) => ({
      ...prev,
      visibility: value,
    }))
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Reading List"
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

        {/* Cover Image Section */}
        <div className="flex flex-col gap-4">
          <label className="text-sm font-medium text-zinc-300">
            Cover Image
          </label>

          {/* Current/Preview Image */}
          <div className="relative w-full aspect-[16/9] max-w-md mx-auto rounded-lg overflow-hidden border-2 border-zinc-700 bg-zinc-800">
            {getCurrentImage() ? (
              <Image
                src={getCurrentImage()!}
                alt="Reading list cover preview"
                fill
                sizes="(max-width: 768px) 100vw, 448px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                <span className="text-sm text-zinc-400">No cover image</span>
              </div>
            )}
          </div>

          {/* Image Action Buttons */}
          {!showImageUpload && (
            <div className="flex justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageUpload(true)}
                className="min-h-[44px]"
              >
                <Upload className="w-4 h-4 mr-2" />
                {getCurrentImage() ? 'Change Image' : 'Upload Image'}
              </Button>
              {getCurrentImage() && !removeImage && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="text-red-400 hover:text-red-300 min-h-[44px]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
          )}

          {/* Image Upload Interface */}
          {showImageUpload && (
            <div className="w-full space-y-3">
              {/* File Input Button */}
              <div className="flex justify-center">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSubmitting}
                  className="min-h-[44px]"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Select Image
                </Button>
              </div>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleFileInputChange}
                className="hidden"
              />

              {/* File Info */}
              <p className="text-xs text-zinc-500 text-center">
                JPG, PNG, or WebP (max 5MB)
              </p>

              {/* Preview Actions */}
              {imagePreview && (
                <div className="flex justify-center gap-3">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleCancelImageSelection}
                    className="min-h-[44px]"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Cancel if no selection yet */}
              {!imagePreview && (
                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowImageUpload(false)}
                    className="min-h-[44px]"
                  >
                    Cancel
                  </Button>
                </div>
              )}

              {/* Image Error */}
              {errors.image && (
                <p className="text-xs text-red-400 flex items-center justify-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.image}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Title Field */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="title" className="text-sm font-medium text-zinc-300">
            List Title
            <span className="text-red-400 ml-1">*</span>
          </label>
          <input
            type="text"
            id="title"
            placeholder="e.g., Summer Reading 2024"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            disabled={isSubmitting}
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'title-error' : undefined}
            maxLength={200}
            inputMode="text"
            autoComplete="off"
            autoCapitalize="words"
            className={cn(
              'px-3 py-2 bg-zinc-900 border rounded-lg',
              'text-base sm:text-sm text-zinc-100',
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
            {formData.title.length}/200
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
            aria-describedby={
              errors.description ? 'description-error' : undefined
            }
            rows={4}
            maxLength={2000}
            inputMode="text"
            autoComplete="off"
            className={cn(
              'px-3 py-2 bg-zinc-900 border rounded-lg',
              'text-base sm:text-sm text-zinc-100',
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
            {formData.description.length}/2000
          </p>
        </div>

        {/* Visibility Field */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">
            Visibility
            <span className="text-red-400 ml-1">*</span>
          </label>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map((option) => (
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
            className="flex-1 min-h-[44px]"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="default"
            disabled={isSubmitting || !formData.title.trim()}
            className="flex-1 min-h-[44px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export type { EditListModalProps }
