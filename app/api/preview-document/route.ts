// app/api/preview-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('name')

    console.log('[Preview API] Request for file:', fileName)

    if (!fileName) {
      console.error('[Preview API] Missing file name')
      return new NextResponse('Missing file name', { status: 400 })
    }

    // Path to gdrive_downloads folder (relative to project root)
    const filePath = join(process.cwd(), '..', 'agentic_ai', 'tools', 'utils', 'gdrive_downloads', 'documents', fileName)

    console.log('[Preview API] Attempting to read from:', filePath)
    console.log('[Preview API] File exists:', existsSync(filePath))

    // Check if file exists first
    if (!existsSync(filePath)) {
      console.error('[Preview API] File not found:', filePath)
      return new NextResponse(`File not found: ${fileName}`, { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(filePath)
    console.log('[Preview API] File read successfully, size:', fileBuffer.length)

    // Determine content type based on file extension
    const ext = fileName.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'

    if (ext === 'pdf') contentType = 'application/pdf'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'webp') contentType = 'image/webp'

    // Return the file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })
  } catch (error) {
    console.error('[Preview API] Error:', error)
    return new NextResponse(`Error: ${error}`, { status: 500 })
  }
}
