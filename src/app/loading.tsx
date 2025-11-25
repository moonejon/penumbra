/**
 * Loading Component
 * Suspense fallback displayed while the home page data is being fetched
 * Provides skeleton UI matching the HomeScreen layout
 */
export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-16">
          {/* Profile Section Skeleton */}
          <div className="flex flex-col items-center gap-6">
            {/* Avatar skeleton */}
            <div className="w-24 h-24 rounded-full bg-zinc-800 animate-pulse" />

            {/* Name skeleton */}
            <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />

            {/* Bio skeleton */}
            <div className="space-y-2 w-full max-w-2xl">
              <div className="h-4 bg-zinc-800 rounded animate-pulse" />
              <div className="h-4 bg-zinc-800 rounded animate-pulse w-3/4 mx-auto" />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800 pt-16" />

          {/* Favorites Section Skeleton */}
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
              <div className="h-10 w-32 bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Carousel skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="aspect-[2/3] bg-zinc-800 rounded-lg animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-zinc-800 pt-16" />

          {/* Reading Lists Section Skeleton */}
          <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
              <div className="h-8 w-48 bg-zinc-800 rounded animate-pulse" />
              <div className="h-10 w-40 bg-zinc-800 rounded animate-pulse" />
            </div>

            {/* Grid skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-3 p-4 border border-zinc-800 rounded-lg">
                  <div className="h-6 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded animate-pulse w-2/3" />
                  <div className="grid grid-cols-3 gap-2 pt-2">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="aspect-[2/3] bg-zinc-800 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
