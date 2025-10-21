// app/api/chat/route.ts - Proxy endpoint to RAG backend
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('Sending to RAG backend:', JSON.stringify(body, null, 2))

    // Prepare request for your RAG backend
    const ragRequest = {
      query: body.query,
      search_type: "ahlp_general"
    }

    // Call your RAG backend
    const response = await fetch('http://localhost:8002/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(ragRequest)
    })

    console.log('RAG backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('RAG backend error response:', errorText)
      throw new Error(`RAG backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Convert RAG backend response to expected format
    const formattedResponse = {
      response: data.answer || "Sorry, I couldn't generate a response.",
      sources: data.source_documents?.map((doc: any) => doc.metadata?.title || doc.metadata?.source || "Unknown document") || [],
      source_documents: data.source_documents || [], // Include full source documents for Z AI
      documents_found: data.documents_found || 0,
      search_type: data.search_type
    }

    console.log('RAG backend response:', formattedResponse)
    
    // Return the response with proper CORS headers
    return NextResponse.json(formattedResponse, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    })
  } catch (error) {
    console.error('RAG backend proxy error:', error)

    // Return error response
    return NextResponse.json(
      {
        error: 'Failed to connect to RAG backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        response: 'I apologize, but I cannot connect to the document search system at the moment. Please try again later.'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

// Handle preflight requests
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}