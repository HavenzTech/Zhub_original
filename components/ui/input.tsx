import * as React from 'react'

import { cn } from '@/lib/utils'
import { sanitizeInput } from '@/lib/utils/sanitize'

// Input types that should NOT be sanitized (non-text inputs)
const SKIP_SANITIZE_TYPES = new Set([
  'password', 'email', 'number', 'date', 'datetime-local',
  'time', 'file', 'checkbox', 'radio', 'range', 'color', 'hidden',
])

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, onChange, ...props }, ref) => {
    const shouldSanitize = !SKIP_SANITIZE_TYPES.has(type || 'text')

    const handleChange = React.useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (shouldSanitize) {
          const sanitized = sanitizeInput(e.target.value)
          if (sanitized !== e.target.value) {
            e.target.value = sanitized
          }
        }
        onChange?.(e)
      },
      [onChange, shouldSanitize],
    )

    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 px-3 py-2 text-base text-stone-900 dark:text-stone-50 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan/50 focus-visible:border-accent-cyan disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-stone-900 dark:file:text-stone-50 md:text-sm',
          className,
        )}
        ref={ref}
        onChange={handleChange}
        {...props}
      />
    )
  },
)
Input.displayName = 'Input'

export { Input }
