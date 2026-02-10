'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { ChevronRight, ChevronDown, Folder, FolderOpen, FileText } from 'lucide-react'

export interface FileTreeNode {
  id: string
  name: string
  type: 'folder' | 'file'
  children?: FileTreeNode[]
  documentCount?: number
  metadata?: Record<string, unknown>
}

interface FileTreeProps {
  nodes: FileTreeNode[]
  selectedId?: string | null
  onSelect?: (node: FileTreeNode) => void
  expandedIds?: Set<string>
  onToggle?: (nodeId: string) => void
  depth?: number
  className?: string
}

function FileTree({
  nodes,
  selectedId,
  onSelect,
  expandedIds,
  onToggle,
  depth = 0,
  className,
}: FileTreeProps) {
  return (
    <div className={cn('text-sm', depth === 0 && 'space-y-0.5', className)}>
      {nodes.map((node) => (
        <FileTreeItem
          key={node.id}
          node={node}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
          depth={depth}
        />
      ))}
    </div>
  )
}

interface FileTreeItemProps {
  node: FileTreeNode
  selectedId?: string | null
  onSelect?: (node: FileTreeNode) => void
  expandedIds?: Set<string>
  onToggle?: (nodeId: string) => void
  depth: number
}

function FileTreeItem({
  node,
  selectedId,
  onSelect,
  expandedIds,
  onToggle,
  depth,
}: FileTreeItemProps) {
  const isExpanded = expandedIds?.has(node.id) ?? false
  const isSelected = selectedId === node.id
  const isFolder = node.type === 'folder'

  const handleClick = () => {
    if (isFolder && onToggle) {
      onToggle(node.id)
    }
    onSelect?.(node)
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left transition-colors',
          'hover:bg-stone-100 dark:hover:bg-stone-800',
          isSelected && 'bg-accent-cyan/10 text-accent-cyan dark:bg-accent-cyan/20',
          !isSelected && 'text-foreground',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {isFolder ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 shrink-0 text-accent-cyan" />
            ) : (
              <Folder className="h-4 w-4 shrink-0 text-accent-cyan" />
            )}
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="truncate text-[13px]">{node.name}</span>
        {isFolder && node.documentCount != null && node.documentCount > 0 && (
          <span className="ml-auto text-[11px] text-muted-foreground">
            {node.documentCount}
          </span>
        )}
      </button>
      {isFolder && isExpanded && node.children && node.children.length > 0 && (
        <FileTree
          nodes={node.children}
          selectedId={selectedId}
          onSelect={onSelect}
          expandedIds={expandedIds}
          onToggle={onToggle}
          depth={depth + 1}
        />
      )}
    </div>
  )
}

export { FileTree }
