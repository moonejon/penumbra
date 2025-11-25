'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { FavoriteBooksHeader } from './FavoriteBooksHeader'
import { FavoriteBooksCarousel } from './FavoriteBooksCarousel'
import { AddFavoriteModal } from './AddFavoriteModal'
import { EditFavoriteModal } from './EditFavoriteModal'
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

    // Modal state
    const [addModalOpen, setAddModalOpen] = React.useState(false)
    const [editModalOpen, setEditModalOpen] = React.useState(false)
    const [selectedPosition, setSelectedPosition] = React.useState<number>(1)
    const [selectedFavorite, setSelectedFavorite] = React.useState<FavoriteBook | null>(null)

    // Track if we've initialized with server data to prevent unnecessary fetches
    const hasInitialized = React.useRef(false)

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

      // On first render with all-time filter, use initial data from server
      // Only fetch from API when year filter changes or on subsequent renders
      if (yearFilter === 'all-time' && !hasInitialized.current) {
        hasInitialized.current = true
        return
      }

      loadFavorites()
    }, [yearFilter])

    // Handle year filter change
    const handleYearChange = (year: 'all-time' | number) => {
      setYearFilter(year)
    }

    // Handle add favorite
    const handleAddFavorite = (position: number) => {
      setSelectedPosition(position)
      setAddModalOpen(true)
    }

    // Handle edit favorite
    const handleEditFavorite = (bookId: number, position: number) => {
      const favorite = favorites.find(
        (f) => f.book.id === bookId && f.position === position
      )
      if (favorite) {
        setSelectedFavorite(favorite)
        setEditModalOpen(true)
      }
    }

    // Handle modal success - refresh favorites
    const handleModalSuccess = async () => {
      setIsLoading(true)
      try {
        const year = yearFilter === 'all-time' ? undefined : yearFilter.toString()
        const result = await fetchFavorites(year)
        if (result.success && result.data) {
          setFavorites(result.data)
        }
      } catch (err) {
        console.error('Error refreshing favorites:', err)
      } finally {
        setIsLoading(false)
      }
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

        {/* Add Favorite Modal */}
        {isOwner && (
          <AddFavoriteModal
            isOpen={addModalOpen}
            onClose={() => setAddModalOpen(false)}
            position={selectedPosition}
            year={yearFilter}
            onSuccess={handleModalSuccess}
          />
        )}

        {/* Edit Favorite Modal */}
        {isOwner && selectedFavorite && (
          <EditFavoriteModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            favorite={selectedFavorite}
            year={yearFilter}
            onSuccess={handleModalSuccess}
          />
        )}
      </div>
    )
  }
)

FavoriteBooksSection.displayName = 'FavoriteBooksSection'
