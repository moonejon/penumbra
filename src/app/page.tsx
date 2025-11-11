import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { HomeScreen } from '@/app/components/home'
import { getUserProfile } from '@/utils/actions/profile'
import { fetchFavorites, fetchAvailableFavoriteYears, fetchUserReadingLists } from '@/utils/actions/reading-lists'
import type { UserProfile, FavoriteBook } from '@/shared.types'

export const metadata: Metadata = {
  title: 'Penumbra - Your Personal Library',
  description: 'Organize your favorite books and create custom reading lists',
  openGraph: {
    title: 'Penumbra - Your Personal Library',
    description: 'Organize your favorite books and create custom reading lists',
    type: 'website',
  },
}

export default async function HomePage() {
  // Get current user from Clerk
  const { userId } = await auth()

  // Determine if page is being viewed by owner
  const isOwner = !!userId

  // Initialize data with defaults for unauthenticated users
  let profile: UserProfile | null = null
  let favorites: FavoriteBook[] = []
  let availableYears: number[] = []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readingLists: any = []

  // Fetch data only if user is authenticated
  if (userId) {
    try {
      // Fetch all data in parallel for performance
      const [profileResult, favoritesResult, yearsResult, listsResult] = await Promise.all([
        getUserProfile(),
        fetchFavorites(), // Fetch all-time favorites
        fetchAvailableFavoriteYears(),
        fetchUserReadingLists(),
      ])

      // Extract data from server action responses with fallbacks
      profile = profileResult.success && profileResult.profile ? profileResult.profile : null
      favorites = favoritesResult.success && favoritesResult.data ? favoritesResult.data : []
      availableYears = yearsResult.success && yearsResult.years ? yearsResult.years : []
      readingLists = listsResult.success && listsResult.data ? listsResult.data : []

      // Log errors for debugging (but don't crash the page)
      if (!profileResult.success) {
        console.error('Failed to fetch profile:', profileResult.error)
      }
      if (!favoritesResult.success) {
        console.error('Failed to fetch favorites:', favoritesResult.error)
      }
      if (!yearsResult.success) {
        console.error('Failed to fetch available years:', yearsResult.error)
      }
      if (!listsResult.success) {
        console.error('Failed to fetch reading lists:', listsResult.error)
      }
    } catch (error) {
      // Catch any unexpected errors and log them
      console.error('Unexpected error fetching home page data:', error)
      // Data remains at default empty values
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950">
      <HomeScreen
        profile={profile}
        initialFavorites={favorites}
        initialAvailableYears={availableYears}
        initialReadingLists={readingLists}
        isOwner={isOwner}
      />
    </div>
  )
}