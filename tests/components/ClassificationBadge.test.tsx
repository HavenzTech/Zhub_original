import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClassificationBadge, CLASSIFICATION_CONFIG } from '@/components/ui/classification-badge'

describe('ClassificationBadge', () => {
  it('should render the label for a known level', () => {
    render(<ClassificationBadge level="public" />)
    expect(screen.getByText('Public')).toBeInTheDocument()
  })

  it('should render each known classification level', () => {
    const levels = Object.keys(CLASSIFICATION_CONFIG) as Array<keyof typeof CLASSIFICATION_CONFIG>
    for (const level of levels) {
      const { unmount } = render(<ClassificationBadge level={level} />)
      expect(screen.getByText(CLASSIFICATION_CONFIG[level].label)).toBeInTheDocument()
      unmount()
    }
  })

  it('should return null for unknown level', () => {
    const { container } = render(<ClassificationBadge level="nonexistent" />)
    expect(container.innerHTML).toBe('')
  })

  it('should show shield icon by default', () => {
    const { container } = render(<ClassificationBadge level="confidential" />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should hide icon when showIcon is false', () => {
    const { container } = render(<ClassificationBadge level="confidential" showIcon={false} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    render(<ClassificationBadge level="restricted" className="my-class" />)
    const badge = screen.getByText('Restricted').closest('span')
    expect(badge?.className).toContain('my-class')
  })

  it('should pass through extra HTML attributes', () => {
    render(<ClassificationBadge level="internal" data-testid="class-badge" />)
    expect(screen.getByTestId('class-badge')).toBeInTheDocument()
  })
})
