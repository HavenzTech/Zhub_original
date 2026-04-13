import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { DocumentVersionDto, RestoreVersionRequest, PagedResult } from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentVersionsReturn {
  versions: DocumentVersionDto[]
  currentVersion: DocumentVersionDto | null
  loading: boolean
  error: Error | null
  loadVersions: () => Promise<void>
  loadCurrentVersion: () => Promise<void>
  downloadVersion: (versionNumber: number) => Promise<string | null>
  restoreVersion: (versionNumber: number, reason?: string) => Promise<DocumentVersionDto | null>
}

/**
 * Hook for managing document versions
 * Handles listing, downloading, and restoring document versions
 */
export function useDocumentVersions(documentId: string): UseDocumentVersionsReturn {
  const [versions, setVersions] = useState<DocumentVersionDto[]>([])
  const [currentVersion, setCurrentVersion] = useState<DocumentVersionDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadVersions = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const result = await bmsApi.documentVersions.list(documentId) as PagedResult<DocumentVersionDto> | DocumentVersionDto[]
      const versions = Array.isArray(result) ? result : (result as PagedResult<DocumentVersionDto>).data || []
      setVersions(versions)
    } catch (err: any) {
      // 404 just means no versions exist yet — silently show empty list
      if (err?.status === 404) {
        setVersions([])
        return
      }
      const error = err instanceof Error ? err : new Error("Failed to load versions")
      setError(error)
      toast.error("Failed to load document versions", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const loadCurrentVersion = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentVersions.getCurrent(documentId)
      setCurrentVersion(data)
    } catch (err: any) {
      // 404 means no versions exist yet
      if (err?.status === 404) {
        setCurrentVersion(null)
        return
      }
      const error = err instanceof Error ? err : new Error("Failed to load current version")
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const downloadVersion = useCallback(
    async (versionNumber: number): Promise<string | null> => {
      if (!documentId) return null
      try {
        const response = await bmsApi.documentVersions.download(documentId, versionNumber)
        return response.downloadUrl || null
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to get download URL")
        toast.error("Failed to download version", {
          description: error.message,
        })
        return null
      }
    },
    [documentId]
  )

  const restoreVersion = useCallback(
    async (versionNumber: number, restoreReason?: string): Promise<DocumentVersionDto | null> => {
      if (!documentId) return null
      try {
        const request: RestoreVersionRequest = restoreReason ? { restoreReason } : {}
        const restoredVersion = await bmsApi.documentVersions.restore(documentId, versionNumber, request)
        toast.success("Version restored successfully")
        // Reload versions to get updated list
        await loadVersions()
        return restoredVersion
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to restore version")
        toast.error("Failed to restore version", {
          description: error.message,
        })
        return null
      }
    },
    [documentId, loadVersions]
  )

  return {
    versions,
    currentVersion,
    loading,
    error,
    loadVersions,
    loadCurrentVersion,
    downloadVersion,
    restoreVersion,
  }
}
