'use client'

import { useEffect } from 'react'
import { AlertCircle, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Error boundary for Reading List Detail Page
 * Displays when an error occurs during rendering
 */
export default function ReadingListError({ error, reset }: ErrorProps) {
  const router = useRouter()

  useEffect(() => {
    // Log the error to console
    console.error('Reading list page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        {/* Error Message */}
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">
          Something went wrong
        </h1>
        <p className="text-zinc-400 mb-6">
          We encountered an error while loading this reading list. Please try again.
        </p>

        {/* Error Details (in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-6 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-left">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-zinc-500 mt-2">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => router.push('/')}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Button>
          <Button variant="default" onClick={reset}>
            Try Again
          </Button>
        </div>
      </div>
    </div>
  )
}
