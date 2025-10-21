import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_PATH } from '../../../config/paths'

// File size limits (in bytes)
const MAX_TEXT_SIZE = 1024 * 1024 // 1MB for text files
const MAX_PDF_SIZE = 50 * 1024 * 1024 // 50MB for PDFs
const MAX_DOCX_SIZE = 10 * 1024 * 1024 // 10MB for DOCX

interface FileMetadata {
  name: string
  size: number
  type: string
  lastModified: string
  extension: string
}

function getFileType(extension: string): string {
  const ext = extension.toLowerCase()
  switch (ext) {
    case '.txt':
    case '.md':
    case '.json':
    case '.xml':
    case '.csv':
    case '.log':
      return 'text'
    case '.pdf':
      return 'pdf'
    case '.docx':
    case '.doc':
      return 'docx'
    default:
      return 'unsupported'
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filePath = searchParams.get('path')

    if (!filePath) {
      return NextResponse.json(
        { success: false, error: 'File path parameter is required' },
        { status: 400 }
      )
    }

    // Construct the full path
    const fullPath = path.join(UPLOAD_BASE_PATH, filePath)

    // Security check: ensure the path is within our allowed directory
    const resolvedPath = path.resolve(fullPath)
    const resolvedBasePath = path.resolve(UPLOAD_BASE_PATH)

    if (!resolvedPath.startsWith(resolvedBasePath)) {
      return NextResponse.json(
        { success: false, error: 'Invalid file path' },
        { status: 403 }
      )
    }

    // Get file stats
    let fileStats
    try {
      fileStats = await stat(fullPath)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'File not found' },
        { status: 404 }
      )
    }

    // Check if it's a file (not directory)
    if (!fileStats.isFile()) {
      return NextResponse.json(
        { success: false, error: 'Path is not a file' },
        { status: 400 }
      )
    }

    const fileName = path.basename(fullPath)
    const extension = path.extname(fileName)
    const fileType = getFileType(extension)

    const metadata: FileMetadata = {
      name: fileName,
      size: fileStats.size,
      type: fileType,
      lastModified: fileStats.mtime.toISOString(),
      extension: extension
    }

    // Handle different file types
    switch (fileType) {
      case 'text':
        if (fileStats.size > MAX_TEXT_SIZE) {
          return NextResponse.json({
            success: true,
            type: 'text',
            metadata,
            content: null,
            error: `File too large. Maximum size for text files is ${MAX_TEXT_SIZE / 1024 / 1024}MB`
          })
        }

        try {
          const content = await readFile(fullPath, 'utf-8')
          return NextResponse.json({
            success: true,
            type: 'text',
            metadata,
            content: content
          })
        } catch (error) {
          return NextResponse.json({
            success: true,
            type: 'text',
            metadata,
            content: null,
            error: 'Failed to read file content'
          })
        }

      case 'pdf':
        if (fileStats.size > MAX_PDF_SIZE) {
          return NextResponse.json({
            success: true,
            type: 'pdf',
            metadata,
            error: `PDF file too large. Maximum size is ${MAX_PDF_SIZE / 1024 / 1024}MB`
          })
        }

        // For PDFs, we'll return the file path for the browser to handle
        return NextResponse.json({
          success: true,
          type: 'pdf',
          metadata,
          downloadUrl: `/api/download?path=${encodeURIComponent(filePath)}`
        })

      case 'docx':
        if (fileStats.size > MAX_DOCX_SIZE) {
          return NextResponse.json({
            success: true,
            type: 'docx',
            metadata,
            error: `DOCX file too large. Maximum size is ${MAX_DOCX_SIZE / 1024 / 1024}MB`
          })
        }

        // For DOCX, we'll need to extract text content or return download URL
        return NextResponse.json({
          success: true,
          type: 'docx',
          metadata,
          downloadUrl: `/api/download?path=${encodeURIComponent(filePath)}`,
          note: 'DOCX preview requires download or external viewer'
        })

      default:
        return NextResponse.json({
          success: true,
          type: 'unsupported',
          metadata,
          downloadUrl: `/api/download?path=${encodeURIComponent(filePath)}`
        })
    }

  } catch (error) {
    console.error('Preview error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to preview file' },
      { status: 500 }
    )
  }
}