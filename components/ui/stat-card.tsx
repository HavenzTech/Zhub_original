'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  icon?: LucideIcon
  description?: string
  trend?: { value: number; label: string }
}

function StatCard({ title, value, icon: Icon, description, trend, className, ...props }: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border bg-card p-5 transition-shadow hover:shadow-md',
        'dark:border-stone-700 dark:bg-stone-900',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {Icon && (
          <Icon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={cn(
            'mt-1 text-xs font-medium',
            trend.value >= 0 ? 'text-doc-status-approved' : 'text-doc-status-obsolete',
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
          </p>
        )}
      </div>
    </div>
  )
}

export { StatCard }
