import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  FolderTemplateDto,
  CreateFolderTemplateRequest,
  UpdateFolderTemplateRequest,
  FolderTemplateApplicationDto,
  ApplyFolderTemplateRequest,
} from "@/types/bms"
import { toast } from "sonner"

interface UseFolderTemplatesReturn {
  folderTemplates: FolderTemplateDto[]
  loading: boolean
  error: Error | null
  loadFolderTemplates: () => Promise<void>
  getFolderTemplate: (id: string) => Promise<FolderTemplateDto | null>
  getFolderTemplateByCode: (code: string) => Promise<FolderTemplateDto | null>
  getTemplatesForScope: (scopeType: string) => Promise<FolderTemplateDto[]>
  getDefaultTemplate: (scopeType: string) => Promise<FolderTemplateDto | null>
  createFolderTemplate: (request: CreateFolderTemplateRequest) => Promise<FolderTemplateDto | null>
  updateFolderTemplate: (id: string, request: UpdateFolderTemplateRequest) => Promise<FolderTemplateDto | null>
  deleteFolderTemplate: (id: string) => Promise<boolean>
  applyTemplate: (request: ApplyFolderTemplateRequest) => Promise<FolderTemplateApplicationDto | null>
  getApplications: (templateId: string) => Promise<FolderTemplateApplicationDto[]>
}

/**
 * Hook for managing folder templates (admin)
 * Handles CRUD operations for folder template definitions
 */
export function useFolderTemplates(): UseFolderTemplatesReturn {
  const [folderTemplates, setFolderTemplates] = useState<FolderTemplateDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadFolderTemplates = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.admin.folderTemplates.list(true)
      setFolderTemplates(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load folder templates")
      setError(error)
      toast.error("Failed to load folder templates", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const getFolderTemplate = useCallback(async (id: string): Promise<FolderTemplateDto | null> => {
    try {
      return await bmsApi.admin.folderTemplates.get(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load folder template")
      toast.error("Failed to load folder template", {
        description: error.message,
      })
      return null
    }
  }, [])

  const getFolderTemplateByCode = useCallback(async (code: string): Promise<FolderTemplateDto | null> => {
    try {
      return await bmsApi.admin.folderTemplates.getByCode(code)
    } catch (err) {
      return null
    }
  }, [])

  const getTemplatesForScope = useCallback(async (scopeType: string): Promise<FolderTemplateDto[]> => {
    try {
      const data = await bmsApi.admin.folderTemplates.getForScope(scopeType)
      return Array.isArray(data) ? data : []
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load templates for scope")
      toast.error("Failed to load templates", {
        description: error.message,
      })
      return []
    }
  }, [])

  const getDefaultTemplate = useCallback(async (scopeType: string): Promise<FolderTemplateDto | null> => {
    try {
      return await bmsApi.admin.folderTemplates.getDefault(scopeType)
    } catch (err) {
      return null
    }
  }, [])

  const createFolderTemplate = useCallback(
    async (request: CreateFolderTemplateRequest): Promise<FolderTemplateDto | null> => {
      try {
        setLoading(true)
        const newTemplate = await bmsApi.admin.folderTemplates.create(request)
        setFolderTemplates((prev) => [...prev, newTemplate])
        toast.success("Folder template created successfully")
        return newTemplate
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create folder template")
        toast.error("Failed to create folder template", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateFolderTemplate = useCallback(
    async (id: string, request: UpdateFolderTemplateRequest): Promise<FolderTemplateDto | null> => {
      try {
        setLoading(true)
        const updatedTemplate = await bmsApi.admin.folderTemplates.update(id, request)
        setFolderTemplates((prev) =>
          prev.map((template) => (template.id === id ? updatedTemplate : template))
        )
        toast.success("Folder template updated successfully")
        return updatedTemplate
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update folder template")
        toast.error("Failed to update folder template", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteFolderTemplate = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await bmsApi.admin.folderTemplates.delete(id)
      setFolderTemplates((prev) => prev.filter((template) => template.id !== id))
      toast.success("Folder template deleted successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete folder template")
      toast.error("Failed to delete folder template", {
        description: error.message,
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const applyTemplate = useCallback(
    async (request: ApplyFolderTemplateRequest): Promise<FolderTemplateApplicationDto | null> => {
      try {
        setLoading(true)
        const result = await bmsApi.folders.createFromTemplate(request)
        toast.success("Folder template applied successfully")
        return result
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to apply folder template")
        toast.error("Failed to apply folder template", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const getApplications = useCallback(async (templateId: string): Promise<FolderTemplateApplicationDto[]> => {
    try {
      const data = await bmsApi.admin.folderTemplates.getApplications(templateId)
      return Array.isArray(data) ? data : []
    } catch (err) {
      return []
    }
  }, [])

  return {
    folderTemplates,
    loading,
    error,
    loadFolderTemplates,
    getFolderTemplate,
    getFolderTemplateByCode,
    getTemplatesForScope,
    getDefaultTemplate,
    createFolderTemplate,
    updateFolderTemplate,
    deleteFolderTemplate,
    applyTemplate,
    getApplications,
  }
}
