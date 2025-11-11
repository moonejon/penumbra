'use client'

import * as React from 'react'
import Image from 'next/image'
import { BookOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ListCoverPreviewProps {
  coverImages: string[] // Max 4 URLs
  className?: string
}

/**
 * ListCoverPreview Component
 * Displays a grid of book covers from a reading list
 * Adapts layout based on number of covers (0-4)
 */
export function ListCoverPreview({ coverImages, className }: ListCoverPreviewProps) {
  // Take only first 4 images
  const images = coverImages.slice(0, 4)
  const count = images.length

  // Fallback icon when no images or image fails to load
  const FallbackIcon = () => (
    <div className="flex items-center justify-center w-full h-full bg-zinc-900 border border-zinc-700 rounded">
      <BookOpen className="text-zinc-600" size={48} aria-hidden="true" />
    </div>
  )

  // 0 images: Show single BookOpen icon
  if (count === 0) {
    return (
      <div className={cn('w-full aspect-[2/3]', className)} aria-label="No covers available">
        <FallbackIcon />
      </div>
    )
  }

  // 1 image: Single large cover (centered)
  if (count === 1) {
    return (
      <div className={cn('w-full aspect-[2/3] relative', className)}>
        <Image
          src={images[0]}
          alt="Book cover"
          fill
          className="object-cover border border-zinc-700 rounded"
          sizes="(max-width: 768px) 64px, 96px"
          onError={(e) => {
            // Replace with fallback on error
            const target = e.target as HTMLImageElement
            target.style.display = 'none'
            if (target.parentElement) {
              target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-zinc-900 border border-zinc-700 rounded"><svg class="text-zinc-600" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg></div>'
            }
          }}
        />
      </div>
    )
  }

  // 2-3 images: Horizontal row
  if (count <= 3) {
    return (
      <div className={cn('flex gap-1', className)} aria-label={`${count} book covers`}>
        {images.map((url, index) => (
          <div key={index} className="w-16 h-24 relative flex-shrink-0">
            <Image
              src={url}
              alt={`Book cover ${index + 1}`}
              fill
              className="object-cover border border-zinc-700 rounded"
              sizes="64px"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
                if (target.parentElement) {
                  target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-zinc-900 border border-zinc-700 rounded"><svg class="text-zinc-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg></div>'
                }
              }}
            />
          </div>
        ))}
      </div>
    )
  }

  // 4 images: 2x2 grid
  return (
    <div
      className={cn('grid grid-cols-2 gap-1', className)}
      aria-label="4 book covers in grid"
    >
      {images.map((url, index) => (
        <div key={index} className="w-16 h-24 relative">
          <Image
            src={url}
            alt={`Book cover ${index + 1}`}
            fill
            className="object-cover border border-zinc-700 rounded"
            sizes="64px"
            onError={(e) => {
              const target = e.target as HTMLImageElement
              target.style.display = 'none'
              if (target.parentElement) {
                target.parentElement.innerHTML = '<div class="flex items-center justify-center w-full h-full bg-zinc-900 border border-zinc-700 rounded"><svg class="text-zinc-600" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path></svg></div>'
              }
            }}
          />
        </div>
      ))}
    </div>
  )
}
