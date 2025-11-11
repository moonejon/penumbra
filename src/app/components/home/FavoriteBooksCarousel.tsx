'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { BookCoverCard } from '@/components/ui/BookCoverCard'
import { FavoriteBadge } from '@/components/ui/FavoriteBadge'
import { FavoritePlaceholder } from '@/components/ui/FavoritePlaceholder'
import type { FavoriteBook } from '@/shared.types'

export interface FavoriteBooksCarouselProps {
  favorites: FavoriteBook[] // 0-6 items
  isLoading: boolean
  isOwner: boolean
  onAddFavorite: (position: number) => void
  onEditFavorite: (bookId: number, position: number) => void
  className?: string
}

export const FavoriteBooksCarousel = React.forwardRef<
  HTMLDivElement,
  FavoriteBooksCarouselProps
>(
  (
    {
      favorites,
      isLoading,
      isOwner,
      onAddFavorite,
      onEditFavorite,
      className,
    },
    ref
  ) => {
    // Determine total slots (5 or 6 based on favorites)
    // If we have any favorites, determine slots from the max position
    // Otherwise default to 6 for owner, 0 for public
    const maxPosition = favorites.length > 0
      ? Math.max(...favorites.map((f) => f.position))
      : 0

    const totalSlots = maxPosition > 0
      ? Math.max(maxPosition, 5) // At least 5 slots, up to max position
      : isOwner
        ? 6 // Default 6 for owner
        : 0 // No slots for public view if no favorites

    // Create array of positions [1, 2, 3, 4, 5, 6]
    const positions = Array.from({ length: totalSlots }, (_, i) => i + 1)

    // Create a map of position to favorite for quick lookup
    const favoritesByPosition = new Map(
      favorites.map((fav) => [fav.position, fav])
    )

    // Loading state: Show 6 skeleton loaders
    if (isLoading) {
      return (
        <div
          ref={ref}
          className={cn(
            // Mobile: Horizontal scroll
            'flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible',
            // Desktop: Grid layout
            'md:grid md:grid-cols-5 lg:grid-cols-6',
            'pb-4 md:pb-0',
            className
          )}
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="snap-start shrink-0 md:snap-none">
              <BookCoverCard
                book={{
                  id: 0,
                  title: '',
                  authors: [],
                  image: '',
                }}
                loading
                size="md"
              />
            </div>
          ))}
        </div>
      )
    }

    // Empty state for public view with no favorites
    if (!isOwner && favorites.length === 0) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          // Mobile: Horizontal scroll
          'flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide md:overflow-visible',
          // Desktop: Grid layout - 5 cols if 5 slots, 6 cols if 6 slots
          totalSlots === 5 ? 'md:grid md:grid-cols-5' : 'md:grid md:grid-cols-6',
          'pb-4 md:pb-0',
          className
        )}
        style={{
          // Ensure smooth scrolling on mobile
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {positions.map((position) => {
          const favorite = favoritesByPosition.get(position)

          // If slot is filled
          if (favorite) {
            return (
              <div
                key={position}
                className="snap-start shrink-0 md:snap-none relative"
              >
                <BookCoverCard
                  book={{
                    id: favorite.book.id,
                    title: favorite.book.title,
                    authors: favorite.book.authors,
                    image: favorite.book.image,
                  }}
                  onClick={
                    isOwner
                      ? () => onEditFavorite(favorite.book.id, position)
                      : undefined
                  }
                  size="md"
                  showBadge
                >
                  <FavoriteBadge
                    position={position}
                    isInteractive={isOwner}
                    onClick={
                      isOwner
                        ? () => {
                            onEditFavorite(favorite.book.id, position)
                          }
                        : undefined
                    }
                  />
                </BookCoverCard>
              </div>
            )
          }

          // If slot is empty and user is owner
          if (isOwner) {
            return (
              <div
                key={position}
                className="snap-start shrink-0 md:snap-none"
              >
                <FavoritePlaceholder
                  position={position}
                  onClick={() => onAddFavorite(position)}
                />
              </div>
            )
          }

          // Public view: Don't show empty slots
          return null
        })}
      </div>
    )
  }
)

FavoriteBooksCarousel.displayName = 'FavoriteBooksCarousel'
