import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  DocumentSearchRequest,
  DocumentSearchResults,
  CheckedOutDocumentDto,
  DocumentNeedsReviewDto,
} from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentSearchReturn {
  results: DocumentSearchResults | null
  checkedOutDocuments: CheckedOutDocumentDto[]
  myCheckouts: CheckedOutDocumentDto[]
  needsReview: DocumentNeedsReviewDto[]
  loading: boolean
  error: Error | null
  search: (request: DocumentSearchRequest) => Promise<void>
  loadCheckedOutDocuments: () => Promise<void>
  loadMyCheckouts: () => Promise<void>
  loadNeedsReview: () => Promise<void>
  clearResults: () => void
}

/**
 * Hook for document search and discovery
 * Handles searching documents and loading special document lists
 */
export function useDocumentSearch(): UseDocumentSearchReturn {
  const [results, setResults] = useState<DocumentSearchResults | null>(null)
  const [checkedOutDocuments, setCheckedOutDocuments] = useState<CheckedOutDocumentDto[]>([])
  const [myCheckouts, setMyCheckouts] = useState<CheckedOutDocumentDto[]>([])
  const [needsReview, setNeedsReview] = useState<DocumentNeedsReviewDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(async (request: DocumentSearchRequest) => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentSearch.search(request)
      setResults(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Search failed")
      setError(error)
      toast.error("Search failed", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCheckedOutDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentSearch.getCheckedOut()
      setCheckedOutDocuments(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load checked out documents")
      setError(error)
      toast.error("Failed to load checked out documents", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyCheckouts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentSearch.getMyCheckouts()
      setMyCheckouts(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load my checkouts")
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadNeedsReview = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentSearch.getNeedsReview()
      setNeedsReview(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load documents needing review")
      setError(error)
      toast.error("Failed to load documents needing review", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults(null)
  }, [])

  return {
    results,
    checkedOutDocuments,
    myCheckouts,
    needsReview,
    loading,
    error,
    search,
    loadCheckedOutDocuments,
    loadMyCheckouts,
    loadNeedsReview,
    clearResults,
  }
}
