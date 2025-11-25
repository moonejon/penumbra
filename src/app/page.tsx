import type { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { HomeScreen } from '@/app/components/home'
import { getUserProfile, getPublicUserProfile } from '@/utils/actions/profile'
import { fetchUserReadingLists, fetchPublicReadingLists } from '@/utils/actions/reading-lists'
import type { UserProfile } from '@/shared.types'

// Force dynamic rendering to ensure env vars are read at runtime
export const dynamic = 'force-dynamic'

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
  const defaultUserId = process.env.DEFAULT_USER_ID

  // Validate environment configuration for unauthenticated users
  if (!userId && !defaultUserId) {
    // Missing DEFAULT_USER_ID configuration - show helpful error UI
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            Configuration Required
          </h1>
          <p className="text-zinc-400 mb-4">
            The application is not properly configured. Please set the{' '}
            <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-sm text-amber-400">
              DEFAULT_USER_ID
            </code>{' '}
            environment variable to enable public viewing.
          </p>
          <p className="text-zinc-500 text-sm">
            Sign in to view your personal library, or contact the administrator to configure
            the default user for public viewing.
          </p>
        </div>
      </div>
    )
  }

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
