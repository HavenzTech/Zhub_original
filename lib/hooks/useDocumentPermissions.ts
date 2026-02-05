import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  DocumentPermissionDto,
  CreateDocumentPermissionRequest,
  UpdateDocumentPermissionRequest,
  EffectivePermissionsDto,
} from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentPermissionsReturn {
  permissions: DocumentPermissionDto[]
  effectivePermissions: EffectivePermissionsDto | null
  loading: boolean
  error: Error | null
  loadPermissions: () => Promise<void>
  loadEffectivePermissions: () => Promise<void>
  getUserEffectivePermissions: (userId: string) => Promise<EffectivePermissionsDto | null>
  createPermission: (request: CreateDocumentPermissionRequest) => Promise<DocumentPermissionDto | null>
  updatePermission: (permissionId: string, request: UpdateDocumentPermissionRequest) => Promise<DocumentPermissionDto | null>
  revokePermission: (permissionId: string) => Promise<boolean>
}

/**
 * Hook for managing document permissions
 * Handles creating, updating, and revoking user/role permissions
 */
export function useDocumentPermissions(documentId: string): UseDocumentPermissionsReturn {
  const [permissions, setPermissions] = useState<DocumentPermissionDto[]>([])
  const [effectivePermissions, setEffectivePermissions] = useState<EffectivePermissionsDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadPermissions = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentPermissions.list(documentId)
      setPermissions(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load permissions")
      setError(error)
      toast.error("Failed to load document permissions", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const loadEffectivePermissions = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      const data = await bmsApi.documentPermissions.getEffective(documentId)
      setEffectivePermissions(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load effective permissions")
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const getUserEffectivePermissions = useCallback(
    async (userId: string): Promise<EffectivePermissionsDto | null> => {
      if (!documentId) return null
      try {
        return await bmsApi.documentPermissions.getUserEffective(documentId, userId)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load user permissions")
        toast.error("Failed to load user permissions", {
          description: error.message,
        })
        return null
      }
    },
    [documentId]
  )

  const createPermission = useCallback(
    async (request: CreateDocumentPermissionRequest): Promise<DocumentPermissionDto | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const newPermission = await bmsApi.documentPermissions.create(documentId, request)
        setPermissions((prev) => [...prev, newPermission])
        toast.success("Permission granted successfully")
        return newPermission
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to grant permission")
        toast.error("Failed to grant permission", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const updatePermission = useCallback(
    async (permissionId: string, request: UpdateDocumentPermissionRequest): Promise<DocumentPermissionDto | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const updatedPermission = await bmsApi.documentPermissions.update(documentId, permissionId, request)
        setPermissions((prev) =>
          prev.map((perm) => (perm.id === permissionId ? updatedPermission : perm))
        )
        toast.success("Permission updated successfully")
        return updatedPermission
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update permission")
        toast.error("Failed to update permission", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const revokePermission = useCallback(
    async (permissionId: string): Promise<boolean> => {
      if (!documentId) return false
      try {
        setLoading(true)
        await bmsApi.documentPermissions.revoke(documentId, permissionId)
        setPermissions((prev) => prev.filter((perm) => perm.id !== permissionId))
        toast.success("Permission revoked successfully")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to revoke permission")
        toast.error("Failed to revoke permission", {
          description: error.message,
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  return {
    permissions,
    effectivePermissions,
    loading,
    error,
    loadPermissions,
    loadEffectivePermissions,
    getUserEffectivePermissions,
    createPermission,
    updatePermission,
    revokePermission,
  }
}
