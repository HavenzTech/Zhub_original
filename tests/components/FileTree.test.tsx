import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FileTree, type FileTreeNode } from '@/components/ui/file-tree'

const mockNodes: FileTreeNode[] = [
  {
    id: 'folder-1',
    name: 'Documents',
    type: 'folder',
    documentCount: 5,
    children: [
      { id: 'file-1', name: 'report.pdf', type: 'file' },
      { id: 'file-2', name: 'budget.xlsx', type: 'file' },
    ],
  },
  {
    id: 'folder-2',
    name: 'Images',
    type: 'folder',
    documentCount: 0,
    children: [],
  },
  { id: 'file-3', name: 'readme.txt', type: 'file' },
]

describe('FileTree', () => {
  it('should render top-level nodes', () => {
    render(<FileTree nodes={mockNodes} />)
    expect(screen.getByText('Documents')).toBeInTheDocument()
    expect(screen.getByText('Images')).toBeInTheDocument()
    expect(screen.getByText('readme.txt')).toBeInTheDocument()
  })

  it('should show document count for folders with documents', () => {
    render(<FileTree nodes={mockNodes} />)
    expect(screen.getByText('5')).toBeInTheDocument()
  })

  it('should not show document count for folders with 0 documents', () => {
    render(<FileTree nodes={mockNodes} />)
    // "Images" folder has documentCount: 0, should not display it
    expect(screen.queryByText('0')).not.toBeInTheDocument()
  })

  it('should not show children when folder is collapsed', () => {
    render(<FileTree nodes={mockNodes} expandedIds={new Set()} />)
    expect(screen.queryByText('report.pdf')).not.toBeInTheDocument()
    expect(screen.queryByText('budget.xlsx')).not.toBeInTheDocument()
  })

  it('should show children when folder is expanded', () => {
    render(<FileTree nodes={mockNodes} expandedIds={new Set(['folder-1'])} />)
    expect(screen.getByText('report.pdf')).toBeInTheDocument()
    expect(screen.getByText('budget.xlsx')).toBeInTheDocument()
  })

  it('should call onToggle when folder is clicked', () => {
    const onToggle = vi.fn()
    render(<FileTree nodes={mockNodes} expandedIds={new Set()} onToggle={onToggle} />)
    fireEvent.click(screen.getByText('Documents'))
    expect(onToggle).toHaveBeenCalledWith('folder-1')
  })

  it('should call onSelect when any node is clicked', () => {
    const onSelect = vi.fn()
    render(<FileTree nodes={mockNodes} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('readme.txt'))
    expect(onSelect).toHaveBeenCalledWith(mockNodes[2])
  })

  it('should call onSelect when folder is clicked', () => {
    const onSelect = vi.fn()
    render(<FileTree nodes={mockNodes} expandedIds={new Set()} onSelect={onSelect} />)
    fireEvent.click(screen.getByText('Documents'))
    expect(onSelect).toHaveBeenCalledWith(mockNodes[0])
  })

  it('should highlight selected node', () => {
    render(<FileTree nodes={mockNodes} selectedId="file-3" />)
    const button = screen.getByText('readme.txt').closest('button')
    expect(button?.className).toContain('bg-accent-cyan')
  })

  it('should not highlight unselected nodes', () => {
    render(<FileTree nodes={mockNodes} selectedId="file-3" />)
    const button = screen.getByText('Documents').closest('button')
    expect(button?.className).not.toContain('bg-accent-cyan')
  })

  it('should render empty tree without errors', () => {
    const { container } = render(<FileTree nodes={[]} />)
    expect(container.firstElementChild).toBeInTheDocument()
  })

  it('should apply custom className', () => {
    const { container } = render(<FileTree nodes={mockNodes} className="my-class" />)
    expect(container.firstElementChild?.className).toContain('my-class')
  })
})
