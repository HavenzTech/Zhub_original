import { NextRequest, NextResponse } from 'next/server'
import { readdir, stat } from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_PATH } from '../../../config/paths'

interface FileNode {
  id: string
  name: string
  type: 'folder' | 'file'
  path: string
  size?: number
  lastModified?: string
  children?: FileNode[]
  isExpanded?: boolean
}

async function scanDirectory(dirPath: string, parentId: string = '', searchTerm?: string): Promise<FileNode[]> {
  const nodes: FileNode[] = []

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      const relativePath = path.relative(UPLOAD_BASE_PATH, fullPath)
      const nodeId = parentId ? `${parentId}/${entry.name}` : entry.name

      if (entry.isDirectory()) {
        // Recursively scan subdirectories first to check for matches
        let children: FileNode[] = []
        try {
          children = await scanDirectory(fullPath, nodeId, searchTerm)
        } catch (error) {
          console.log(`Error scanning subdirectory ${fullPath}:`, error)
          children = []
        }

        // Include folder if: no search term, folder name matches, or has matching children
        const folderMatches = !searchTerm || entry.name.toLowerCase().includes(searchTerm.toLowerCase())
        const hasMatchingChildren = children.length > 0

        if (!searchTerm || folderMatches || hasMatchingChildren) {
          const folderNode: FileNode = {
            id: nodeId,
            name: entry.name,
            type: 'folder',
            path: relativePath,
            isExpanded: searchTerm ? true : false, // Auto-expand during search
            children: children
          }
          nodes.push(folderNode)
        }
      } else if (entry.isFile()) {
        // Include file if: no search term or file name matches
        const fileMatches = !searchTerm || entry.name.toLowerCase().includes(searchTerm.toLowerCase())

        if (!searchTerm || fileMatches) {
          try {
            const stats = await stat(fullPath)
            const fileNode: FileNode = {
              id: nodeId,
              name: entry.name,
              type: 'file',
              path: relativePath,
              size: stats.size,
              lastModified: stats.mtime.toISOString()
            }
            nodes.push(fileNode)
          } catch (error) {
            console.log(`Error reading file stats for ${fullPath}:`, error)
          }
        }
      }
    }
  } catch (error) {
    console.log(`Error reading directory ${dirPath}:`, error)
  }

  return nodes.sort((a, b) => {
    // Folders first, then files
    if (a.type === 'folder' && b.type === 'file') return -1
    if (a.type === 'file' && b.type === 'folder') return 1
    return a.name.localeCompare(b.name)
  })
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const searchTerm = searchParams.get('search')

    const tree = await scanDirectory(UPLOAD_BASE_PATH, '', searchTerm || undefined)

    return NextResponse.json({
      success: true,
      searchTerm: searchTerm || null,
      tree: [{
        id: 'root-gdrive-downloads',
        name: 'Google Drive Downloads',
        type: 'folder' as const,
        path: '',
        isExpanded: true,
        children: tree
      }]
    })
  } catch (error) {
    console.error('Error scanning directory structure:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to read directory structure' },
      { status: 500 }
    )
  }
}