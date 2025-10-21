import { NextRequest, NextResponse } from 'next/server'
import { unlink, rmdir, stat } from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_PATH } from '../../../config/paths'

async function deleteRecursively(dirPath: string): Promise<void> {
  const { readdir } = await import('fs/promises')

  try {
    const entries = await readdir(dirPath, { withFileTypes: true })

    // Delete all contents first
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)

      if (entry.isDirectory()) {
        await deleteRecursively(fullPath)
      } else {
        await unlink(fullPath)
      }
    }

    // Then delete the empty directory
    await rmdir(dirPath)
  } catch (error) {
    console.error(`Error deleting directory ${dirPath}:`, error)
    throw error
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const itemPath = searchParams.get('path')
    const itemType = searchParams.get('type')

    if (!itemPath) {
      return NextResponse.json(
        { success: false, error: 'Path parameter is required' },
        { status: 400 }
      )
    }

    // Construct the full path
    const fullPath = path.join(UPLOAD_BASE_PATH, itemPath)

    // Security check: ensure the path is within our allowed directory
    const resolvedPath = path.resolve(fullPath)
    const resolvedBasePath = path.resolve(UPLOAD_BASE_PATH)

    if (!resolvedPath.startsWith(resolvedBasePath)) {
      return NextResponse.json(
        { success: false, error: 'Invalid path' },
        { status: 403 }
      )
    }

    // Check if item exists and get its stats
    let itemStats
    try {
      itemStats = await stat(fullPath)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Item not found' },
        { status: 404 }
      )
    }

    // Delete the item
    if (itemStats.isDirectory()) {
      await deleteRecursively(fullPath)
      console.log(`Folder deleted: ${fullPath}`)
      return NextResponse.json({
        success: true,
        message: `Folder "${path.basename(itemPath)}" and all its contents deleted successfully`,
        type: 'folder'
      })
    } else {
      await unlink(fullPath)
      console.log(`File deleted: ${fullPath}`)
      return NextResponse.json({
        success: true,
        message: `File "${path.basename(itemPath)}" deleted successfully`,
        type: 'file'
      })
    }

  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { success: false, error: 'Delete operation failed' },
      { status: 500 }
    )
  }
}