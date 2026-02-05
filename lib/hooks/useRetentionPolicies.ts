import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  RetentionPolicyDto,
  CreateRetentionPolicyRequest,
  UpdateRetentionPolicyRequest,
} from "@/types/bms"
import { toast } from "sonner"

interface UseRetentionPoliciesReturn {
  retentionPolicies: RetentionPolicyDto[]
  loading: boolean
  error: Error | null
  loadRetentionPolicies: () => Promise<void>
  getRetentionPolicy: (id: string) => Promise<RetentionPolicyDto | null>
  getRetentionPolicyByCode: (code: string) => Promise<RetentionPolicyDto | null>
  createRetentionPolicy: (request: CreateRetentionPolicyRequest) => Promise<RetentionPolicyDto | null>
  updateRetentionPolicy: (id: string, request: UpdateRetentionPolicyRequest) => Promise<RetentionPolicyDto | null>
  deleteRetentionPolicy: (id: string) => Promise<boolean>
}

/**
 * Hook for managing retention policies (admin)
 * Handles CRUD operations for document retention policy definitions
 */
export function useRetentionPolicies(): UseRetentionPoliciesReturn {
  const [retentionPolicies, setRetentionPolicies] = useState<RetentionPolicyDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadRetentionPolicies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.admin.retentionPolicies.list(true)
      setRetentionPolicies(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load retention policies")
      setError(error)
      toast.error("Failed to load retention policies", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const getRetentionPolicy = useCallback(async (id: string): Promise<RetentionPolicyDto | null> => {
    try {
      return await bmsApi.admin.retentionPolicies.get(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load retention policy")
      toast.error("Failed to load retention policy", {
        description: error.message,
      })
      return null
    }
  }, [])

  const getRetentionPolicyByCode = useCallback(async (code: string): Promise<RetentionPolicyDto | null> => {
    try {
      return await bmsApi.admin.retentionPolicies.getByCode(code)
    } catch (err) {
      return null
    }
  }, [])

  const createRetentionPolicy = useCallback(
    async (request: CreateRetentionPolicyRequest): Promise<RetentionPolicyDto | null> => {
      try {
        setLoading(true)
        const newPolicy = await bmsApi.admin.retentionPolicies.create(request)
        setRetentionPolicies((prev) => [...prev, newPolicy])
        toast.success("Retention policy created successfully")
        return newPolicy
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create retention policy")
        toast.error("Failed to create retention policy", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateRetentionPolicy = useCallback(
    async (id: string, request: UpdateRetentionPolicyRequest): Promise<RetentionPolicyDto | null> => {
      try {
        setLoading(true)
        const updatedPolicy = await bmsApi.admin.retentionPolicies.update(id, request)
        setRetentionPolicies((prev) =>
          prev.map((policy) => (policy.id === id ? updatedPolicy : policy))
        )
        toast.success("Retention policy updated successfully")
        return updatedPolicy
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update retention policy")
        toast.error("Failed to update retention policy", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteRetentionPolicy = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await bmsApi.admin.retentionPolicies.delete(id)
      setRetentionPolicies((prev) => prev.filter((policy) => policy.id !== id))
      toast.success("Retention policy deleted successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete retention policy")
      toast.error("Failed to delete retention policy", {
        description: error.message,
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    retentionPolicies,
    loading,
    error,
    loadRetentionPolicies,
    getRetentionPolicy,
    getRetentionPolicyByCode,
    createRetentionPolicy,
    updateRetentionPolicy,
    deleteRetentionPolicy,
  }
}
