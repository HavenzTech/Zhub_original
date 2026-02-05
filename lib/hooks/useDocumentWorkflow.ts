import { useState, useCallback } from "react"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import type {
  WorkflowInstanceDto,
  StartWorkflowRequest,
  CancelWorkflowRequest,
} from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentWorkflowReturn {
  currentWorkflow: WorkflowInstanceDto | null
  workflowHistory: WorkflowInstanceDto[]
  loading: boolean
  error: Error | null
  loadWorkflowStatus: () => Promise<void>
  loadWorkflowHistory: () => Promise<void>
  startWorkflow: (workflowId?: string) => Promise<WorkflowInstanceDto | null>
  cancelWorkflow: (reason: string) => Promise<WorkflowInstanceDto | null>
  getInstance: (instanceId: string) => Promise<WorkflowInstanceDto | null>
}

/**
 * Hook for managing document workflows
 * Handles starting, monitoring, and canceling document workflows
 */
export function useDocumentWorkflow(documentId: string): UseDocumentWorkflowReturn {
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowInstanceDto | null>(null)
  const [workflowHistory, setWorkflowHistory] = useState<WorkflowInstanceDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadWorkflowStatus = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentWorkflows.getStatus(documentId)
      setCurrentWorkflow(data)
    } catch (err) {
      // 404 is expected if no workflow is active - silently treat as no workflow
      const is404 = err instanceof BmsApiError && err.status === 404
      if (!is404) {
        const error = err instanceof Error ? err : new Error("Failed to load workflow status")
        setError(error)
      }
      setCurrentWorkflow(null)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const loadWorkflowHistory = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentWorkflows.getHistory(documentId)
      setWorkflowHistory(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load workflow history")
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const startWorkflow = useCallback(
    async (workflowId?: string): Promise<WorkflowInstanceDto | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const request: StartWorkflowRequest = workflowId ? { workflowId } : {}
        const instance = await bmsApi.documentWorkflows.start(documentId, request)
        setCurrentWorkflow(instance)
        toast.success("Workflow started successfully")
        return instance
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to start workflow")
        toast.error("Failed to start workflow", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId]
  )

  const cancelWorkflow = useCallback(
    async (reason: string): Promise<WorkflowInstanceDto | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const request: CancelWorkflowRequest = { reason }
        const instance = await bmsApi.documentWorkflows.cancel(documentId, request)
        setCurrentWorkflow(null)
        toast.success("Workflow cancelled")
        await loadWorkflowHistory()
        return instance
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to cancel workflow")
        toast.error("Failed to cancel workflow", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId, loadWorkflowHistory]
  )

  const getInstance = useCallback(
    async (instanceId: string): Promise<WorkflowInstanceDto | null> => {
      if (!documentId) return null
      try {
        return await bmsApi.documentWorkflows.getInstance(documentId, instanceId)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load workflow instance")
        toast.error("Failed to load workflow instance", {
          description: error.message,
        })
        return null
      }
    },
    [documentId]
  )

  return {
    currentWorkflow,
    workflowHistory,
    loading,
    error,
    loadWorkflowStatus,
    loadWorkflowHistory,
    startWorkflow,
    cancelWorkflow,
    getInstance,
  }
}
