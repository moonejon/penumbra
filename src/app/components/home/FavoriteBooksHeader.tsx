'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FavoriteBooksHeaderProps {
  yearFilter: 'all-time' | number
  onYearChange: (year: 'all-time' | number) => void
  availableYears: number[]
  isOwner: boolean
  className?: string
}

export const FavoriteBooksHeader = React.forwardRef<
  HTMLDivElement,
  FavoriteBooksHeaderProps
>(
  (
    {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      yearFilter,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      onYearChange,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      availableYears,
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      isOwner,
      className,
    },
    ref
  ) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex flex-col md:flex-row md:items-baseline gap-2 md:gap-3',
        className
      )}
    >
      {/* Title */}
      <h2 className="text-3xl md:text-4xl font-bold text-zinc-100">
        Personal Recommendations
      </h2>

      {/* Inline dropdown with "of" prefix - COMMENTED OUT FOR NOW */}
      {/* <div className="flex items-baseline gap-2 text-xl md:text-2xl">
        <span className="text-zinc-400 font-normal">of</span>
        <YearFilterDropdown
          value={yearFilter}
          onChange={onYearChange}
          availableYears={availableYears}
        />
      </div> */}
    </div>
  )
})

FavoriteBooksHeader.displayName = 'FavoriteBooksHeader'
