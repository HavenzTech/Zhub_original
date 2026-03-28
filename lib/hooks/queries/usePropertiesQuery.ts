import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi, BmsApiError } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { Property } from '@/types/bms'
import { toast } from 'sonner'

// --- Queries ---

export function usePropertiesQuery() {
  return useQuery({
    queryKey: queryKeys.properties.all,
    queryFn: async () => {
      const data = await bmsApi.properties.getAll()
      return extractArray<Property>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

// --- Mutations ---

export function useCreateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => bmsApi.properties.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      toast.success('Property created successfully!')
    },
    onError: (err) => {
      const msg = err instanceof BmsApiError ? err.message : 'Failed to create property'
      toast.error(msg)
    },
  })
}

export function useUpdateProperty() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      bmsApi.properties.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all })
      toast.success('Property updated successfully!')
    },
    onError: (err) => {
      const msg = err instanceof BmsApiError ? err.message : 'Failed to update property'
      toast.error(msg)
    },
  })
}

// --- Compat wrapper ---

export function usePropertiesQueryCompat() {
  const { data, isLoading, error, refetch } = usePropertiesQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateProperty()
  const updateMutation = useUpdateProperty()

  return {
    properties: data ?? [],
    loading: isLoading,
    error: error ? (error instanceof Error ? error.message : 'Unknown error') : null,
    loadProperties: async () => { await refetch() },
    createProperty: async (propertyData: any): Promise<Property | null> => {
      try {
        return await createMutation.mutateAsync(propertyData) as Property
      } catch {
        return null
      }
    },
    updateProperty: async (id: string, propertyData: any): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: propertyData })
        return true
      } catch {
        return false
      }
    },
    setProperties: (updater: React.SetStateAction<Property[]>) => {
      queryClient.setQueryData(queryKeys.properties.all, (old: Property[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
