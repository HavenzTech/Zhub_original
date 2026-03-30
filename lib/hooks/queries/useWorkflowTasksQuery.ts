import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { WorkflowTaskDto, CompleteTaskRequest, DelegateTaskRequest } from '@/types/bms'
import { toast } from 'sonner'

function extractTasks(data: unknown): WorkflowTaskDto[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data
    if (Array.isArray(obj.items)) return obj.items
  }
  return []
}

// --- Queries ---

export function useMyWorkflowTasksQuery() {
  return useQuery({
    queryKey: queryKeys.workflowTasks.my,
    queryFn: async () => {
      const data = await bmsApi.workflowTasks.getMyTasks()
      return extractTasks(data)
    },
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

export function useCompletedWorkflowTasksQuery() {
  return useQuery({
    queryKey: queryKeys.workflowTasks.completed,
    queryFn: async () => {
      const data = await bmsApi.workflowTasks.getAllTasks(false)
      const allTasks = extractTasks(data)
      return allTasks.filter((t) =>
        t.status === 'completed' || t.status === 'approved' || t.status === 'rejected'
      )
    },
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

// --- Mutations ---

export function useCompleteWorkflowTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, request }: { taskId: string; request: CompleteTaskRequest }) =>
      bmsApi.workflowTasks.complete(taskId, request),
    onSuccess: (_, { request }) => {
      queryClient.invalidateQueries({ queryKey: ['workflowTasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      const actionMessage = request.action === 'approve' ? 'approved' :
                           request.action === 'reject' ? 'rejected' :
                           'completed'
      toast.success(`Task ${actionMessage} successfully`)
    },
    onError: (err) => {
      toast.error('Failed to complete task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDelegateWorkflowTask() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ taskId, request }: { taskId: string; request: DelegateTaskRequest }) =>
      bmsApi.workflowTasks.delegate(taskId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflowTasks'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('Task delegated successfully')
    },
    onError: (err) => {
      toast.error('Failed to delegate task', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper matching old useWorkflowTasks() return shape ---

export function useWorkflowTasksQueryCompat() {
  const myTasksQuery = useMyWorkflowTasksQuery()
  const completedTasksQuery = useCompletedWorkflowTasksQuery()
  const completeMutation = useCompleteWorkflowTask()
  const delegateMutation = useDelegateWorkflowTask()

  return {
    myTasks: myTasksQuery.data ?? [],
    completedTasks: completedTasksQuery.data ?? [],
    loading: myTasksQuery.isLoading || completedTasksQuery.isLoading,
    error: myTasksQuery.error ?? completedTasksQuery.error ?? null,
    loadMyTasks: async () => { await myTasksQuery.refetch() },
    loadCompletedTasks: async () => { await completedTasksQuery.refetch() },
    getTask: async (taskId: string): Promise<WorkflowTaskDto | null> => {
      try { return await bmsApi.workflowTasks.getTask(taskId) } catch { return null }
    },
    completeTask: async (taskId: string, request: CompleteTaskRequest): Promise<WorkflowTaskDto | null> => {
      try { return await completeMutation.mutateAsync({ taskId, request }) as WorkflowTaskDto } catch { return null }
    },
    delegateTask: async (taskId: string, request: DelegateTaskRequest): Promise<WorkflowTaskDto | null> => {
      try { return await delegateMutation.mutateAsync({ taskId, request }) as WorkflowTaskDto } catch { return null }
    },
  }
}
