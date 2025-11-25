'use client'

import * as React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { User, Pencil, BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { EditProfileModal } from './EditProfileModal'
import { SocialMediaLinks } from './SocialMediaLinks'
import type { UserProfile } from '@/shared.types'

export interface ProfileBioProps {
  profile: UserProfile | null
  isOwner: boolean
  className?: string
  onProfileUpdate?: () => void
}

const ProfileBio = React.forwardRef<HTMLDivElement, ProfileBioProps>(
  (
    {
      profile,
      isOwner,
      className,
      onProfileUpdate,
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
    const [isHovering, setIsHovering] = React.useState(false)

    // Guest view (no profile)
    if (!profile) {
      return (
        <div
          ref={ref}
          className={cn(
            'flex flex-col items-center gap-4 py-4 md:py-6',
            className
          )}
        >
          {/* Guest icon placeholder */}
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
            <User className="w-10 h-10 md:w-14 md:h-14 text-zinc-500" />
          </div>

          {/* Welcome message */}
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100">
              Welcome to Penumbra
            </h1>
            <p className="text-base text-zinc-400 max-w-md">
              Discover and explore book collections from readers around the world
            </p>
          </div>

          {/* Browse Library CTA */}
          <Link href="/library">
            <Button
              variant="outline"
              size="lg"
              className="mt-2 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-100"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Library
            </Button>
          </Link>
        </div>
      )
    }

    // Get first letter of name for fallback
    const firstLetter = profile.name
      ? profile.name.charAt(0).toUpperCase()
      : profile.email.charAt(0).toUpperCase()

    // Determine if we should show the profile image
    const showImage = profile.profileImageUrl && !imageError

    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center gap-4 py-4 md:py-6',
          className
        )}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Profile Image */}
        <div className="relative w-20 h-20 md:w-28 md:h-28 rounded-full overflow-hidden border-2 border-zinc-700 bg-zinc-800">
          {showImage ? (
            <Image
              src={profile.profileImageUrl!}
              alt={`${profile.name || 'User'}'s profile`}
              fill
              sizes="(max-width: 768px) 80px, 120px"
              className="object-cover"
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-zinc-700">
              <span className="text-2xl md:text-4xl font-bold text-zinc-100">
                {firstLetter}
              </span>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="flex flex-col items-center gap-3 text-center max-w-2xl px-4">
          {/* Name */}
          {profile.name && (
            <h1 className="text-2xl md:text-3xl font-semibold text-zinc-100">
              {profile.name}
            </h1>
          )}

          {/* Social Media Links */}
          <SocialMediaLinks profile={profile} />

          {/* Bio */}
          {profile.bio && (
            <p className="text-base text-zinc-400 leading-relaxed">
              {profile.bio}
            </p>
          )}

          {/* If no name and no bio, show email as fallback */}
          {!profile.name && !profile.bio && (
            <p className="text-base text-zinc-400">{profile.email}</p>
          )}
        </div>

        {/* Browse Library CTA - Visible to all users */}
        <Link href="/library">
          <Button
            variant="outline"
            size="default"
            className="border-zinc-700 bg-zinc-800/50 hover:bg-zinc-700/50 text-zinc-100"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Browse Library
          </Button>
        </Link>

        {/* Edit Button (Owner Only) - Subtle text link */}
        {isOwner && (
          <button
            onClick={() => setIsEditModalOpen(true)}
            className={cn(
              'text-sm text-zinc-500 hover:text-zinc-300 transition-colors',
              'flex items-center gap-1.5',
              isHovering ? 'opacity-100' : 'opacity-50 md:opacity-70'
            )}
          >
            <Pencil className="w-3 h-3" />
            Edit Profile
          </button>
        )}

        {/* Edit Profile Modal */}
        {isOwner && profile && (
          <EditProfileModal
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            profile={profile}
            onSuccess={() => {
              // Call parent refresh callback if provided
              onProfileUpdate?.()
            }}
          />
        )}
      </div>
    )
  }
)

ProfileBio.displayName = 'ProfileBio'

export { ProfileBio }
