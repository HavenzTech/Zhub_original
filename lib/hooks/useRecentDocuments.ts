import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { RecentDocumentDto } from "@/types/bms"
import { toast } from "sonner"

interface UseRecentDocumentsReturn {
  recentDocuments: RecentDocumentDto[]
  loading: boolean
  error: Error | null
  loadRecentDocuments: () => Promise<void>
}

/**
 * Hook for loading recent documents
 * Handles fetching the user's recently accessed documents
 */
export function useRecentDocuments(): UseRecentDocumentsReturn {
  const [recentDocuments, setRecentDocuments] = useState<RecentDocumentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadRecentDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentRecent.getRecent()
      setRecentDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load recent documents")
      setError(error)
      toast.error("Failed to load recent documents", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    recentDocuments,
    loading,
    error,
    loadRecentDocuments,
  }
}
