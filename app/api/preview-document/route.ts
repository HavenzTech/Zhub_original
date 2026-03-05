// app/api/preview-document/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join, resolve, basename } from 'path'
import { existsSync } from 'fs'

const DOCUMENTS_BASE = join(process.cwd(), '..', 'agentic_ai', 'tools', 'utils', 'gdrive_downloads', 'documents')

export async function GET(request: NextRequest) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const authCookie = request.cookies.get('auth-token')?.value
  if (!authHeader && !authCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const searchParams = request.nextUrl.searchParams
    const fileName = searchParams.get('name')

    if (!fileName) {
      return new NextResponse('Missing file name', { status: 400 })
    }

    // Sanitize: only allow the basename to prevent path traversal
    const safeName = basename(fileName)

    // Path to gdrive_downloads folder
    const filePath = join(DOCUMENTS_BASE, safeName)

    // Security check: ensure resolved path is within the allowed directory
    const resolvedPath = resolve(filePath)
    const resolvedBase = resolve(DOCUMENTS_BASE)
    if (!resolvedPath.startsWith(resolvedBase)) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 403 })
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 })
    }

    // Read the file
    const fileBuffer = await readFile(filePath)

    // Determine content type based on file extension
    const ext = safeName.split('.').pop()?.toLowerCase()
    let contentType = 'application/octet-stream'

    if (ext === 'pdf') contentType = 'application/pdf'
    else if (ext === 'png') contentType = 'image/png'
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg'
    else if (ext === 'webp') contentType = 'image/webp'

    // Convert Buffer to Uint8Array to satisfy NextResponse BodyInit typing
    const body = new Uint8Array(fileBuffer)

    // Return the file with proper headers
    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `inline; filename="${safeName}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
    })
  } catch (error) {
    console.error('[Preview API] Error:', error)
    return new NextResponse('Error previewing file', { status: 500 })
  }
}
