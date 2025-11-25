import type { Metadata } from 'next'
import { HomeScreen } from '@/app/components/home'
import { getHomePageData } from '@/utils/actions/home-page'

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
  // Get unified home page data (handles both authenticated and public views)
  const result = await getHomePageData()

  // Handle configuration error (DEFAULT_USER_ID not set)
  if (result.status === 'not_configured') {
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

  // Handle user not found error (DEFAULT_USER_ID references non-existent user)
  if (result.status === 'user_not_found') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            User Not Found
          </h1>
          <p className="text-zinc-400 mb-4">
            The configured default user could not be found in the database.
          </p>
          <p className="text-zinc-500 text-sm">
            Sign in to view your personal library, or contact the administrator to fix
            the default user configuration.
          </p>
        </div>
      </div>
    )
  }

  // Handle general errors
  if (result.status === 'error') {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h1 className="text-xl font-semibold text-zinc-100 mb-2">
            Error Loading Page
          </h1>
          <p className="text-zinc-400 mb-4">
            An error occurred while loading the home page.
          </p>
          <p className="text-zinc-500 text-sm">
            {result.error || 'Please try again later.'}
          </p>
        </div>
      </div>
    )
  }

  // Success: render home screen
  return (
    <div className="min-h-screen bg-zinc-950">
      <HomeScreen
        profile={result.profile}
        initialReadingLists={result.readingLists}
        isOwner={result.isOwner}
      />
    </div>
  )
}
