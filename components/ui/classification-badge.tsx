import * as React from 'react'
import { cn } from '@/lib/utils'
import { Shield } from 'lucide-react'

const CLASSIFICATION_CONFIG = {
  public: { label: 'Public', className: 'text-classification-public bg-emerald-50 dark:bg-emerald-950' },
  internal: { label: 'Internal', className: 'text-classification-internal bg-blue-50 dark:bg-blue-950' },
  confidential: { label: 'Confidential', className: 'text-classification-confidential bg-amber-50 dark:bg-amber-950' },
  restricted: { label: 'Restricted', className: 'text-classification-restricted bg-red-50 dark:bg-red-950' },
} as const

export type ClassificationLevel = keyof typeof CLASSIFICATION_CONFIG

interface ClassificationBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  level: string
  showIcon?: boolean
}

function ClassificationBadge({ level, showIcon = true, className, ...props }: ClassificationBadgeProps) {
  const config = CLASSIFICATION_CONFIG[level as ClassificationLevel]
  if (!config) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium',
        config.className,
        className,
      )}
      {...props}
    >
      {showIcon && <Shield className="h-3 w-3" />}
      {config.label}
    </span>
  )
}

export { ClassificationBadge, CLASSIFICATION_CONFIG }
