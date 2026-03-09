import { useState, useEffect, useCallback } from "react"
import { formatMessageTimestamp, generateSessionId } from "@/features/z-ai/utils/chatHelpers"

export interface Message {
  role: "internal-z" | "external-z" | "user"
  content: string
  timestamp: string
  type?: "query" | "analysis" | "alert"
  relatedDocuments?: string[]
  sourceDocuments?: Array<{
    title: string
    relevance_score: number
    parent_folder: string
    page_start?: number
    page_end?: number
  }>
  generatedImages?: Array<{
    image_path: string
    prompt?: string
    model?: string
    file_size?: number
  }>
  company?: string
  toolUsed?: string
  elapsedTime?: number
  tokenUsage?: { input_tokens?: number; output_tokens?: number; chunks_retrieved?: number }
  tierUsed?: string
  retrievalMethod?: string
}

interface UseChatReturn {
  messages: Message[]
  isLoading: boolean
  currentSessionId: string
  sendMessage: (content: string, aiMode: "internal" | "external") => Promise<void>
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
}

/**
 * Hook for managing Z-AI chat functionality
 * Handles message state, session persistence, and API calls
 */
export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string>("")

  // Load session from localStorage on mount, and re-load when company changes
  useEffect(() => {
    const loadSession = () => {
      const authData = localStorage.getItem("auth")
      if (!authData) return

      const auth = JSON.parse(authData)
      const userEmail = auth.email
      const companyId = auth.currentCompanyId

      if (!userEmail) return

      // Generate session ID scoped to user + company + date
      const sessionId = generateSessionId(userEmail, companyId)
      setCurrentSessionId(sessionId)

      // Load existing messages for this company's session
      const savedMessages = localStorage.getItem(sessionId)
      if (savedMessages) {
        try {
          const parsed = JSON.parse(savedMessages)
          setMessages(parsed)
        } catch (e) {
          console.error("[Session] Failed to parse saved messages:", e)
          setMessages([])
        }
      } else {
        setMessages([])
      }
    }

    loadSession()

    // Listen for company switch events so chat reloads with the new company's session
    window.addEventListener("company-changed", loadSession)
    return () => window.removeEventListener("company-changed", loadSession)
  }, [])

  // Save messages to localStorage whenever they change
  useEffect(() => {
    console.log(
      "[Session] Save effect triggered - SessionID:",
      currentSessionId,
      "Messages:",
      messages.length
    )
    if (currentSessionId && messages.length > 0) {
      localStorage.setItem(currentSessionId, JSON.stringify(messages))
      console.log(
        `[Session] ✅ Saved ${messages.length} messages to session ${currentSessionId}`
      )
    }
  }, [messages, currentSessionId])

  const sendMessage = useCallback(
    async (content: string, aiMode: "internal" | "external") => {
      if (!content.trim() || isLoading) return

      const newMessage: Message = {
        role: "user",
        content,
        timestamp: formatMessageTimestamp(),
      }

      setMessages((prev) => [...prev, newMessage])
      setIsLoading(true)

      try {
        if (aiMode === "internal") {
          // Use RAG backend for Internal Z mode
          // Convert messages to backend chat_history format
          const formattedHistory = messages
            .filter((msg) => msg.role === "user" || msg.role === "internal-z")
            .map((msg) => ({
              role: msg.role === "user" ? "user" : "assistant",
              text: msg.content,
            }))

          // Get auth context from localStorage
          const authData = localStorage.getItem("auth")
          const auth = authData ? JSON.parse(authData) : null
          const token = auth?.token || null

          const headers: Record<string, string> = {
            "Content-Type": "application/json",
          }

          if (token) {
            headers["Authorization"] = `Bearer ${token}`
          }

          const response = await fetch("/api/chat", {
            method: "POST",
            headers,
            body: JSON.stringify({
              query: content,
              chat_history: formattedHistory,
              search_type: "general",
              user_email: auth?.email || "",
              company_id: auth?.currentCompanyId || "",
              user_id: auth?.userId || "",
            }),
          })

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }

          const data = await response.json()

          console.log("[Z-AI] Backend response:", data)
          console.log("[Z-AI] Generated images:", data.generated_images)
          console.log(
            "[Z-AI] Generated images length:",
            data.generated_images?.length
          )

          const aiResponse: Message = {
            role: "internal-z",
            content:
              data.response ||
              data.answer ||
              "I apologize, but I couldn't process your request at the moment.",
            timestamp: formatMessageTimestamp(),
            type: "analysis",
            sourceDocuments:
              data.source_documents?.map((doc: any) => {
                const meta = doc.metadata || {};
                return {
                  title: doc.section_title || meta.section_title || meta.title || "Unknown Document",
                  relevance_score: doc.relevance_score || meta.relevance_score || 0,
                  parent_folder: doc.parent_folder || meta.parent_folder || "",
                };
              }) || [],
            generatedImages: data.generated_images || [],
            toolUsed: data.tool_used,
            elapsedTime: data.metadata?.elapsed_time,
            tokenUsage: data.metadata?.token_usage,
            tierUsed: data.metadata?.tier_used,
            retrievalMethod: data.metadata?.retrieval_method,
          }

          setMessages((prev) => [...prev, aiResponse])
        } else {
          // External mode - simple mock response
          await new Promise((resolve) => setTimeout(resolve, 1500))

          const aiResponse: Message = {
            role: "external-z",
            content:
              "External Z mode is currently in development. This would connect to external AI services for research and information gathering.",
            timestamp: formatMessageTimestamp(),
            type: "query",
          }

          setMessages((prev) => [...prev, aiResponse])
        }
      } catch (error) {
        console.error("[Z-AI] Error sending message:", error)
        const errorResponse: Message = {
          role: aiMode === "internal" ? "internal-z" : "external-z",
          content: `Error: ${
            error instanceof Error ? error.message : "Failed to process request"
          }`,
          timestamp: formatMessageTimestamp(),
          type: "alert",
        }
        setMessages((prev) => [...prev, errorResponse])
      } finally {
        setIsLoading(false)
      }
    },
    [isLoading, messages]
  )

  return {
    messages,
    isLoading,
    currentSessionId,
    sendMessage,
    setMessages,
  }
}
