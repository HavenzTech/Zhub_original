import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, LoadingSpinnerCentered } from '@/components/common/LoadingSpinner'

describe('LoadingSpinner', () => {
  it('should render the spinner', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
    expect(svg?.getAttribute('class')).toContain('animate-spin')
  })

  it('should render text when provided', () => {
    render(<LoadingSpinner text="Loading data..." />)
    expect(screen.getByText('Loading data...')).toBeInTheDocument()
  })

  it('should not render text when not provided', () => {
    const { container } = render(<LoadingSpinner />)
    expect(container.querySelectorAll('p')).toHaveLength(0)
  })

  it('should apply sm size', () => {
    const { container } = render(<LoadingSpinner size="sm" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('w-4')
    expect(svg?.getAttribute('class')).toContain('h-4')
  })

  it('should apply md size by default', () => {
    const { container } = render(<LoadingSpinner />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('w-8')
    expect(svg?.getAttribute('class')).toContain('h-8')
  })

  it('should apply lg size', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('w-12')
    expect(svg?.getAttribute('class')).toContain('h-12')
  })

  it('should apply xl size', () => {
    const { container } = render(<LoadingSpinner size="xl" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('w-16')
    expect(svg?.getAttribute('class')).toContain('h-16')
  })

  it('should apply custom className', () => {
    const { container } = render(<LoadingSpinner className="text-red-500" />)
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toContain('text-red-500')
  })
})

describe('LoadingSpinnerCentered', () => {
  it('should render with default "Loading..." text', () => {
    render(<LoadingSpinnerCentered />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('should render with custom text', () => {
    render(<LoadingSpinnerCentered text="Please wait..." />)
    expect(screen.getByText('Please wait...')).toBeInTheDocument()
  })

  it('should be centered with min-height', () => {
    const { container } = render(<LoadingSpinnerCentered />)
    expect(container.firstElementChild?.className).toContain('min-h-[400px]')
  })
})
