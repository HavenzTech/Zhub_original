import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatusBadge, STATUS_CONFIG } from '@/components/ui/status-badge'

describe('StatusBadge', () => {
  it('should render the label for a known status', () => {
    render(<StatusBadge status="draft" />)
    expect(screen.getByText('Draft')).toBeInTheDocument()
  })

  it('should render each known status', () => {
    const statuses = Object.keys(STATUS_CONFIG) as Array<keyof typeof STATUS_CONFIG>
    for (const status of statuses) {
      const { unmount } = render(<StatusBadge status={status} />)
      expect(screen.getByText(STATUS_CONFIG[status].label)).toBeInTheDocument()
      unmount()
    }
  })

  it('should return null for unknown status', () => {
    const { container } = render(<StatusBadge status="nonexistent" />)
    expect(container.innerHTML).toBe('')
  })

  it('should apply sm size classes by default', () => {
    render(<StatusBadge status="approved" />)
    const badge = screen.getByText('Approved')
    expect(badge.className).toContain('text-[11px]')
  })

  it('should apply md size classes', () => {
    render(<StatusBadge status="approved" size="md" />)
    const badge = screen.getByText('Approved')
    expect(badge.className).toContain('text-xs')
  })

  it('should apply custom className', () => {
    render(<StatusBadge status="draft" className="my-custom-class" />)
    const badge = screen.getByText('Draft')
    expect(badge.className).toContain('my-custom-class')
  })

  it('should pass through extra HTML attributes', () => {
    render(<StatusBadge status="draft" data-testid="status" />)
    expect(screen.getByTestId('status')).toBeInTheDocument()
  })
})
