import * as React from 'react'
import { cn } from '@/lib/utils'

const STATUS_CONFIG = {
  draft: { label: 'Draft', className: 'bg-doc-status-draft-bg text-doc-status-draft dark:bg-stone-800 dark:text-stone-300' },
  pending_review: { label: 'Pending Review', className: 'bg-doc-status-pending-review-bg text-doc-status-pending-review dark:bg-amber-950 dark:text-amber-400' },
  approved: { label: 'Approved', className: 'bg-doc-status-approved-bg text-doc-status-approved dark:bg-emerald-950 dark:text-emerald-400' },
  published: { label: 'Published', className: 'bg-doc-status-published-bg text-doc-status-published dark:bg-blue-950 dark:text-blue-400' },
  archived: { label: 'Archived', className: 'bg-doc-status-archived-bg text-doc-status-archived dark:bg-gray-800 dark:text-gray-400' },
  obsolete: { label: 'Obsolete', className: 'bg-doc-status-obsolete-bg text-doc-status-obsolete dark:bg-red-950 dark:text-red-400' },
} as const

export type DocumentStatus = keyof typeof STATUS_CONFIG

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: string
  size?: 'sm' | 'md'
}

function StatusBadge({ status, size = 'sm', className, ...props }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status as DocumentStatus]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
      {...props}
    >
      {config.label}
    </span>
  )
}

export { StatusBadge, STATUS_CONFIG }
