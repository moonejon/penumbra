'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Check, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface YearFilterDropdownProps {
  value: 'all-time' | number
  onChange: (year: 'all-time' | number) => void
  availableYears: number[]
  className?: string
}

export const YearFilterDropdown = React.forwardRef<
  HTMLDivElement,
  YearFilterDropdownProps
>(({ value, onChange, availableYears, className }, ref) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [isOpen])

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      setIsOpen(!isOpen)
    } else if (event.key === 'ArrowDown' && isOpen) {
      event.preventDefault()
      // Focus first option
      const firstOption = dropdownRef.current?.querySelector(
        '[role="option"]'
      ) as HTMLElement
      firstOption?.focus()
    }
  }

  // Handle option keyboard navigation
  const handleOptionKeyDown = (
    event: React.KeyboardEvent,
    optionValue: 'all-time' | number,
    index: number
  ) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onChange(optionValue)
      setIsOpen(false)
      triggerRef.current?.focus()
    } else if (event.key === 'ArrowDown') {
      event.preventDefault()
      const nextOption = dropdownRef.current?.querySelectorAll(
        '[role="option"]'
      )[index + 1] as HTMLElement
      nextOption?.focus()
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      if (index === 0) {
        triggerRef.current?.focus()
      } else {
        const prevOption = dropdownRef.current?.querySelectorAll(
          '[role="option"]'
        )[index - 1] as HTMLElement
        prevOption?.focus()
      }
    } else if (event.key === 'Escape') {
      setIsOpen(false)
      triggerRef.current?.focus()
    }
  }

  // Format display value
  const displayValue = value === 'all-time' ? 'all time' : value.toString()

  // Sort years in descending order
  const sortedYears = [...availableYears].sort((a, b) => b - a)

  // Create options array
  const options: Array<{ value: 'all-time' | number; label: string }> = [
    { value: 'all-time', label: 'all time' },
    ...sortedYears.map((year) => ({
      value: year,
      label: year.toString(),
    })),
  ]

  return (
    <div ref={ref} className={cn('relative inline-block', className)}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={`Filter favorites by year: ${displayValue}`}
        className={cn(
          'inline-flex items-center gap-1',
          'text-zinc-100 hover:text-zinc-300',
          'underline decoration-zinc-600 decoration-2 underline-offset-4',
          'hover:decoration-zinc-400',
          'transition-colors duration-200',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900',
          'rounded px-1'
        )}
      >
        <span className="font-medium">{displayValue}</span>
        <ChevronDown
          className={cn(
            'w-4 h-4 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={dropdownRef}
            role="listbox"
            aria-label="Year filter options"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
            }}
            className={cn(
              'absolute top-full left-0 mt-2 z-50',
              'min-w-[140px] py-2',
              'bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl',
              'overflow-hidden'
            )}
          >
            {options.map((option, index) => {
              const isSelected = option.value === value

              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value)
                    setIsOpen(false)
                    triggerRef.current?.focus()
                  }}
                  onKeyDown={(e) => handleOptionKeyDown(e, option.value, index)}
                  tabIndex={0}
                  className={cn(
                    'w-full px-4 py-2.5',
                    'flex items-center justify-between gap-3',
                    'text-left text-sm',
                    'transition-colors duration-150',
                    isSelected
                      ? 'bg-zinc-600 text-zinc-100'
                      : 'bg-transparent text-zinc-300 hover:bg-zinc-700',
                    'focus-visible:outline-none focus-visible:bg-zinc-700'
                  )}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <Check className="w-4 h-4 text-zinc-100" aria-hidden="true" />
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

YearFilterDropdown.displayName = 'YearFilterDropdown'
