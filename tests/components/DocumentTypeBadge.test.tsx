import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DocumentTypeBadge, DOC_TYPE_CONFIG } from '@/components/ui/document-type-badge'

describe('DocumentTypeBadge', () => {
  it('should render the label for a known type', () => {
    render(<DocumentTypeBadge type="DWG" />)
    expect(screen.getByText('DWG')).toBeInTheDocument()
  })

  it('should render each known document type', () => {
    const types = Object.keys(DOC_TYPE_CONFIG) as Array<keyof typeof DOC_TYPE_CONFIG>
    for (const type of types) {
      const { unmount } = render(<DocumentTypeBadge type={type} />)
      expect(screen.getByText(DOC_TYPE_CONFIG[type].label)).toBeInTheDocument()
      unmount()
    }
  })

  it('should render unknown type with fallback styling', () => {
    render(<DocumentTypeBadge type="UNKNOWN" />)
    const badge = screen.getByText('UNKNOWN')
    expect(badge).toBeInTheDocument()
    expect(badge.className).toContain('bg-stone-500')
  })

  it('should not show name by default', () => {
    render(<DocumentTypeBadge type="DWG" />)
    expect(screen.queryByText('Drawing')).not.toBeInTheDocument()
  })

  it('should show name when showName is true', () => {
    render(<DocumentTypeBadge type="DWG" showName />)
    expect(screen.getByText('DWG')).toBeInTheDocument()
    expect(screen.getByText('Drawing')).toBeInTheDocument()
  })

  it('should show name for each type when showName is true', () => {
    const types = Object.keys(DOC_TYPE_CONFIG) as Array<keyof typeof DOC_TYPE_CONFIG>
    for (const type of types) {
      const { unmount, container } = render(<DocumentTypeBadge type={type} showName />)
      // Check that the name text appears somewhere in the rendered output
      expect(container.textContent).toContain(DOC_TYPE_CONFIG[type].name)
      unmount()
    }
  })

  it('should apply custom className', () => {
    render(<DocumentTypeBadge type="SPEC" className="my-class" data-testid="badge" />)
    const badge = screen.getByTestId('badge')
    expect(badge.className).toContain('my-class')
  })

  it('should pass through extra HTML attributes', () => {
    render(<DocumentTypeBadge type="DWG" data-testid="doc-type" />)
    expect(screen.getByTestId('doc-type')).toBeInTheDocument()
  })
})
