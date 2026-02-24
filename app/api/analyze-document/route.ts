// app/api/analyze-document/route.ts - Proxy endpoint to Python AI backend
import { NextRequest, NextResponse } from 'next/server'

const RAG_BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('[AnalyzeDocument] Proxying to:', `${RAG_BACKEND_URL}/analyze-document`)
    console.log('[AnalyzeDocument] Document ID:', typeof body.document_id === 'string' ? body.document_id.substring(0, 80) : body.document_id)
    console.log('[AnalyzeDocument] Query:', body.query)
    console.log('[AnalyzeDocument] Page num:', body.page_num)

    const response = await fetch(`${RAG_BACKEND_URL}/analyze-document`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        document_id: body.document_id,
        query: body.query,
        page_num: body.page_num ?? 0,
      }),
    })

    console.log('[AnalyzeDocument] Backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AnalyzeDocument] Backend error:', errorText)
      throw new Error(`Backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('[AnalyzeDocument] Proxy error:', error)

    return NextResponse.json(
      {
        answer: 'Sorry, I could not connect to the AI backend. Please try again later.',
        model_used: 'none',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
