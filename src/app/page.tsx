import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { HomeScreen } from '@/app/components/home'
import { getUserProfile, getPublicUserProfile } from '@/utils/actions/profile'
import { fetchUserReadingLists, fetchPublicReadingLists } from '@/utils/actions/reading-lists'
import type { UserProfile } from '@/shared.types'

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

  // Get the default user ID from environment variable
  const defaultUserId = process.env.DEFAULT_USER_ID || ''

  // Determine which user's profile to show
  // If signed in, show their own profile; otherwise show default user's profile
  const profileUserId = userId || defaultUserId

  // Determine if page is being viewed by owner
  const isOwner = !!userId && userId === profileUserId

  // Initialize data with defaults
  let profile: UserProfile | null = null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let readingLists: any = []

  if (profileUserId) {
    try {
      // If viewing your own profile (authenticated), fetch all lists
      // If viewing public profile (not authenticated), fetch only public lists
      const [profileResult, listsResult] = await Promise.all([
        userId && userId === profileUserId
          ? getUserProfile()
          : getPublicUserProfile(profileUserId),
        userId && userId === profileUserId
          ? fetchUserReadingLists()
          : fetchPublicReadingLists(profileUserId),
      ])

      // Extract data from server action responses with fallbacks
      profile = profileResult.success && profileResult.profile ? profileResult.profile : null
      readingLists = listsResult.success && listsResult.data ? listsResult.data : []

      // Log errors for debugging (but don't crash the page)
      if (!profileResult.success) {
        console.error('Failed to fetch profile:', profileResult.error)
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
        initialReadingLists={readingLists}
        isOwner={isOwner}
      />
    </div>
  )
}