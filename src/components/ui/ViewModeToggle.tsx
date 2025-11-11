'use client'

import * as React from 'react'
import { List, LayoutGrid } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ViewModeToggleProps {
  mode: 'list' | 'grid'
  onChange: (mode: 'list' | 'grid') => void
  className?: string
}

const ViewModeToggle = React.forwardRef<HTMLDivElement, ViewModeToggleProps>(
  ({ mode, onChange, className }, ref) => {
    return (
      <div
        ref={ref}
        role="group"
        aria-label="View mode toggle"
        className={cn(
          'flex items-center gap-0 border border-zinc-800 rounded-lg',
          className
        )}
      >
        {/* List View Button */}
        <button
          onClick={() => onChange('list')}
          aria-pressed={mode === 'list'}
          aria-label="Switch to list view"
          className={cn(
            'flex items-center justify-center h-8 w-8 transition-colors',
            mode === 'list'
              ? 'text-zinc-100 bg-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          <List size={16} strokeWidth={2} aria-hidden="true" />
        </button>

        {/* Grid View Button */}
        <button
          onClick={() => onChange('grid')}
          aria-pressed={mode === 'grid'}
          aria-label="Switch to grid view"
          className={cn(
            'flex items-center justify-center h-8 w-8 transition-colors',
            mode === 'grid'
              ? 'text-zinc-100 bg-zinc-800'
              : 'text-zinc-500 hover:text-zinc-300'
          )}
        >
          <LayoutGrid size={16} strokeWidth={2} aria-hidden="true" />
        </button>
      </div>
    )
  }
)

ViewModeToggle.displayName = 'ViewModeToggle'

export { ViewModeToggle, type ViewModeToggleProps }
