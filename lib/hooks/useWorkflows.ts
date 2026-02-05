import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  WorkflowDto,
  CreateWorkflowRequest,
  UpdateWorkflowRequest,
} from "@/types/bms"
import { toast } from "sonner"

interface UseWorkflowsReturn {
  workflows: WorkflowDto[]
  defaultWorkflow: WorkflowDto | null
  loading: boolean
  error: Error | null
  loadWorkflows: () => Promise<void>
  loadDefaultWorkflow: () => Promise<void>
  getWorkflow: (id: string) => Promise<WorkflowDto | null>
  getWorkflowByCode: (code: string) => Promise<WorkflowDto | null>
  createWorkflow: (request: CreateWorkflowRequest) => Promise<WorkflowDto | null>
  updateWorkflow: (id: string, request: UpdateWorkflowRequest) => Promise<WorkflowDto | null>
  deleteWorkflow: (id: string) => Promise<boolean>
  activateWorkflow: (id: string) => Promise<WorkflowDto | null>
  deactivateWorkflow: (id: string) => Promise<WorkflowDto | null>
}

/**
 * Hook for managing workflows (admin)
 * Handles CRUD operations for workflow definitions
 */
export function useWorkflows(): UseWorkflowsReturn {
  const [workflows, setWorkflows] = useState<WorkflowDto[]>([])
  const [defaultWorkflow, setDefaultWorkflow] = useState<WorkflowDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      // Pass includeInactive=true so admin can see and reactivate inactive workflows
      const data = await bmsApi.admin.workflows.list(true)
      setWorkflows(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load workflows")
      setError(error)
      toast.error("Failed to load workflows", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadDefaultWorkflow = useCallback(async () => {
    try {
      const data = await bmsApi.admin.workflows.getDefault()
      setDefaultWorkflow(data)
    } catch (err) {
      setDefaultWorkflow(null)
    }
  }, [])

  const getWorkflow = useCallback(async (id: string): Promise<WorkflowDto | null> => {
    try {
      return await bmsApi.admin.workflows.get(id)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load workflow")
      toast.error("Failed to load workflow", {
        description: error.message,
      })
      return null
    }
  }, [])

  const getWorkflowByCode = useCallback(async (code: string): Promise<WorkflowDto | null> => {
    try {
      return await bmsApi.admin.workflows.getByCode(code)
    } catch (err) {
      return null
    }
  }, [])

  const createWorkflow = useCallback(
    async (request: CreateWorkflowRequest): Promise<WorkflowDto | null> => {
      try {
        setLoading(true)
        const newWorkflow = await bmsApi.admin.workflows.create(request)
        setWorkflows((prev) => [...prev, newWorkflow])
        toast.success("Workflow created successfully")
        return newWorkflow
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create workflow")
        toast.error("Failed to create workflow", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const updateWorkflow = useCallback(
    async (id: string, request: UpdateWorkflowRequest): Promise<WorkflowDto | null> => {
      try {
        setLoading(true)
        const updatedWorkflow = await bmsApi.admin.workflows.update(id, request)
        setWorkflows((prev) =>
          prev.map((workflow) => (workflow.id === id ? updatedWorkflow : workflow))
        )
        toast.success("Workflow updated successfully")
        return updatedWorkflow
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update workflow")
        toast.error("Failed to update workflow", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const deleteWorkflow = useCallback(async (id: string): Promise<boolean> => {
    try {
      setLoading(true)
      await bmsApi.admin.workflows.delete(id)
      setWorkflows((prev) => prev.filter((workflow) => workflow.id !== id))
      toast.success("Workflow deleted successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete workflow")
      toast.error("Failed to delete workflow", {
        description: error.message,
      })
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  const activateWorkflow = useCallback(
    async (id: string): Promise<WorkflowDto | null> => {
      try {
        setLoading(true)
        // Find the current workflow to preserve its fields
        const current = workflows.find((w) => w.id === id)
        if (!current) {
          toast.error("Workflow not found")
          return null
        }
        const request: UpdateWorkflowRequest = {
          name: current.name || "",
          description: current.description || undefined,
          steps: current.steps || [],
          isDefault: current.isDefault || false,
          isActive: true,
          defaultTaskTimeoutHours: 48,
        }
        const workflow = await bmsApi.admin.workflows.update(id, request)
        setWorkflows((prev) =>
          prev.map((w) => (w.id === id ? workflow : w))
        )
        toast.success("Workflow activated")
        return workflow
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to activate workflow")
        toast.error("Failed to activate workflow", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [workflows]
  )

  const deactivateWorkflow = useCallback(
    async (id: string): Promise<WorkflowDto | null> => {
      try {
        setLoading(true)
        // Find the current workflow to preserve its fields
        const current = workflows.find((w) => w.id === id)
        if (!current) {
          toast.error("Workflow not found")
          return null
        }
        const request: UpdateWorkflowRequest = {
          name: current.name || "",
          description: current.description || undefined,
          steps: current.steps || [],
          isDefault: current.isDefault || false,
          isActive: false,
          defaultTaskTimeoutHours: 48,
        }
        const workflow = await bmsApi.admin.workflows.update(id, request)
        setWorkflows((prev) =>
          prev.map((w) => (w.id === id ? workflow : w))
        )
        toast.success("Workflow deactivated")
        return workflow
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to deactivate workflow")
        toast.error("Failed to deactivate workflow", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [workflows]
  )

  return {
    workflows,
    defaultWorkflow,
    loading,
    error,
    loadWorkflows,
    loadDefaultWorkflow,
    getWorkflow,
    getWorkflowByCode,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    activateWorkflow,
    deactivateWorkflow,
  }
}
