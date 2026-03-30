import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { Department } from '@/types/bms'
import { toast } from 'sonner'

// --- Queries ---

export function useDepartmentsQuery() {
  return useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: async () => {
      const data = await bmsApi.departments.getAll()
      return extractArray<Department>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

// --- Mutations ---

export function useCreateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Department>) => bmsApi.departments.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all })
      toast.success('Department created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create department', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) =>
      bmsApi.departments.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all })
      toast.success('Department updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update department', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.departments.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.departments.all })
      toast.success('Department deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete department', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper ---

export function useDepartmentsQueryCompat() {
  const { data, isLoading, error, refetch } = useDepartmentsQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateDepartment()
  const updateMutation = useUpdateDepartment()
  const deleteMutation = useDeleteDepartment()

  return {
    departments: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadDepartments: async () => { await refetch() },
    createDepartment: async (departmentData: Partial<Department>): Promise<Department | null> => {
      try {
        return await createMutation.mutateAsync(departmentData) as Department
      } catch {
        return null
      }
    },
    updateDepartment: async (id: string, departmentData: Partial<Department>): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: departmentData })
        return true
      } catch {
        return false
      }
    },
    deleteDepartment: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
    setDepartments: (updater: React.SetStateAction<Department[]>) => {
      queryClient.setQueryData(queryKeys.departments.all, (old: Department[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
