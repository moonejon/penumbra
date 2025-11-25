'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ProfileBio } from './ProfileBio'
import { ReadingListsSection } from './ReadingListsSection'
import type { UserProfile, ReadingListWithBooks } from '@/shared.types'

export interface HomeScreenProps {
  profile: UserProfile | null
  initialReadingLists: ReadingListWithBooks[]
  isOwner: boolean
  className?: string
}

/**
 * HomeScreen Component
 * Main container that composes all home screen sections:
 * - ProfileBio: User profile information and avatar
 * - ReadingListsSection: User's reading lists
 */
const HomeScreen = React.forwardRef<HTMLDivElement, HomeScreenProps>(
  (
    {
      profile,
      initialReadingLists,
      isOwner,
      className,
    },
    ref
  ) => {
    const router = useRouter()

    const handleProfileUpdate = React.useCallback(() => {
      // Refresh server-rendered data
      router.refresh()
    }, [router])

    return (
      <div
        ref={ref}
        className={cn('w-full', className)}
      >
        {/* Main container with max-width and responsive padding */}
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
          {/* Profile Section */}
          <ProfileBio
            profile={profile}
            isOwner={isOwner}
            onProfileUpdate={handleProfileUpdate}
          />

          {/* Divider between Profile and Reading Lists */}
          <div className="border-t border-zinc-800 pt-16" />

          {/* Reading Lists Section */}
          <ReadingListsSection
            initialLists={initialReadingLists}
            isOwner={isOwner}
          />
        </div>
      </div>
    )
  }
)

HomeScreen.displayName = 'HomeScreen'

export { HomeScreen }
