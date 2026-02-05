import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  DocumentShareDto,
  CreateDocumentShareRequest,
  UpdateDocumentShareRequest,
  ShareAccessLogDto,
} from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentSharesReturn {
  shares: DocumentShareDto[]
  loading: boolean
  error: Error | null
  loadShares: () => Promise<void>
  createShare: (request: CreateDocumentShareRequest) => Promise<DocumentShareDto | null>
  updateShare: (shareId: string, request: UpdateDocumentShareRequest) => Promise<DocumentShareDto | null>
  revokeShare: (shareId: string) => Promise<boolean>
  getShareLogs: (shareId: string) => Promise<ShareAccessLogDto[]>
}

/**
 * Hook for managing document external shares
 * Handles creating, updating, and revoking external share links
 */
export function useDocumentShares(documentId: string): UseDocumentSharesReturn {
  const [shares, setShares] = useState<DocumentShareDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadShares = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentShares.list(documentId)
      setShares(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load shares")
      setError(error)
      toast.error("Failed to load document shares", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const createShare = useCallback(
    async (request: CreateDocumentShareRequest): Promise<DocumentShareDto | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const newShare = await bmsApi.documentShares.create(documentId, request)
        setShares((prev) => [...prev, newShare])
        toast.success("Share link created successfully")
        return newShare
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create share link")
        toast.error("Failed to create share link", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const updateShare = useCallback(
    async (shareId: string, request: UpdateDocumentShareRequest): Promise<DocumentShareDto | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const updatedShare = await bmsApi.documentShares.update(documentId, shareId, request)
        setShares((prev) =>
          prev.map((share) => (share.id === shareId ? updatedShare : share))
        )
        toast.success("Share link updated successfully")
        return updatedShare
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update share link")
        toast.error("Failed to update share link", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const revokeShare = useCallback(
    async (shareId: string): Promise<boolean> => {
      if (!documentId) return false
      try {
        setLoading(true)
        await bmsApi.documentShares.revoke(documentId, shareId)
        setShares((prev) => prev.filter((share) => share.id !== shareId))
        toast.success("Share link revoked successfully")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to revoke share link")
        toast.error("Failed to revoke share link", {
          description: error.message,
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const getShareLogs = useCallback(
    async (shareId: string): Promise<ShareAccessLogDto[]> => {
      if (!documentId) return []
      try {
        const logs = await bmsApi.documentShares.getLogs(documentId, shareId)
        return Array.isArray(logs) ? logs : []
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load share access logs")
        toast.error("Failed to load share access logs", {
          description: error.message,
        })
        return []
      }
    },
    [documentId]
  )

  return {
    shares,
    loading,
    error,
    loadShares,
    createShare,
    updateShare,
    revokeShare,
    getShareLogs,
  }
}
