import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ErrorDisplay, ErrorDisplayCentered } from '@/components/common/ErrorDisplay'

describe('ErrorDisplay', () => {
  it('should render default title and message', () => {
    render(<ErrorDisplay message="Something broke" />)
    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(screen.getByText('Something broke')).toBeInTheDocument()
  })

  it('should render custom title', () => {
    render(<ErrorDisplay title="Network Error" message="Could not connect" />)
    expect(screen.getByText('Network Error')).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorDisplay message="Failed" onRetry={onRetry} />)
    const button = screen.getByRole('button', { name: /try again/i })
    expect(button).toBeInTheDocument()
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should not render retry button when onRetry is not provided', () => {
    render(<ErrorDisplay message="Failed" />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<ErrorDisplay message="Error" className="my-class" />)
    const alert = container.querySelector('[role="alert"]')
    expect(alert?.className).toContain('my-class')
  })
})

describe('ErrorDisplayCentered', () => {
  it('should render with default title', () => {
    render(<ErrorDisplayCentered message="Server error" />)
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Server error')).toBeInTheDocument()
  })

  it('should render retry button when onRetry is provided', () => {
    const onRetry = vi.fn()
    render(<ErrorDisplayCentered message="Error" onRetry={onRetry} />)
    const button = screen.getByRole('button', { name: /try again/i })
    fireEvent.click(button)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('should be centered with min-height', () => {
    const { container } = render(<ErrorDisplayCentered message="Error" />)
    expect(container.firstElementChild?.className).toContain('min-h-[400px]')
  })
})
