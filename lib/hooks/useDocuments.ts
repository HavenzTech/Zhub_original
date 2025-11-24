import { useState, useCallback, Dispatch, SetStateAction } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { Document } from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentsReturn {
  documents: Document[]
  loading: boolean
  error: Error | null
  loadDocuments: () => Promise<void>
  createDocument: (documentData: Partial<Document>) => Promise<Document | null>
  updateDocument: (
    id: string,
    documentData: Partial<Document>
  ) => Promise<boolean>
  deleteDocument: (id: string) => Promise<boolean>
  setDocuments: Dispatch<SetStateAction<Document[]>>
}

/**
 * Hook for managing documents
 * Handles fetching, creating, updating, and deleting documents
 */
export function useDocuments(): UseDocumentsReturn {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadDocuments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documents.getAll()
      setDocuments(data as Document[])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load documents")
      setError(error)
      toast.error("Failed to load documents", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const createDocument = useCallback(
    async (documentData: Partial<Document>): Promise<Document | null> => {
      try {
        const newDocument = await bmsApi.documents.create(documentData)
        setDocuments((prev) => [...prev, newDocument as Document])
        toast.success("Document created successfully")
        return newDocument as Document
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create document")
        toast.error("Failed to create document", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateDocument = useCallback(
    async (id: string, documentData: Partial<Document>): Promise<boolean> => {
      try {
        await bmsApi.documents.update(id, documentData)
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.id === id ? { ...doc, ...documentData } : doc
          )
        )
        toast.success("Document updated successfully")
        return true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update document")
        toast.error("Failed to update document", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteDocument = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.documents.softDelete(id)
      setDocuments((prev) => prev.filter((doc) => doc.id !== id))
      toast.success("Document deleted successfully")
      return true
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete document")
      toast.error("Failed to delete document", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    documents,
    loading,
    error,
    loadDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    setDocuments,
  }
}
