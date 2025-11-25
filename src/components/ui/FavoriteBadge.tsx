'use client'

import * as React from 'react'
import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FavoriteBadgeProps {
  position: number // 1-6
  isInteractive?: boolean // Owner can click to edit
  onClick?: () => void
  className?: string
}

const FavoriteBadge = React.forwardRef<HTMLDivElement, FavoriteBadgeProps>(
  ({ position, isInteractive = false, onClick, className }, ref) => {
    return (
      <div
        ref={ref}
        role="button"
        aria-label={`Favorite position ${position}`}
        onClick={onClick}
        className={cn(
          // Base styles
          'absolute top-2 right-2 md:top-2 md:right-2',
          'h-7 w-7 md:h-8 md:w-8',
          'flex items-center justify-center gap-0.5',
          'bg-zinc-900/80 backdrop-blur-sm',
          'border border-zinc-700',
          'rounded-full',
          // Text styles
          'text-zinc-100',
          'text-xs md:text-sm',
          'font-semibold',
          // Interactive styles
          isInteractive && 'cursor-pointer',
          isInteractive && 'transition-transform duration-200',
          isInteractive && 'hover:scale-105',
          // Custom className
          className
        )}
        tabIndex={isInteractive ? 0 : -1}
        onKeyDown={isInteractive ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onClick?.()
          }
        } : undefined}
      >
        <Star
          size={14}
          className="fill-zinc-100 text-zinc-100"
          aria-hidden="true"
        />
        <span>{position}</span>
      </div>
    )
  }
)

FavoriteBadge.displayName = 'FavoriteBadge'

export { FavoriteBadge }
export type { FavoriteBadgeProps }
