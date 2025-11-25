import { notFound, redirect } from 'next/navigation'
import { Metadata } from 'next'
import { auth } from '@clerk/nextjs/server'
import { fetchReadingList, fetchReadingListPublic } from '@/utils/actions/reading-lists'
import { getCurrentUser } from '@/utils/permissions'
import { ReadingListDetailScreen } from '@/app/components/reading-list-detail'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

/**
 * Generate metadata for reading list detail page
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const listId = parseInt(id, 10)

  if (isNaN(listId)) {
    return {
      title: 'Reading List Not Found',
    }
  }

  const result = await fetchReadingList(listId)

  if (!result.success || !result.data) {
    return {
      title: 'Reading List Not Found',
    }
  }

  const list = result.data

  return {
    title: `${list.title} - Penumbra`,
    description: list.description || `A reading list with ${list.books.length} books`,
  }
}

/**
 * Reading List Detail Page
 * Server Component that fetches reading list data and validates access
 * Allows unauthenticated users to view public lists
 */
export default async function ReadingListDetailPage({ params }: PageProps) {
  const { id } = await params
  const listId = parseInt(id, 10)

  // Validate list ID
  if (isNaN(listId)) {
    notFound()
  }

  // Check authentication status
  const { userId } = await auth()

  // Get current user if authenticated
  let currentUserId: number | null = null
  if (userId) {
    try {
      const user = await getCurrentUser()
      currentUserId = user.id
    } catch (error) {
      // User not found in database, continue as unauthenticated
      console.error('User not found in database:', error)
    }
  }

  // Fetch reading list - use appropriate function based on authentication
  const result = currentUserId
    ? await fetchReadingList(listId)
    : await fetchReadingListPublic(listId)

  // Handle errors
  if (!result.success || !result.data) {
    // If the error is unauthorized, redirect to home
    if (result.error?.includes('Unauthorized')) {
      redirect('/')
    }
    // Otherwise, show not found
    notFound()
  }

  const list = result.data

  // Check if user is the owner
  const isOwner = currentUserId !== null && list.ownerId === currentUserId

  // If not owner, check if list is public
  if (!isOwner && list.visibility !== 'PUBLIC') {
    // Private/friends/unlisted lists require ownership
    redirect('/')
  }

  // Render the detail screen
  return <ReadingListDetailScreen list={list} isOwner={isOwner} />
}
