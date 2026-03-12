import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  WorkflowTaskDto,
  CompleteTaskRequest,
  DelegateTaskRequest,
} from "@/types/bms"
import { toast } from "sonner"

interface UseWorkflowTasksReturn {
  myTasks: WorkflowTaskDto[]
  completedTasks: WorkflowTaskDto[]
  loading: boolean
  error: Error | null
  loadMyTasks: () => Promise<void>
  loadCompletedTasks: () => Promise<void>
  getTask: (taskId: string) => Promise<WorkflowTaskDto | null>
  completeTask: (taskId: string, request: CompleteTaskRequest) => Promise<WorkflowTaskDto | null>
  delegateTask: (taskId: string, request: DelegateTaskRequest) => Promise<WorkflowTaskDto | null>
}

/**
 * Hook for managing workflow tasks
 * Handles loading, completing, and delegating workflow approval tasks
 */
export function useWorkflowTasks(): UseWorkflowTasksReturn {
  const [myTasks, setMyTasks] = useState<WorkflowTaskDto[]>([])
  const [completedTasks, setCompletedTasks] = useState<WorkflowTaskDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadMyTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.workflowTasks.getMyTasks()
      // Handle both plain arrays and wrapped responses
      const tasks = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.items)
            ? (data as any).items
            : []
      setMyTasks(tasks)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load my tasks")
      setError(error)
      toast.error("Failed to load workflow tasks", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadCompletedTasks = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.workflowTasks.getAllTasks(false)
      // Handle both plain arrays and wrapped responses
      const allTasks = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.items)
            ? (data as any).items
            : []
      // Filter to only completed/resolved tasks
      setCompletedTasks(allTasks.filter((t: WorkflowTaskDto) =>
        t.status === "completed" || t.status === "approved" || t.status === "rejected"
      ))
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load completed tasks")
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [])

  const getTask = useCallback(async (taskId: string): Promise<WorkflowTaskDto | null> => {
    try {
      return await bmsApi.workflowTasks.getTask(taskId)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load task")
      toast.error("Failed to load task", {
        description: error.message,
      })
      return null
    }
  }, [])

  const completeTask = useCallback(
    async (taskId: string, request: CompleteTaskRequest): Promise<WorkflowTaskDto | null> => {
      try {
        setLoading(true)
        const task = await bmsApi.workflowTasks.complete(taskId, request)
        // Remove from my tasks after completion
        setMyTasks((prev) => prev.filter((t) => t.id !== taskId))
        const actionMessage = request.action === 'approve' ? 'approved' :
                             request.action === 'reject' ? 'rejected' :
                             'completed'
        toast.success(`Task ${actionMessage} successfully`)
        return task
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to complete task")
        toast.error("Failed to complete task", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const delegateTask = useCallback(
    async (taskId: string, request: DelegateTaskRequest): Promise<WorkflowTaskDto | null> => {
      try {
        setLoading(true)
        const task = await bmsApi.workflowTasks.delegate(taskId, request)
        // Remove from my tasks after delegation
        setMyTasks((prev) => prev.filter((t) => t.id !== taskId))
        toast.success("Task delegated successfully")
        return task
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delegate task")
        toast.error("Failed to delegate task", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    myTasks,
    completedTasks,
    loading,
    error,
    loadMyTasks,
    loadCompletedTasks,
    getTask,
    completeTask,
    delegateTask,
  }
}
