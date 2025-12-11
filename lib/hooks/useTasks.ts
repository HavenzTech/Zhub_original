import { useState, useCallback, Dispatch, SetStateAction } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import { extractArray } from "@/lib/utils/api"
import type { TaskDto, CreateTaskRequest, UpdateTaskRequest, PagedResult } from "@/types/bms"
import { toast } from "sonner"

interface TaskFilters {
  page?: number
  pageSize?: number
  status?: string
  priority?: string
  projectId?: string
  departmentId?: string
  propertyId?: string
  assignedToUserId?: string
  createdByUserId?: string
  search?: string
}

interface UseTasksReturn {
  tasks: TaskDto[]
  loading: boolean
  error: Error | null
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  loadTasks: (filters?: TaskFilters) => Promise<void>
  loadMyTasks: (status?: string) => Promise<void>
  loadProjectTasks: (projectId: string) => Promise<void>
  getTaskById: (id: string) => Promise<TaskDto | null>
  createTask: (taskData: CreateTaskRequest) => Promise<TaskDto | null>
  updateTask: (id: string, taskData: UpdateTaskRequest) => Promise<boolean>
  updateTaskStatus: (id: string, status: string) => Promise<boolean>
  assignTask: (id: string, userId?: string) => Promise<boolean>
  deleteTask: (id: string) => Promise<boolean>
  setTasks: Dispatch<SetStateAction<TaskDto[]>>
}

/**
 * Hook for managing tasks
 * Handles fetching, creating, updating, status changes, assignment, and deleting tasks
 */
export function useTasks(): UseTasksReturn {
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [hasMore, setHasMore] = useState(false)

  const loadTasks = useCallback(async (filters?: TaskFilters) => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.tasks.getAll(filters) as PagedResult<TaskDto>
      setTasks(data.data || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setPageSize(data.pageSize || 20)
      setHasMore(data.hasMore || false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load tasks")
      setError(error)
      toast.error("Failed to load tasks", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMyTasks = useCallback(async (status?: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.tasks.getMyTasks(status)
      setTasks(extractArray<TaskDto>(data))
      setTotal(extractArray<TaskDto>(data).length)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load your tasks")
      setError(error)
      toast.error("Failed to load your tasks", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadProjectTasks = useCallback(async (projectId: string) => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.tasks.getByProject(projectId)
      setTasks(extractArray<TaskDto>(data))
      setTotal(extractArray<TaskDto>(data).length)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load project tasks")
      setError(error)
      toast.error("Failed to load project tasks", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const getTaskById = useCallback(async (id: string): Promise<TaskDto | null> => {
    try {
      const task = await bmsApi.tasks.getById(id)
      return task as TaskDto
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load task")
      toast.error("Failed to load task", {
        description: error.message,
      })
      return null
    }
  }, [])

  const createTask = useCallback(
    async (taskData: CreateTaskRequest): Promise<TaskDto | null> => {
      try {
        const newTask = await bmsApi.tasks.create(taskData)
        setTasks((prev) => [newTask as TaskDto, ...prev])
        toast.success("Task created successfully")
        return newTask as TaskDto
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create task")
        toast.error("Failed to create task", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateTask = useCallback(
    async (id: string, taskData: UpdateTaskRequest): Promise<boolean> => {
      try {
        const updatedTask = await bmsApi.tasks.update(id, taskData) as TaskDto
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, ...updatedTask } : task
          )
        )
        toast.success("Task updated successfully")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update task")
        toast.error("Failed to update task", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const updateTaskStatus = useCallback(
    async (id: string, status: string): Promise<boolean> => {
      try {
        const updatedTask = await bmsApi.tasks.updateStatus(id, status)
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, status, ...(updatedTask as object) } : task
          )
        )
        toast.success(`Task status updated to ${status.replace('_', ' ')}`)
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update task status")
        toast.error("Failed to update task status", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const assignTask = useCallback(
    async (id: string, userId?: string): Promise<boolean> => {
      try {
        const updatedTask = await bmsApi.tasks.assign(id, userId)
        setTasks((prev) =>
          prev.map((task) =>
            task.id === id ? { ...task, assignedToUserId: userId || null, ...(updatedTask as object) } : task
          )
        )
        toast.success(userId ? "Task assigned successfully" : "Task unassigned")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to assign task")
        toast.error("Failed to assign task", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteTask = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.tasks.delete(id)
      setTasks((prev) => prev.filter((task) => task.id !== id))
      toast.success("Task deleted successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete task")
      toast.error("Failed to delete task", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    tasks,
    loading,
    error,
    total,
    page,
    pageSize,
    hasMore,
    loadTasks,
    loadMyTasks,
    loadProjectTasks,
    getTaskById,
    createTask,
    updateTask,
    updateTaskStatus,
    assignTask,
    deleteTask,
    setTasks,
  }
}
