import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  DocumentTypeDto,
  CreateDocumentTypeRequest,
  UpdateDocumentTypeRequest,
  FileValidationResult,
} from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentTypesReturn {
  documentTypes: DocumentTypeDto[]
  loading: boolean
  error: Error | null
  loadDocumentTypes: () => Promise<void>
  getDocumentType: (id: string) => Promise<DocumentTypeDto | null>
  getDocumentTypeByCode: (code: string) => Promise<DocumentTypeDto | null>
  createDocumentType: (request: CreateDocumentTypeRequest) => Promise<DocumentTypeDto | null>
  updateDocumentType: (id: string, request: UpdateDocumentTypeRequest) => Promise<DocumentTypeDto | null>
  deleteDocumentType: (id: string) => Promise<boolean>
  validateFile: (typeId: string, file: File) => Promise<FileValidationResult | null>
}

/**
 * Hook for managing document types (admin)
 * Handles CRUD operations for document type definitions
 */
export function useDocumentTypes(): UseDocumentTypesReturn {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadDocumentTypes = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.admin.documentTypes.list(true)
      setDocumentTypes(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load document types")
      setError(error)
      toast.error("Failed to load document types", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const getDocumentType = useCallback(async (id: string): Promise<DocumentTypeDto | null> => {
    try {
      return await bmsApi.admin.documentTypes.get(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load document type")
      toast.error("Failed to load document type", {
        description: error.message,
      })
      return null
    }
  }, [])

  const getDocumentTypeByCode = useCallback(async (code: string): Promise<DocumentTypeDto | null> => {
    try {
      return await bmsApi.admin.documentTypes.getByCode(code)
    } catch (err) {
      return null
    }
  }, [])

  const createDocumentType = useCallback(
    async (request: CreateDocumentTypeRequest): Promise<DocumentTypeDto | null> => {
      try {
        setLoading(true)
        const newType = await bmsApi.admin.documentTypes.create(request)
        setDocumentTypes((prev) => [...prev, newType])
        toast.success("Document type created successfully")
        return newType
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create document type")
        toast.error("Failed to create document type", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateDocumentType = useCallback(
    async (id: string, request: UpdateDocumentTypeRequest): Promise<DocumentTypeDto | null> => {
      try {
        setLoading(true)
        const updatedType = await bmsApi.admin.documentTypes.update(id, request)
        setDocumentTypes((prev) =>
          prev.map((type) => (type.id === id ? updatedType : type))
        )
        toast.success("Document type updated successfully")
        return updatedType
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update document type")
        toast.error("Failed to update document type", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteDocumentType = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await bmsApi.admin.documentTypes.delete(id)
      setDocumentTypes((prev) => prev.filter((type) => type.id !== id))
      toast.success("Document type deleted successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete document type")
      toast.error("Failed to delete document type", {
        description: error.message,
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const validateFile = useCallback(
    async (typeId: string, file: File): Promise<FileValidationResult | null> => {
      try {
        return await bmsApi.admin.documentTypes.validate(typeId, file)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to validate file")
        toast.error("File validation failed", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  return {
    documentTypes,
    loading,
    error,
    loadDocumentTypes,
    getDocumentType,
    getDocumentTypeByCode,
    createDocumentType,
    updateDocumentType,
    deleteDocumentType,
    validateFile,
  }
}
