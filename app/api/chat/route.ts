// app/api/chat/route.ts - Proxy endpoint to RAG backend

import { NextRequest, NextResponse } from 'next/server'

// Tell Vercel to allow up to 60 seconds for this function (Pro plan; Hobby is capped at 10s)
export const maxDuration = 60

// Never cache this route — it is a live proxy
export const dynamic = 'force-dynamic'

// Python AI Backend URL — must be set in Vercel environment variables
const RAG_BACKEND_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001'

// Abort the upstream fetch 5 seconds before Vercel kills the function so we
// can return a clean timeout response instead of a hard 504/500.
const FETCH_TIMEOUT_MS = 55_000

export async function POST(request: NextRequest) {
  // Log on every cold-start so Vercel logs show whether the env var is wired up
  if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
    console.warn(
      'NEXT_PUBLIC_API_BASE_URL is not set — falling back to http://localhost:8001. ' +
      'Set this variable in the Vercel dashboard for production.'
    )
  } else {
    console.log('RAG backend URL:', RAG_BACKEND_URL)
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const body = await request.json()

    console.log('Sending to RAG backend:', JSON.stringify(body, null, 2))

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
    const response = await fetch(`${RAG_BACKEND_URL}/chat/smart`, {
      method: 'POST',
      headers,
      body: JSON.stringify(ragRequest),
      signal: controller.signal,
    })

    console.log('RAG backend response status:', response.status)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('RAG backend error response:', errorText)
      throw new Error(`RAG backend responded with HTTP ${response.status}: ${errorText}`)
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
    // Distinguish the three failure modes so the client (and Vercel logs) are informative
    if (error instanceof Error && error.name === 'AbortError') {
      console.error(`RAG backend timed out after ${FETCH_TIMEOUT_MS / 1000}s`)
      return NextResponse.json(
        {
          error: 'Request timed out',
          message: `The AI backend did not respond within ${FETCH_TIMEOUT_MS / 1000} seconds. Please try again.`,
          response: 'The request took too long to complete. Please try your question again.',
          answer: 'The request took too long to complete. Please try your question again.',
        },
        {
          status: 504,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    const isNetworkError =
      error instanceof TypeError &&
      (error.message.includes('fetch failed') ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('network'))

    if (isNetworkError) {
      console.error('RAG backend unreachable:', error)
      return NextResponse.json(
        {
          error: 'Backend unreachable',
          message: `Could not connect to the AI backend at ${RAG_BACKEND_URL}. Check that NEXT_PUBLIC_API_BASE_URL is set correctly in Vercel.`,
          response: 'The document search system is currently unreachable. Please try again later.',
          answer: 'The document search system is currently unreachable. Please try again later.',
        },
        {
          status: 503,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      )
    }

    // Fallback: non-200 from backend or unexpected error
    console.error('RAG backend proxy error:', error)
    return NextResponse.json(
      {
        error: 'Failed to connect to RAG backend',
        message: error instanceof Error ? error.message : 'Unknown error',
        response: 'I apologize, but I cannot connect to the document search system at the moment. Please try again later.',
        answer: 'I apologize, but I cannot connect to the document search system at the moment. Please try again later.',
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
  } finally {
    clearTimeout(timeoutId)
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
