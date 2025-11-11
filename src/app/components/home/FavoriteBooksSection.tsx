'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { FavoriteBooksHeader } from './FavoriteBooksHeader'
import { FavoriteBooksCarousel } from './FavoriteBooksCarousel'
import { fetchFavorites } from '@/utils/actions/reading-lists'
import type { FavoriteBook } from '@/shared.types'

export interface FavoriteBooksSectionProps {
  initialFavorites: FavoriteBook[]
  initialAvailableYears: number[]
  isOwner: boolean
  className?: string
}

export const FavoriteBooksSection = React.forwardRef<
  HTMLDivElement,
  FavoriteBooksSectionProps
>(
  (
    {
      initialFavorites,
      initialAvailableYears,
      isOwner,
      className,
    },
    ref
  ) => {
    // State management
    const [yearFilter, setYearFilter] = React.useState<'all-time' | number>(
      'all-time'
    )
    const [favorites, setFavorites] =
      React.useState<FavoriteBook[]>(initialFavorites)
    const [availableYears] = React.useState<number[]>(
      initialAvailableYears
    )
    const [isLoading, setIsLoading] = React.useState(false)
    const [error, setError] = React.useState<string | null>(null)

    // Fetch favorites when year filter changes
    React.useEffect(() => {
      const loadFavorites = async () => {
        setIsLoading(true)
        setError(null)

        try {
          const year = yearFilter === 'all-time' ? undefined : yearFilter.toString()
          const result = await fetchFavorites(year)

          if (result.success && result.data) {
            setFavorites(result.data)
          } else {
            setError(result.error || 'Failed to load favorites')
            setFavorites([])
          }
        } catch (err) {
          console.error('Error fetching favorites:', err)
          setError('An unexpected error occurred')
          setFavorites([])
        } finally {
          setIsLoading(false)
        }
      }

      // Only fetch if not using initial data (all-time on first render)
      if (yearFilter !== 'all-time' || favorites !== initialFavorites) {
        loadFavorites()
      }
    }, [yearFilter, initialFavorites, favorites])

    // Handle year filter change
    const handleYearChange = (year: 'all-time' | number) => {
      setYearFilter(year)
    }

    // Handle add favorite (modal will be implemented in Wave 2)
    const handleAddFavorite = (position: number) => {
      console.log(`Add favorite at position ${position}`)
      // TODO Wave 2: Open modal to select book
    }

    // Handle edit favorite (modal will be implemented in Wave 2)
    const handleEditFavorite = (bookId: number, position: number) => {
      console.log(`Edit favorite: bookId=${bookId}, position=${position}`)
      // TODO Wave 2: Open modal to edit/remove favorite
    }

    // Determine if we should show empty state
    const showEmptyState = !isLoading && favorites.length === 0

    // Empty state message varies based on context
    const getEmptyStateMessage = () => {
      if (!isOwner) {
        return 'No favorite books yet.'
      }

      if (yearFilter === 'all-time') {
        return 'No favorites yet. Click a placeholder to add your first favorite book!'
      }

      return `No favorites for ${yearFilter}. Click a placeholder to add favorite books from this year.`
    }

    return (
      <div
        ref={ref}
        className={cn('flex flex-col gap-6 md:gap-8', className)}
      >
        {/* Header with year filter */}
        <FavoriteBooksHeader
          yearFilter={yearFilter}
          onYearChange={handleYearChange}
          availableYears={availableYears}
          isOwner={isOwner}
        />

        {/* Error message */}
        {error && (
          <div className="px-4 py-3 bg-red-900/20 border border-red-800 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {/* Empty state for owner with no favorites */}
        {showEmptyState && isOwner && (
          <div className="py-12 text-center">
            <p className="text-zinc-400 text-lg">{getEmptyStateMessage()}</p>
          </div>
        )}

        {/* Empty state for public view with no favorites */}
        {showEmptyState && !isOwner && (
          <div className="py-8 text-center">
            <p className="text-zinc-500">{getEmptyStateMessage()}</p>
          </div>
        )}

        {/* Carousel - always show for owner (includes placeholders), only show for public if has favorites */}
        {(isOwner || (!isLoading && favorites.length > 0)) && (
          <FavoriteBooksCarousel
            favorites={favorites}
            isLoading={isLoading}
            isOwner={isOwner}
            onAddFavorite={handleAddFavorite}
            onEditFavorite={handleEditFavorite}
          />
        )}
      </div>
    )
  }
)

FavoriteBooksSection.displayName = 'FavoriteBooksSection'
