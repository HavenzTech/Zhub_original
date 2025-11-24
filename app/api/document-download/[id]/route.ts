// API route to download documents from BMS backend with authentication
import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const BMS_API_BASE = process.env.NEXT_PUBLIC_BMS_API_BASE_URL || 'http://localhost:5087'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Get auth token and company ID from headers
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.replace('Bearer ', '')
    const companyId = request.headers.get('x-company-id')

    if (!token) {
      console.error('No authorization token found')
      return NextResponse.json({ error: 'Unauthorized - No token provided' }, { status: 401 })
    }

    if (!companyId) {
      console.error('No company ID found')
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    // First, get document metadata to get the storage path
    console.log(`[Document Download] Fetching document metadata for ID: ${id}`)
    console.log(`[Document Download] Company ID: ${companyId}`)
    console.log(`[Document Download] Using BMS API: ${BMS_API_BASE}/api/havenzhub/document/${id}`)

    const metadataResponse = await fetch(`${BMS_API_BASE}/api/havenzhub/document/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId,
        'Content-Type': 'application/json'
      }
    })

    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text()
      console.error(`[Document Download] Failed to fetch metadata: ${metadataResponse.status} - ${errorText}`)
      return NextResponse.json(
        { error: 'Document not found', details: errorText },
        { status: metadataResponse.status }
      )
    }

    const document = await metadataResponse.json()
    console.log(`[Document Download] Document metadata:`, document)

    // The storage path is like "/uploads/{companyId}/{filename}"
    // We need to read the file from the backend's file system
    const storagePath = document.storagePath

    // Construct the full file path on the backend
    // The backend stores files at: c:/repositories/HavenzBMS/WebApp/uploads/{companyId}/{filename}
    const backendRoot = 'c:/repositories/HavenzBMS/WebApp'
    const filePath = path.join(backendRoot, storagePath.replace(/^\//, ''))

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found at path:', filePath)
      return NextResponse.json(
        { error: 'File not found on server', path: filePath },
        { status: 404 }
      )
    }

    // Read file buffer
    const fileBuffer = fs.readFileSync(filePath)

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': document.fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${document.name}"`,
        'Cache-Control': 'public, max-age=31536000'
      }
    })
  } catch (error) {
    console.error('Error downloading document:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
