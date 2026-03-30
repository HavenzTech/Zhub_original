import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { BmsDevice } from '@/types/bms'
import { toast } from 'sonner'

// --- Queries ---

export function useBmsDevicesQuery() {
  return useQuery({
    queryKey: queryKeys.bmsDevices.all,
    queryFn: async () => {
      const data = await bmsApi.bmsDevices.getAll()
      return extractArray<BmsDevice>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

// --- Mutations ---

export function useCreateBmsDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<BmsDevice>) => bmsApi.bmsDevices.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bmsDevices.all })
      toast.success('Device created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create device', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateBmsDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BmsDevice> }) =>
      bmsApi.bmsDevices.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bmsDevices.all })
      toast.success('Device updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update device', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteBmsDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.bmsDevices.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.bmsDevices.all })
      toast.success('Device deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete device', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper ---

export function useBmsDevicesQueryCompat() {
  const { data, isLoading, error, refetch } = useBmsDevicesQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateBmsDevice()
  const updateMutation = useUpdateBmsDevice()
  const deleteMutation = useDeleteBmsDevice()

  return {
    devices: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadDevices: async () => { await refetch() },
    createDevice: async (deviceData: Partial<BmsDevice>): Promise<BmsDevice | null> => {
      try { return await createMutation.mutateAsync(deviceData) as BmsDevice } catch { return null }
    },
    updateDevice: async (id: string, deviceData: Partial<BmsDevice>): Promise<boolean> => {
      try { await updateMutation.mutateAsync({ id, data: deviceData }); return true } catch { return false }
    },
    deleteDevice: async (id: string): Promise<boolean> => {
      try { await deleteMutation.mutateAsync(id); return true } catch { return false }
    },
    setDevices: (updater: React.SetStateAction<BmsDevice[]>) => {
      queryClient.setQueryData(queryKeys.bmsDevices.all, (old: BmsDevice[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
