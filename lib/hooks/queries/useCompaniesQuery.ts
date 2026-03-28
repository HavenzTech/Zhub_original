import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi, BmsApiError } from '@/lib/services/bmsApi'
import { authService } from '@/lib/services/auth'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { Company } from '@/types/bms'
import { toast } from 'sonner'

// --- Queries ---

export function useCompaniesQuery() {
  return useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: async () => {
      try {
        const data = await bmsApi.companies.getAll()
        return extractArray<Company>(data)
      } catch (err) {
        // Fallback: if 403, try user-specific companies
        if (err instanceof BmsApiError && err.status === 403) {
          const auth = authService.getAuth()
          if (auth?.userId) {
            const data = await bmsApi.companies.getByUser(auth.userId)
            return extractArray<Company>(data)
          }
        }
        throw err
      }
    },
    staleTime: STALE_TIMES.STATIC,
  })
}

// --- Mutations ---

export function useCreateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Company>) => bmsApi.companies.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      toast.success('Company created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create company', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Company> }) =>
      bmsApi.companies.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      toast.success('Company updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update company', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteCompany() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.companies.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.companies.all })
      toast.success('Company deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete company', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper matching old useCompanies() return shape ---

export function useCompaniesQueryCompat() {
  const { data, isLoading, error, refetch } = useCompaniesQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateCompany()
  const updateMutation = useUpdateCompany()
  const deleteMutation = useDeleteCompany()

  return {
    companies: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadCompanies: async () => { await refetch() },
    createCompany: async (companyData: Partial<Company>): Promise<Company | null> => {
      try {
        return await createMutation.mutateAsync(companyData) as Company
      } catch {
        return null
      }
    },
    updateCompany: async (id: string, companyData: Partial<Company>): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: companyData })
        return true
      } catch {
        return false
      }
    },
    deleteCompany: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
    setCompanies: (updater: React.SetStateAction<Company[]>) => {
      queryClient.setQueryData(queryKeys.companies.all, (old: Company[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
