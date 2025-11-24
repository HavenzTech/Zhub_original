import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params

    // Validate filename (allow PNG, JPG, JPEG files with safe characters)
    if (!filename || !/^[\w\-]+\.(png|jpg|jpeg)$/i.test(filename)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      )
    }

    // Backend API URL
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'
    const imageUrl = `${backendUrl}/feedback_data/images/${filename}`

    console.log(`[Image Proxy] Fetching: ${imageUrl}`)

    // Fetch image from backend
    const response = await fetch(imageUrl)

    if (!response.ok) {
      console.error(`[Image Proxy] Backend returned ${response.status}`)
      return NextResponse.json(
        { error: 'Image not found' },
        { status: response.status }
      )
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer()

    console.log(`[Image Proxy] Successfully proxied ${filename} (${imageBuffer.byteLength} bytes)`)

    // Determine content type from extension
    const ext = filename.split('.').pop()?.toLowerCase()
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    })

  } catch (error) {
    console.error('[Image Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch image' },
      { status: 500 }
    )
  }
}
