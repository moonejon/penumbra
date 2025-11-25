'use client'

import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface BackButtonProps {
  label?: string
  onClick?: () => void
  className?: string
}

export const BackButton = ({
  label = 'Back',
  onClick,
  className,
}: BackButtonProps) => {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.back()
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'inline-flex items-center gap-1 px-2 py-1.5',
        'text-zinc-500 hover:text-zinc-300',
        'transition-colors duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2',
        className
      )}
      aria-label={label}
    >
      <ChevronLeft size={16} />
      <span className="text-sm">{label}</span>
    </button>
  )
}

BackButton.displayName = 'BackButton'
