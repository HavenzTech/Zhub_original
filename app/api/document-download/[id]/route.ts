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
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!companyId) {
      return NextResponse.json({ error: 'Company ID required' }, { status: 400 })
    }

    const downloadResponse = await fetch(`${BMS_API_BASE}/api/havenzhub/documents/${id}/download`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'X-Company-Id': companyId,
        'Content-Type': 'application/json'
      }
    })

    if (!downloadResponse.ok) {
      console.error(`[Document Download] Failed: ${downloadResponse.status}`)
      return NextResponse.json(
        { error: 'Failed to get download URL' },
        { status: downloadResponse.status || 500 }
      )
    }

    const downloadData = await downloadResponse.json()

    // downloadData contains: { downloadUrl, fileName, fileType, expiresInMinutes }
    const { downloadUrl, fileName, fileType } = downloadData

    if (!downloadUrl) {
      return NextResponse.json(
        { error: 'No download URL available' },
        { status: 500 }
      )
    }

    // Fetch the actual file from GCS using the signed URL
    const fileResponse = await fetch(downloadUrl)

    if (!fileResponse.ok) {
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
    console.error('[Document Download] Error:', error instanceof Error ? error.message : 'Unknown')
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
