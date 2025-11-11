'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ProfileBio } from './ProfileBio'
import { FavoriteBooksSection } from './FavoriteBooksSection'
import { ReadingListsSection } from './ReadingListsSection'
import type { UserProfile, FavoriteBook, ReadingListWithBooks } from '@/shared.types'

export interface HomeScreenProps {
  profile: UserProfile | null
  initialFavorites: FavoriteBook[]
  initialAvailableYears: number[]
  initialReadingLists: ReadingListWithBooks[]
  isOwner: boolean
  className?: string
}

/**
 * HomeScreen Component
 * Main container that composes all home screen sections:
 * - ProfileBio: User profile information and avatar
 * - FavoriteBooksSection: User's favorite books with year filtering
 * - ReadingListsSection: User's reading lists
 *
 * Phase 2 Wave 1: Integration of sections from Agents 1 and 2
 */
const HomeScreen = React.forwardRef<HTMLDivElement, HomeScreenProps>(
  (
    {
      profile,
      initialFavorites,
      initialAvailableYears,
      initialReadingLists,
      isOwner,
      className,
    },
    ref
  ) => {
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
          />

          {/* Divider between Profile and Favorites */}
          <div className="border-t border-zinc-800 pt-16" />

          {/* Favorites Section */}
          <FavoriteBooksSection
            initialFavorites={initialFavorites}
            initialAvailableYears={initialAvailableYears}
            isOwner={isOwner}
          />

          {/* Divider between Favorites and Reading Lists */}
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
