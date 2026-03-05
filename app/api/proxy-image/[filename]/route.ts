import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  // Auth check
  const authHeader = request.headers.get('authorization')
  const authCookie = request.cookies.get('auth-token')?.value
  if (!authHeader && !authCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

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
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5087'
    const imageUrl = `${backendUrl}/feedback_data/images/${filename}`

    // Fetch image from backend
    const response = await fetch(imageUrl)

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: response.status }
      )
    }

    // Get image buffer
    const imageBuffer = await response.arrayBuffer()

    // Determine content type from extension
    const ext = filename.split('.').pop()?.toLowerCase()
    const contentType = ext === 'png' ? 'image/png' : 'image/jpeg'

    // Return image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
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
