import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { StatCard } from '@/components/ui/stat-card'
import { Users } from 'lucide-react'

describe('StatCard', () => {
  it('should render title and value', () => {
    render(<StatCard title="Total Users" value={42} />)
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()
  })

  it('should render string value', () => {
    render(<StatCard title="Status" value="Active" />)
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should render icon when provided', () => {
    const { container } = render(<StatCard title="Users" value={10} icon={Users} />)
    const svg = container.querySelector('svg')
    expect(svg).toBeInTheDocument()
  })

  it('should not render icon when not provided', () => {
    const { container } = render(<StatCard title="Users" value={10} />)
    const svg = container.querySelector('svg')
    expect(svg).not.toBeInTheDocument()
  })

  it('should render description when provided', () => {
    render(<StatCard title="Revenue" value="$50k" description="This month" />)
    expect(screen.getByText('This month')).toBeInTheDocument()
  })

  it('should not render description when not provided', () => {
    render(<StatCard title="Revenue" value="$50k" />)
    expect(screen.queryByText('This month')).not.toBeInTheDocument()
  })

  it('should render positive trend', () => {
    render(<StatCard title="Sales" value={100} trend={{ value: 12, label: 'vs last month' }} />)
    expect(screen.getByText('+12% vs last month')).toBeInTheDocument()
  })

  it('should render negative trend', () => {
    render(<StatCard title="Sales" value={100} trend={{ value: -5, label: 'vs last month' }} />)
    expect(screen.getByText('-5% vs last month')).toBeInTheDocument()
  })

  it('should render zero trend as positive', () => {
    render(<StatCard title="Sales" value={100} trend={{ value: 0, label: 'vs last month' }} />)
    expect(screen.getByText('+0% vs last month')).toBeInTheDocument()
  })

  it('should not render trend when not provided', () => {
    const { container } = render(<StatCard title="Sales" value={100} />)
    expect(container.textContent).not.toContain('vs last month')
  })

  it('should apply custom className', () => {
    const { container } = render(<StatCard title="Test" value={1} className="my-class" />)
    expect(container.firstElementChild?.className).toContain('my-class')
  })
})
