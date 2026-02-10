import * as React from 'react'
import { cn } from '@/lib/utils'

const DOC_TYPE_CONFIG = {
  DWG: { label: 'DWG', name: 'Drawing', color: 'bg-doc-type-dwg' },
  SPEC: { label: 'SPEC', name: 'Specification', color: 'bg-doc-type-spec' },
  LEASE: { label: 'LEASE', name: 'Lease Agreement', color: 'bg-doc-type-lease' },
  POL: { label: 'POL', name: 'Policy', color: 'bg-doc-type-pol' },
  CON: { label: 'CON', name: 'Contract', color: 'bg-doc-type-con' },
  MAN: { label: 'MAN', name: 'Manual', color: 'bg-doc-type-man' },
  CERT: { label: 'CERT', name: 'Certificate', color: 'bg-doc-type-cert' },
  RFI: { label: 'RFI', name: 'RFI', color: 'bg-doc-type-rfi' },
  SUB: { label: 'SUB', name: 'Submittal', color: 'bg-doc-type-sub' },
  INV: { label: 'INV', name: 'Invoice', color: 'bg-doc-type-inv' },
} as const

export type DocumentTypeCode = keyof typeof DOC_TYPE_CONFIG

interface DocumentTypeBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  type: string
  showName?: boolean
}

function DocumentTypeBadge({ type, showName = false, className, ...props }: DocumentTypeBadgeProps) {
  const config = DOC_TYPE_CONFIG[type as DocumentTypeCode]
  if (!config) {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded px-1.5 py-0.5 text-[11px] font-bold text-white bg-stone-500',
          className,
        )}
        {...props}
      >
        {type}
      </span>
    )
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] font-bold',
        className,
      )}
      {...props}
    >
      <span className={cn('rounded px-1.5 py-0.5 text-white', config.color)}>
        {config.label}
      </span>
      {showName && <span className="text-muted-foreground font-normal">{config.name}</span>}
    </span>
  )
}

export { DocumentTypeBadge, DOC_TYPE_CONFIG }
