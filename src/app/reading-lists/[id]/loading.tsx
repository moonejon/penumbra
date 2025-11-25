/**
 * Loading skeleton for Reading List Detail Page
 * Displays while the page data is being fetched
 */
export default function ReadingListLoading() {
  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button skeleton */}
        <div className="mb-6">
          <div className="h-6 w-32 bg-zinc-800 rounded animate-pulse" />
        </div>

        {/* Header skeleton */}
        <div className="mb-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            {/* Title and description */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="h-10 w-3/4 bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-full bg-zinc-800 rounded animate-pulse" />
              <div className="h-6 w-2/3 bg-zinc-800 rounded animate-pulse" />
              <div className="h-5 w-24 bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse" />
              <div className="h-10 w-10 bg-zinc-800 rounded animate-pulse" />
              <div className="h-10 w-10 bg-zinc-800 rounded animate-pulse" />
            </div>
          </div>
        </div>

        {/* Books grid skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden"
            >
              {/* Book cover skeleton */}
              <div className="relative aspect-[2/3] w-full bg-zinc-800 animate-pulse" />

              {/* Book info skeleton */}
              <div className="p-4 space-y-2">
                <div className="h-4 w-full bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-zinc-800 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
