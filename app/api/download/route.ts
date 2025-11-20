import { NextRequest, NextResponse } from 'next/server'
import { readFile, stat } from 'fs/promises'
import path from 'path'
import { UPLOAD_BASE_PATH } from '../../../config/paths'

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

    // Check if it's a file
    if (!fileStats.isFile()) {
      return NextResponse.json(
        { success: false, error: 'Path is not a file' },
        { status: 400 }
      )
    }

    // Read and serve the file
    const fileName = path.basename(fullPath)
    const fileBuffer = await readFile(fullPath)

    // Convert Buffer to Uint8Array for BodyInit compatibility
    const body = new Uint8Array(fileBuffer)

    // Determine content type
    const extension = path.extname(fileName).toLowerCase()
    let contentType = 'application/octet-stream'

    switch (extension) {
      case '.pdf':
        contentType = 'application/pdf'
        break
      case '.txt':
        contentType = 'text/plain'
        break
      case '.json':
        contentType = 'application/json'
        break
      case '.xml':
        contentType = 'application/xml'
        break
      case '.docx':
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        break
      case '.doc':
        contentType = 'application/msword'
        break
      default:
        contentType = 'application/octet-stream'
    }

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Content-Length': fileStats.size.toString(),
      },
    })

  } catch (error) {
    console.error('Download error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to download file' },
      { status: 500 }
    )
  }
}