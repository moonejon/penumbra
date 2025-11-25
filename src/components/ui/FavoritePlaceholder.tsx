'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoritePlaceholderProps {
  position: number // 1-6
  onClick: () => void
  className?: string
}

export const FavoritePlaceholder = React.forwardRef<
  HTMLButtonElement,
  FavoritePlaceholderProps
>(({ position, onClick, className }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      aria-label={`Add favorite at position ${position}`}
      className={cn(
        // Base layout and aspect ratio
        'relative flex aspect-[2/3] w-full flex-col items-center justify-center gap-3 rounded-lg',
        // Border styling
        'border-2 border-dashed border-zinc-700',
        // Background
        'bg-zinc-900/50',
        // Transitions
        'transition-all duration-200 ease-in-out',
        // Hover states
        'hover:border-zinc-500 hover:scale-105 hover:cursor-pointer',
        // Focus states for accessibility
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
        className
      )}
    >
      {/* Plus Icon */}
      <Plus size={32} className="text-zinc-400 transition-colors duration-200" />

      {/* Text Label */}
      <span className="text-sm font-medium text-zinc-400">Add Favorite</span>

      {/* Position Badge */}
      <div className="absolute right-2 top-2 flex items-center justify-center rounded bg-zinc-800 px-2 py-1 text-xs font-semibold text-zinc-300">
        #{position}
      </div>
    </button>
  )
})

FavoritePlaceholder.displayName = 'FavoritePlaceholder'
