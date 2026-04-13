import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { TaskDto, CreateTaskRequest, UpdateTaskRequest, PagedResult, TaskRejectionDto, TaskHistoryEntryDto } from '@/types/bms'
import { toast } from 'sonner'

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

// --- Queries ---

export function useTasksQuery(filters?: TaskFilters) {
  return useQuery({
    queryKey: queryKeys.tasks.all(filters as Record<string, unknown>),
    queryFn: async () => {
      const data = await bmsApi.tasks.getAll(filters) as PagedResult<TaskDto>
      return {
        tasks: data.data || [],
        total: data.total || 0,
        page: data.page || 1,
        pageSize: data.pageSize || 20,
        hasMore: data.hasMore || false,
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
    placeholderData: (prev) => prev,
  })
}

export function useMyTasksQuery(status?: string) {
  return useQuery({
    queryKey: queryKeys.tasks.myTasks(status),
    queryFn: async () => {
      const data = await bmsApi.tasks.getMyTasks(status)
      return extractArray<TaskDto>(data)
    },
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

export function useProjectTasksQuery(projectId: string) {
  return useQuery({
    queryKey: queryKeys.projects.tasks(projectId),
    queryFn: async () => {
      const data = await bmsApi.tasks.getByProject(projectId, { pageSize: 1000 })
      return extractArray<TaskDto>(data)
    },
    enabled: !!projectId,
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

export function useTaskDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.tasks.detail(id),
    queryFn: () => bmsApi.tasks.getById(id) as Promise<TaskDto>,
    enabled: !!id,
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

// --- Mutations ---

export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateTaskRequest) => bmsApi.tasks.create(data) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskRequest }) =>
      bmsApi.tasks.update(id, data) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      bmsApi.tasks.updateStatus(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['workflowTasks'] })
      toast.success(`Task status updated to ${status.replace('_', ' ')}`)
    },
    onError: (err) => {
      toast.error('Failed to update task status', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useAddAssignee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      bmsApi.tasks.addAssignee(id, userId) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Assignee added')
    },
    onError: (err) => {
      toast.error('Failed to add assignee', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useRemoveAssignee() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) =>
      bmsApi.tasks.removeAssignee(id, userId) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Assignee removed')
    },
    onError: (err) => {
      toast.error('Failed to remove assignee', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useToggleComplete() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.tasks.toggleComplete(id) as Promise<TaskDto>,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      const isNowComplete = (result as TaskDto).status === 'completed'
      toast.success(isNowComplete ? 'Task completed' : 'Task reopened')
    },
    onError: (err) => {
      toast.error('Failed to toggle task completion', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.tasks.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useSubmitForReview() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.tasks.submitForReview(id) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['workflowTasks'] })
      toast.success('Task submitted for review')
    },
    onError: (err) => {
      toast.error('Failed to submit task for review', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useApproveTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.tasks.approve(id) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['workflowTasks'] })
      toast.success('Task approved')
    },
    onError: (err) => {
      toast.error('Failed to approve task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useRejectTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      bmsApi.tasks.reject(id, { reason }) as Promise<TaskDto>,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['workflowTasks'] })
      toast.success('Task rejected')
    },
    onError: (err) => {
      toast.error('Failed to reject task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper matching old useTasks() return shape ---

export function useTasksQueryCompat() {
  const queryClient = useQueryClient()
  const createMutation = useCreateTask()
  const updateMutation = useUpdateTask()
  const updateStatusMutation = useUpdateTaskStatus()
  const addAssigneeMutation = useAddAssignee()
  const removeAssigneeMutation = useRemoveAssignee()
  const toggleCompleteMutation = useToggleComplete()
  const deleteMutation = useDeleteTask()
  const submitForReviewMutation = useSubmitForReview()
  const approveMutation = useApproveTask()
  const rejectMutation = useRejectTask()

  // NOTE: The old hook's imperative pattern (call loadMyTasks → tasks updates)
  // doesn't map cleanly to React Query. Pages should migrate to use
  // useMyTasksQuery/useTasksQuery directly for full caching benefit.
  // This compat wrapper only covers mutation operations.

  return {
    createTask: async (data: CreateTaskRequest): Promise<TaskDto | null> => {
      try { return await createMutation.mutateAsync(data) } catch { return null }
    },
    updateTask: async (id: string, data: UpdateTaskRequest): Promise<boolean> => {
      try { await updateMutation.mutateAsync({ id, data }); return true } catch { return false }
    },
    updateTaskStatus: async (id: string, status: string): Promise<boolean> => {
      try { await updateStatusMutation.mutateAsync({ id, status }); return true } catch { return false }
    },
    addAssignee: async (id: string, userId: string): Promise<TaskDto | null> => {
      try { return await addAssigneeMutation.mutateAsync({ id, userId }) } catch { return null }
    },
    removeAssignee: async (id: string, userId: string): Promise<TaskDto | null> => {
      try { return await removeAssigneeMutation.mutateAsync({ id, userId }) } catch { return null }
    },
    toggleComplete: async (id: string): Promise<TaskDto | null> => {
      try { return await toggleCompleteMutation.mutateAsync(id) } catch { return null }
    },
    deleteTask: async (id: string): Promise<boolean> => {
      try { await deleteMutation.mutateAsync(id); return true } catch { return false }
    },
    submitForReview: async (id: string): Promise<TaskDto | null> => {
      try { return await submitForReviewMutation.mutateAsync(id) } catch { return null }
    },
    approveTask: async (id: string): Promise<TaskDto | null> => {
      try { return await approveMutation.mutateAsync(id) } catch { return null }
    },
    rejectTask: async (id: string, reason: string): Promise<TaskDto | null> => {
      try { return await rejectMutation.mutateAsync({ id, reason }) } catch { return null }
    },
    getTaskById: async (id: string): Promise<TaskDto | null> => {
      try { return await bmsApi.tasks.getById(id) as TaskDto } catch { return null }
    },
    getTaskRejections: async (id: string): Promise<TaskRejectionDto[]> => {
      try {
        const data = await bmsApi.tasks.getRejections(id)
        return (Array.isArray(data) ? data : ((data as any)?.data || [])) as TaskRejectionDto[]
      } catch { return [] }
    },
    getTaskHistory: async (id: string, page = 1, pageSize = 50): Promise<{ data: TaskHistoryEntryDto[]; total: number } | null> => {
      try {
        const result = await bmsApi.tasks.getHistory(id, { page, pageSize })
        const paged = result as { data: TaskHistoryEntryDto[]; total: number }
        return { data: paged.data || [], total: paged.total || 0 }
      } catch { return null }
    },
  }
}

export type { TaskFilters }
