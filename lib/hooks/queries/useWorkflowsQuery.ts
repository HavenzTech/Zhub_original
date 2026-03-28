import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { WorkflowDto, CreateWorkflowRequest, UpdateWorkflowRequest } from '@/types/bms'
import { toast } from 'sonner'

function extractList(data: unknown): WorkflowDto[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as WorkflowDto[]
    if (Array.isArray(obj.items)) return obj.items as WorkflowDto[]
  }
  return []
}

// --- Queries ---

export function useWorkflowsQuery() {
  return useQuery({
    queryKey: queryKeys.workflows.all,
    queryFn: async () => {
      const data = await bmsApi.admin.workflows.list(true)
      return extractList(data)
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

export function useDefaultWorkflowQuery() {
  return useQuery({
    queryKey: queryKeys.workflows.default,
    queryFn: () => bmsApi.admin.workflows.getDefault() as Promise<WorkflowDto>,
    staleTime: STALE_TIMES.STATIC,
  })
}

// --- Mutations ---

export function useCreateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateWorkflowRequest) => bmsApi.admin.workflows.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('Workflow created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create workflow', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWorkflowRequest }) =>
      bmsApi.admin.workflows.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('Workflow updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update workflow', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.admin.workflows.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('Workflow deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete workflow', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useActivateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      bmsApi.admin.workflows.update(id, { isActive: true } as UpdateWorkflowRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('Workflow activated')
    },
    onError: (err) => {
      toast.error('Failed to activate workflow', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeactivateWorkflow() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) =>
      bmsApi.admin.workflows.update(id, { isActive: false } as UpdateWorkflowRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] })
      toast.success('Workflow deactivated')
    },
    onError: (err) => {
      toast.error('Failed to deactivate workflow', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper ---

export function useWorkflowsQueryCompat() {
  const { data, isLoading, error, refetch } = useWorkflowsQuery()
  const defaultQuery = useDefaultWorkflowQuery()
  const createMutation = useCreateWorkflow()
  const updateMutation = useUpdateWorkflow()
  const deleteMutation = useDeleteWorkflow()
  const activateMutation = useActivateWorkflow()
  const deactivateMutation = useDeactivateWorkflow()

  return {
    workflows: data ?? [],
    defaultWorkflow: defaultQuery.data ?? null,
    loading: isLoading,
    error: error ?? null,
    loadWorkflows: async () => { await refetch() },
    loadDefaultWorkflow: async () => { await defaultQuery.refetch() },
    getWorkflow: async (id: string): Promise<WorkflowDto | null> => {
      try { return await bmsApi.admin.workflows.get(id) as WorkflowDto } catch { return null }
    },
    getWorkflowByCode: async (code: string): Promise<WorkflowDto | null> => {
      try { return await bmsApi.admin.workflows.getByCode(code) as WorkflowDto } catch { return null }
    },
    createWorkflow: async (request: CreateWorkflowRequest): Promise<WorkflowDto | null> => {
      try { return await createMutation.mutateAsync(request) as WorkflowDto } catch { return null }
    },
    updateWorkflow: async (id: string, request: UpdateWorkflowRequest): Promise<WorkflowDto | null> => {
      try { return await updateMutation.mutateAsync({ id, data: request }) as WorkflowDto } catch { return null }
    },
    deleteWorkflow: async (id: string): Promise<boolean> => {
      try { await deleteMutation.mutateAsync(id); return true } catch { return false }
    },
    activateWorkflow: async (id: string): Promise<WorkflowDto | null> => {
      try { return await activateMutation.mutateAsync(id) as WorkflowDto } catch { return null }
    },
    deactivateWorkflow: async (id: string): Promise<WorkflowDto | null> => {
      try { return await deactivateMutation.mutateAsync(id) as WorkflowDto } catch { return null }
    },
  }
}
