import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { RetentionPolicyDto, CreateRetentionPolicyRequest, UpdateRetentionPolicyRequest } from '@/types/bms'
import { toast } from 'sonner'

function extractList(data: unknown): RetentionPolicyDto[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (Array.isArray(obj.data)) return obj.data as RetentionPolicyDto[]
    if (Array.isArray(obj.items)) return obj.items as RetentionPolicyDto[]
  }
  return []
}

// --- Queries ---

export function useRetentionPoliciesQuery() {
  return useQuery({
    queryKey: queryKeys.retentionPolicies.all,
    queryFn: async () => {
      const data = await bmsApi.admin.retentionPolicies.list(true)
      return extractList(data)
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

// --- Mutations ---

export function useCreateRetentionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateRetentionPolicyRequest) => bmsApi.admin.retentionPolicies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retentionPolicies.all })
      toast.success('Retention policy created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create retention policy', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateRetentionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRetentionPolicyRequest }) =>
      bmsApi.admin.retentionPolicies.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retentionPolicies.all })
      toast.success('Retention policy updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update retention policy', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteRetentionPolicy() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.admin.retentionPolicies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.retentionPolicies.all })
      toast.success('Retention policy deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete retention policy', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper ---

export function useRetentionPoliciesQueryCompat() {
  const { data, isLoading, error, refetch } = useRetentionPoliciesQuery()
  const createMutation = useCreateRetentionPolicy()
  const updateMutation = useUpdateRetentionPolicy()
  const deleteMutation = useDeleteRetentionPolicy()

  return {
    retentionPolicies: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadRetentionPolicies: async () => { await refetch() },
    getRetentionPolicy: async (id: string): Promise<RetentionPolicyDto | null> => {
      try { return await bmsApi.admin.retentionPolicies.get(id) as RetentionPolicyDto } catch { return null }
    },
    getRetentionPolicyByCode: async (code: string): Promise<RetentionPolicyDto | null> => {
      try { return await bmsApi.admin.retentionPolicies.getByCode(code) as RetentionPolicyDto } catch { return null }
    },
    createRetentionPolicy: async (request: CreateRetentionPolicyRequest): Promise<RetentionPolicyDto | null> => {
      try { return await createMutation.mutateAsync(request) as RetentionPolicyDto } catch { return null }
    },
    updateRetentionPolicy: async (id: string, request: UpdateRetentionPolicyRequest): Promise<RetentionPolicyDto | null> => {
      try { return await updateMutation.mutateAsync({ id, data: request }) as RetentionPolicyDto } catch { return null }
    },
    deleteRetentionPolicy: async (id: string): Promise<boolean> => {
      try { await deleteMutation.mutateAsync(id); return true } catch { return false }
    },
  }
}
