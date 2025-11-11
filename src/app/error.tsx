'use client'

import { useEffect } from 'react'
import { Button } from '@mui/material'
import { RefreshCw } from 'lucide-react'

/**
 * Error Component
 * Error boundary for the home page route
 * Catches runtime errors and provides user-friendly error message with retry option
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error('Home page error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6 text-center">
        {/* Error icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error message */}
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-100">
            Something went wrong
          </h1>
          <p className="text-zinc-400">
            We encountered an error while loading your library. Please try again.
          </p>
        </div>

        {/* Error details (in development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 text-left">
            <p className="text-xs font-mono text-red-400 break-all">
              {error.message}
            </p>
            {error.digest && (
              <p className="text-xs font-mono text-zinc-500 mt-2">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        )}

        {/* Retry button */}
        <Button
          variant="contained"
          color="primary"
          onClick={reset}
          startIcon={<RefreshCw size={18} />}
          className="w-full"
        >
          Try Again
        </Button>

        {/* Help text */}
        <p className="text-sm text-zinc-500">
          If the problem persists, please refresh the page or contact support.
        </p>
      </div>
    </div>
  )
}
