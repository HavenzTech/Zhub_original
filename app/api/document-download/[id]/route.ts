// API route to download documents from BMS backend with authentication
// Uses GCS signed URLs from backend endpoint
import { NextRequest, NextResponse } from 'next/server'

const BMS_API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5087'

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

    // Call the backend download endpoint to get signed URL
    console.log(`[Document Download] Fetching signed URL for document ID: ${id}`)
    console.log(`[Document Download] Company ID: ${companyId}`)
    console.log(`[Document Download] Using BMS API: ${BMS_API_BASE}/api/havenzhub/documents/${id}/download`)

    const downloadResponse = await fetch(`${BMS_API_BASE}/api/havenzhub/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId,
        'Content-Type': 'application/json'
      }
    })

    if (!downloadResponse.ok) {
      const errorText = await downloadResponse.text()
      console.error(`[Document Download] Failed to get download URL: ${downloadResponse.status}`)
      console.error(`[Document Download] Response body: ${errorText}`)
      console.error(`[Document Download] Response headers:`, Object.fromEntries(downloadResponse.headers.entries()))
      return NextResponse.json(
        {
          error: `Backend returned ${downloadResponse.status}`,
          details: errorText,
          endpoint: `${BMS_API_BASE}/api/havenzhub/documents/${id}/download`
        },
        { status: downloadResponse.status || 500 }
      )
    }

    const downloadData = await downloadResponse.json()
    console.log(`[Document Download] Download response:`, downloadData)

    // downloadData contains: { downloadUrl, fileName, fileType, expiresInMinutes }
    const { downloadUrl, fileName, fileType } = downloadData

    if (!downloadUrl) {
      console.error('[Document Download] No download URL in response')
      return NextResponse.json(
        { error: 'No download URL available' },
        { status: 500 }
      )
    }

    // Fetch the actual file from GCS using the signed URL
    console.log(`[Document Download] Fetching file from GCS: ${downloadUrl.substring(0, 100)}...`)
    const fileResponse = await fetch(downloadUrl)

    if (!fileResponse.ok) {
      console.error(`[Document Download] Failed to fetch from GCS: ${fileResponse.status}`)
      return NextResponse.json(
        { error: 'Failed to download file from storage' },
        { status: fileResponse.status }
      )
    }

    const fileBuffer = await fileResponse.arrayBuffer()

    // Return file with proper headers
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': fileType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${fileName}"`,
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour (signed URLs expire in 60 min)
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
