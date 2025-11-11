import React from 'react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-4 py-12 text-center',
        className
      )}
    >
      {icon && (
        <div className="text-zinc-600">
          {icon}
        </div>
      )}

      <h3 className="text-lg font-medium text-zinc-300">
        {title}
      </h3>

      {description && (
        <p className="text-sm text-zinc-500">
          {description}
        </p>
      )}

      {action && (
        <Button onClick={action.onClick} className="mt-2">
          {action.label}
        </Button>
      )}
    </div>
  )
}
