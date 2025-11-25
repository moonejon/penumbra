'use client'

import * as React from 'react'
import Image from 'next/image'
import { AlertCircle, Upload, Loader2, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import Modal from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { uploadProfileImage, updateUserProfile, updateSocialMediaLinks } from '@/utils/actions/profile'
import type { UserProfile } from '@/shared.types'

interface EditProfileModalProps {
  isOpen: boolean
  onClose: () => void
  profile: UserProfile
  onSuccess: () => void
}

interface FormErrors {
  name?: string
  bio?: string
  image?: string
  githubUrl?: string
  instagramUrl?: string
  linkedinUrl?: string
  letterboxdUrl?: string
  spotifyUrl?: string
  general?: string
}

/**
 * EditProfileModal Component
 * Modal form for editing user profile information including image, name, and bio
 * Handles image upload with preview and validation
 */
export function EditProfileModal({
  isOpen,
  onClose,
  profile,
  onSuccess
}: EditProfileModalProps) {
  // Form state
  const [name, setName] = React.useState(profile.name || '')
  const [bio, setBio] = React.useState(profile.bio || '')
  const [githubUrl, setGithubUrl] = React.useState(profile.githubUrl || '')
  const [instagramUrl, setInstagramUrl] = React.useState(profile.instagramUrl || '')
  const [linkedinUrl, setLinkedinUrl] = React.useState(profile.linkedinUrl || '')
  const [letterboxdUrl, setLetterboxdUrl] = React.useState(profile.letterboxdUrl || '')
  const [spotifyUrl, setSpotifyUrl] = React.useState(profile.spotifyUrl || '')
  const [imageFile, setImageFile] = React.useState<File | null>(null)
  const [imagePreview, setImagePreview] = React.useState<string | null>(null)
  const [removeImage, setRemoveImage] = React.useState(false)

  // UI state
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [errors, setErrors] = React.useState<FormErrors>({})
  const [showImageUpload, setShowImageUpload] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Reset form when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setName(profile.name || '')
      setBio(profile.bio || '')
      setGithubUrl(profile.githubUrl || '')
      setInstagramUrl(profile.instagramUrl || '')
      setLinkedinUrl(profile.linkedinUrl || '')
      setLetterboxdUrl(profile.letterboxdUrl || '')
      setSpotifyUrl(profile.spotifyUrl || '')
      setImageFile(null)
      setImagePreview(null)
      setRemoveImage(false)
      setShowImageUpload(false)
      setErrors({})
    }
  }, [isOpen, profile])

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
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Name validation
    if (name.trim().length > 100) {
      newErrors.name = 'Name must be 100 characters or less'
    }

    // Bio validation
    if (bio.length > 500) {
      newErrors.bio = 'Bio must be 500 characters or less'
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
      // 1. Upload image if changed
      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)
        const result = await uploadProfileImage(formData)
        if (!result.success) {
          throw new Error(result.error || 'Failed to upload image')
        }
      }

      // 2. Update name if changed
      if (name !== profile.name) {
        const result = await updateUserProfile(name)
        if (!result.success) {
          throw new Error(result.error || 'Failed to update name')
        }
      }

      // 3. Update bio if changed
      if (bio !== profile.bio) {
        // TODO: Call updateUserBio when migration is complete
        console.log('Update bio:', bio)
        // const result = await updateUserBio(bio)
        // Currently disabled until bio field migration is run
      }

      // 4. Update social media links if changed
      if (
        githubUrl !== (profile.githubUrl || '') ||
        instagramUrl !== (profile.instagramUrl || '') ||
        linkedinUrl !== (profile.linkedinUrl || '') ||
        letterboxdUrl !== (profile.letterboxdUrl || '') ||
        spotifyUrl !== (profile.spotifyUrl || '')
      ) {
        const result = await updateSocialMediaLinks({
          githubUrl,
          instagramUrl,
          linkedinUrl,
          letterboxdUrl,
          spotifyUrl,
        })
        if (!result.success) {
          throw new Error(result.error || 'Failed to update social media links')
        }
      }

      // 5. Handle image removal
      if (removeImage && profile.profileImageUrl) {
        // TODO: Implement removeProfileImage server action if needed
        console.log('Remove profile image')
      }

      // Success
      onSuccess()
      onClose()
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : 'Failed to update profile'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /**
   * Get current profile image for display
   */
  const getCurrentImage = () => {
    if (imagePreview) return imagePreview
    if (removeImage) return null
    return profile.profileImageUrl || null
  }

  const currentImage = getCurrentImage()
  const firstLetter = profile.name
    ? profile.name.charAt(0).toUpperCase()
    : profile.email.charAt(0).toUpperCase()

  const hasChanges =
    name !== (profile.name || '') ||
    bio !== (profile.bio || '') ||
    githubUrl !== (profile.githubUrl || '') ||
    instagramUrl !== (profile.instagramUrl || '') ||
    linkedinUrl !== (profile.linkedinUrl || '') ||
    letterboxdUrl !== (profile.letterboxdUrl || '') ||
    spotifyUrl !== (profile.spotifyUrl || '') ||
    imageFile !== null ||
    removeImage

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      size="lg"
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

        {/* Profile Image Section */}
        <div className="flex flex-col items-center gap-4 py-4">
          {/* Current/Preview Image */}
          <div className="relative w-[120px] h-[120px] rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800">
            {currentImage ? (
              <Image
                src={currentImage}
                alt="Profile preview"
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-zinc-700">
                <span className="text-4xl font-bold text-zinc-100">
                  {firstLetter}
                </span>
              </div>
            )}
          </div>

          {/* Image Action Buttons */}
          {!showImageUpload && (
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowImageUpload(true)}
                className="min-h-[44px]"
              >
                <Upload className="w-4 h-4 mr-2" />
                Change Image
              </Button>
              {(currentImage || profile.profileImageUrl) && !removeImage && (
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

        {/* Name Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="text-sm font-medium text-zinc-300"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            placeholder="Your name"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (errors.name) {
                setErrors({ ...errors, name: undefined })
              }
            }}
            disabled={isSubmitting}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            maxLength={100}
            inputMode="text"
            autoComplete="name"
            autoCapitalize="words"
            className={cn(
              'px-3 py-2 bg-zinc-900 border rounded-lg',
              'text-base sm:text-sm text-zinc-100',
              'placeholder:text-zinc-600',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'transition-colors',
              errors.name
                ? 'border-red-500 focus:ring-red-500'
                : 'border-zinc-800 focus:ring-zinc-600'
            )}
          />
          {/* Name Error */}
          {errors.name && (
            <p
              id="name-error"
              className="text-xs text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.name}
            </p>
          )}
          {/* Character Count */}
          <p className="text-xs text-zinc-500 text-right">
            {name.length}/100
          </p>
        </div>

        {/* Bio Field */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bio"
            className="text-sm font-medium text-zinc-300"
          >
            Bio
          </label>
          <textarea
            id="bio"
            placeholder="Tell us about yourself..."
            value={bio}
            onChange={(e) => {
              setBio(e.target.value)
              if (errors.bio) {
                setErrors({ ...errors, bio: undefined })
              }
            }}
            disabled={isSubmitting}
            aria-invalid={!!errors.bio}
            aria-describedby={errors.bio ? 'bio-error' : undefined}
            rows={4}
            maxLength={500}
            inputMode="text"
            autoComplete="off"
            className={cn(
              'px-3 py-2 bg-zinc-900 border rounded-lg',
              'text-base sm:text-sm text-zinc-100',
              'placeholder:text-zinc-600',
              'focus:outline-none focus:ring-2 focus:border-transparent',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              'resize-vertical transition-colors',
              errors.bio
                ? 'border-red-500 focus:ring-red-500'
                : 'border-zinc-800 focus:ring-zinc-600'
            )}
          />
          {/* Bio Error */}
          {errors.bio && (
            <p
              id="bio-error"
              className="text-xs text-red-400 flex items-center gap-1"
              role="alert"
            >
              <AlertCircle className="h-3 w-3" />
              {errors.bio}
            </p>
          )}
          {/* Character Count */}
          <p className="text-xs text-zinc-500 text-right">
            {bio.length}/500
          </p>
        </div>

        {/* Social Media Links Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-800">
          <h3 className="text-sm font-medium text-zinc-300">Social Media</h3>

          {/* GitHub URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="githubUrl"
              className="text-sm font-medium text-zinc-400"
            >
              GitHub URL
            </label>
            <input
              type="url"
              id="githubUrl"
              placeholder="https://github.com/username"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value)
                if (errors.githubUrl) {
                  setErrors({ ...errors, githubUrl: undefined })
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.githubUrl}
              aria-describedby={errors.githubUrl ? 'github-error' : undefined}
              inputMode="url"
              autoComplete="url"
              className={cn(
                'px-3 py-2 bg-zinc-900 border rounded-lg',
                'text-base sm:text-sm text-zinc-100',
                'placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
                errors.githubUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-zinc-800 focus:ring-zinc-600'
              )}
            />
            {errors.githubUrl && (
              <p
                id="github-error"
                className="text-xs text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.githubUrl}
              </p>
            )}
          </div>

          {/* Instagram URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="instagramUrl"
              className="text-sm font-medium text-zinc-400"
            >
              Instagram URL
            </label>
            <input
              type="url"
              id="instagramUrl"
              placeholder="https://instagram.com/username"
              value={instagramUrl}
              onChange={(e) => {
                setInstagramUrl(e.target.value)
                if (errors.instagramUrl) {
                  setErrors({ ...errors, instagramUrl: undefined })
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.instagramUrl}
              aria-describedby={errors.instagramUrl ? 'instagram-error' : undefined}
              inputMode="url"
              autoComplete="url"
              className={cn(
                'px-3 py-2 bg-zinc-900 border rounded-lg',
                'text-base sm:text-sm text-zinc-100',
                'placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
                errors.instagramUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-zinc-800 focus:ring-zinc-600'
              )}
            />
            {errors.instagramUrl && (
              <p
                id="instagram-error"
                className="text-xs text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.instagramUrl}
              </p>
            )}
          </div>

          {/* LinkedIn URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="linkedinUrl"
              className="text-sm font-medium text-zinc-400"
            >
              LinkedIn URL
            </label>
            <input
              type="url"
              id="linkedinUrl"
              placeholder="https://linkedin.com/in/username"
              value={linkedinUrl}
              onChange={(e) => {
                setLinkedinUrl(e.target.value)
                if (errors.linkedinUrl) {
                  setErrors({ ...errors, linkedinUrl: undefined })
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.linkedinUrl}
              aria-describedby={errors.linkedinUrl ? 'linkedin-error' : undefined}
              inputMode="url"
              autoComplete="url"
              className={cn(
                'px-3 py-2 bg-zinc-900 border rounded-lg',
                'text-base sm:text-sm text-zinc-100',
                'placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
                errors.linkedinUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-zinc-800 focus:ring-zinc-600'
              )}
            />
            {errors.linkedinUrl && (
              <p
                id="linkedin-error"
                className="text-xs text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.linkedinUrl}
              </p>
            )}
          </div>

          {/* Letterboxd URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="letterboxdUrl"
              className="text-sm font-medium text-zinc-400"
            >
              Letterboxd URL
            </label>
            <input
              type="url"
              id="letterboxdUrl"
              placeholder="https://letterboxd.com/username"
              value={letterboxdUrl}
              onChange={(e) => {
                setLetterboxdUrl(e.target.value)
                if (errors.letterboxdUrl) {
                  setErrors({ ...errors, letterboxdUrl: undefined })
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.letterboxdUrl}
              aria-describedby={errors.letterboxdUrl ? 'letterboxd-error' : undefined}
              inputMode="url"
              autoComplete="url"
              className={cn(
                'px-3 py-2 bg-zinc-900 border rounded-lg',
                'text-base sm:text-sm text-zinc-100',
                'placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
                errors.letterboxdUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-zinc-800 focus:ring-zinc-600'
              )}
            />
            {errors.letterboxdUrl && (
              <p
                id="letterboxd-error"
                className="text-xs text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.letterboxdUrl}
              </p>
            )}
          </div>

          {/* Spotify URL */}
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="spotifyUrl"
              className="text-sm font-medium text-zinc-400"
            >
              Spotify URL
            </label>
            <input
              type="url"
              id="spotifyUrl"
              placeholder="https://open.spotify.com/user/username"
              value={spotifyUrl}
              onChange={(e) => {
                setSpotifyUrl(e.target.value)
                if (errors.spotifyUrl) {
                  setErrors({ ...errors, spotifyUrl: undefined })
                }
              }}
              disabled={isSubmitting}
              aria-invalid={!!errors.spotifyUrl}
              aria-describedby={errors.spotifyUrl ? 'spotify-error' : undefined}
              inputMode="url"
              autoComplete="url"
              className={cn(
                'px-3 py-2 bg-zinc-900 border rounded-lg',
                'text-base sm:text-sm text-zinc-100',
                'placeholder:text-zinc-600',
                'focus:outline-none focus:ring-2 focus:border-transparent',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'transition-colors',
                errors.spotifyUrl
                  ? 'border-red-500 focus:ring-red-500'
                  : 'border-zinc-800 focus:ring-zinc-600'
              )}
            />
            {errors.spotifyUrl && (
              <p
                id="spotify-error"
                className="text-xs text-red-400 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="h-3 w-3" />
                {errors.spotifyUrl}
              </p>
            )}
          </div>
        </div>

        {/* Note about bio field */}
        <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-300">
            Note: Bio and social media updates will be available after the database migration is complete.
          </p>
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
            disabled={isSubmitting || !hasChanges}
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

export type { EditProfileModalProps }
