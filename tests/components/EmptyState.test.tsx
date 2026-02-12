import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { EmptyState, EmptyStateCard } from '@/components/common/EmptyState'
import { FileText, Plus } from 'lucide-react'

describe('EmptyState', () => {
  it('should render title and description', () => {
    render(<EmptyState icon={FileText} title="No documents" description="Upload your first document" />)
    expect(screen.getByText('No documents')).toBeInTheDocument()
    expect(screen.getByText('Upload your first document')).toBeInTheDocument()
  })

  it('should render the icon', () => {
    const { container } = render(
      <EmptyState icon={FileText} title="No docs" description="None found" />
    )
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should render action button when provided', () => {
    const onClick = vi.fn()
    render(
      <EmptyState
        icon={FileText}
        title="No docs"
        description="None found"
        action={{ label: 'Upload', onClick }}
      />
    )
    const button = screen.getByRole('button', { name: /upload/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('should not render action button when not provided', () => {
    render(<EmptyState icon={FileText} title="No docs" description="None found" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(
      <EmptyState icon={FileText} title="Test" description="Test" className="my-class" />
    )
    expect(container.firstElementChild?.className).toContain('my-class')
  })
})

describe('EmptyStateCard', () => {
  it('should render inside a bordered card', () => {
    const { container } = render(
      <EmptyStateCard icon={FileText} title="No docs" description="None found" />
    )
    expect(container.firstElementChild?.className).toContain('border')
    expect(screen.getByText('No docs')).toBeInTheDocument()
  })
})
