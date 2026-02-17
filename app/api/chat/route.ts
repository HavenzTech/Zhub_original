// app/api/chat/route.ts - Proxy endpoint to RAG backend
import { NextRequest, NextResponse } from 'next/server'

// Python AI Backend URL - uses env variable or falls back to localhost
const RAG_BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log('Sending to RAG backend:', JSON.stringify(body, null, 2))
    console.log('RAG backend URL:', RAG_BACKEND_URL)

    // Prepare request for HavenzHub-AI backend (matches BACKEND_API.md spec)
    const ragRequest = {
      query: body.query,
      chat_history: body.chat_history || [],
      search_type: body.search_type || "general",
      user_email: body.user_email || "anonymous@example.com",
      // Multi-level access control parameters
      company_id: body.company_id || "",
      department_ids: body.department_ids || [],
      project_id: body.project_id || "",
      user_id: body.user_id || ""
    }

    // Get Authorization header from incoming request
    const authHeader = request.headers.get('authorization')
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Forward auth token if present
    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    // Call your RAG backend (using LangGraph agent with smart tool selection)
    const response = await fetch(`${RAG_BACKEND_URL}/chat/agent`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ragRequest)
    })

    console.log('RAG backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.log('RAG backend error response:', errorText)
      throw new Error(`RAG backend responded with status: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    // Convert RAG backend response to expected format for Z-AI
    const formattedResponse = {
      response: data.answer || "Sorry, I couldn't generate a response.",
      answer: data.answer || "Sorry, I couldn't generate a response.",
      sources: data.source_documents?.map((doc: any) => doc.document_name || doc.metadata?.title || doc.metadata?.source || "Unknown document") || [],
      source_documents: data.source_documents || [], // Include full source documents for Z AI
      documents_found: data.source_documents?.length || 0,
      search_type: data.search_type,
      tool_used: data.tool_used || "chat",
      agent_used: data.agent_used || true,
      session_id: data.session_id,
      generated_images: data.generated_images || [], // Pass through generated images
      metadata: {
        elapsed_time: data.metadata?.elapsed_time || null,
        token_usage: data.metadata?.token_usage || null,
        tier_used: data.metadata?.tier_used || null,
        retrieval_method: data.retrieval_method || null,
        routing_mode: data.routing_mode || null,
      },
    }

    console.log('Formatted response:', formattedResponse)

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
        response: 'I apologize, but I cannot connect to the document search system at the moment. Please try again later.',
        answer: 'I apologize, but I cannot connect to the document search system at the moment. Please try again later.'
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