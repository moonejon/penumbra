'use client'

import * as React from 'react'
import Image from 'next/image'
import { motion } from 'motion/react'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BookCoverCardProps {
  book: {
    id: number
    title: string
    authors: string[]
    image: string
  }
  onClick?: () => void
  size?: 'sm' | 'md' | 'lg'
  showBadge?: boolean
  badgePosition?: number // 1-6 for favorites
  loading?: boolean
  className?: string
  children?: React.ReactNode // For badge slot
}

const sizeConfig = {
  sm: { width: 120, height: 180 },
  md: { width: 160, height: 240 },
  lg: { width: 200, height: 300 },
} as const

export const BookCoverCard = React.forwardRef<HTMLDivElement, BookCoverCardProps>(
  (
    {
      book,
      onClick,
      size = 'md',
      showBadge = false,
      badgePosition,
      loading = false,
      className,
      children,
    },
    ref
  ) => {
    const [imageError, setImageError] = React.useState(false)
    const { width, height } = sizeConfig[size]

    // ARIA label for accessibility
    const ariaLabel = `${book.title} by ${book.authors.join(', ')}`

    // Loading skeleton
    if (loading) {
      return (
        <div
          ref={ref}
          className={cn(
            'relative rounded-lg bg-zinc-900 border border-zinc-800 overflow-hidden',
            className
          )}
          style={{ width, height }}
        >
          <div className="w-full h-full animate-pulse bg-zinc-800" />
        </div>
      )
    }

    // Interactive wrapper if onClick provided
    const isInteractive = !!onClick

    return (
      <motion.div
        ref={ref}
        className={cn(
          'relative rounded-lg overflow-hidden border border-zinc-800 bg-zinc-900',
          isInteractive &&
            'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950',
          className
        )}
        style={{ width, height }}
        onClick={onClick}
        onKeyDown={
          isInteractive
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onClick?.()
                }
              }
            : undefined
        }
        tabIndex={isInteractive ? 0 : undefined}
        role={isInteractive ? 'button' : undefined}
        aria-label={ariaLabel}
        whileHover={
          isInteractive
            ? {
                scale: 1.02,
                transition: {
                  type: 'spring',
                  stiffness: 400,
                  damping: 25,
                },
              }
            : undefined
        }
        whileTap={isInteractive ? { scale: 0.98 } : undefined}
      >
        {/* Book Cover Image or Fallback */}
        {!imageError && book.image ? (
          <Image
            src={book.image}
            alt={`Cover of ${book.title}`}
            fill
            sizes={`${width}px`}
            className="object-cover"
            onError={() => setImageError(true)}
            loading="lazy"
            quality={85}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-800">
            <BookOpen
              className="text-zinc-600"
              size={size === 'sm' ? 32 : size === 'md' ? 40 : 48}
            />
          </div>
        )}

        {/* Hover Shadow Effect */}
        {isInteractive && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ boxShadow: '0 0 0 rgba(0, 0, 0, 0)' }}
            whileHover={{
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
            }}
          />
        )}

        {/* Badge Slot - Top Right Corner */}
        {showBadge && children && (
          <div className="absolute top-2 right-2 z-10">{children}</div>
        )}

        {/* Badge Position Indicator (if provided without custom badge) */}
        {showBadge && badgePosition && !children && (
          <div className="absolute top-2 right-2 z-10 w-8 h-8 bg-zinc-800/90 backdrop-blur-sm border border-zinc-700 rounded-full flex items-center justify-center">
            <span className="text-xs font-semibold text-zinc-200">{badgePosition}</span>
          </div>
        )}

        {/* Gradient Overlay for Better Badge Visibility */}
        {showBadge && (children || badgePosition) && (
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-black/40 to-transparent pointer-events-none" />
        )}
      </motion.div>
    )
  }
)

BookCoverCard.displayName = 'BookCoverCard'
