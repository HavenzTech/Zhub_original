import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import { extractArray } from "@/lib/utils/api"
import type { Department } from "@/types/bms"
import { toast } from "sonner"

interface UseDepartmentsReturn {
  departments: Department[]
  loading: boolean
  error: Error | null
  loadDepartments: () => Promise<void>
  createDepartment: (departmentData: Partial<Department>) => Promise<Department | null>
  updateDepartment: (
    id: string,
    departmentData: Partial<Department>
  ) => Promise<boolean>
  deleteDepartment: (id: string) => Promise<boolean>
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>
}

/**
 * Hook for managing departments
 * Handles fetching, creating, updating, and deleting departments
 */
export function useDepartments(): UseDepartmentsReturn {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.departments.getAll()
      setDepartments(extractArray<Department>(data))
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load departments")
      setError(error)
      toast.error("Failed to load departments", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const createDepartment = useCallback(
    async (departmentData: Partial<Department>): Promise<Department | null> => {
      try {
        const newDepartment = await bmsApi.departments.create(departmentData)
        setDepartments((prev) => [...prev, newDepartment as Department])
        toast.success("Department created successfully")
        return newDepartment as Department
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create department")
        toast.error("Failed to create department", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateDepartment = useCallback(
    async (id: string, departmentData: Partial<Department>): Promise<boolean> => {
      try {
        await bmsApi.departments.update(id, departmentData)
        setDepartments((prev) =>
          prev.map((dept) =>
            dept.id === id ? { ...dept, ...departmentData } : dept
          )
        )
        toast.success("Department updated successfully")
        return true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update department")
        toast.error("Failed to update department", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteDepartment = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.departments.delete(id)
      setDepartments((prev) => prev.filter((dept) => dept.id !== id))
      toast.success("Department deleted successfully")
      return true
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete department")
      toast.error("Failed to delete department", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    departments,
    loading,
    error,
    loadDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
    setDepartments,
  }
}
