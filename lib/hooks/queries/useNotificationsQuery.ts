import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { authService } from '@/lib/services/auth'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { NotificationDto } from '@/types/bms'

// --- Queries ---

export function useUnreadCountQuery() {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount,
    queryFn: async () => {
      const token = authService.getToken()
      const companyId = authService.getCurrentCompanyId()
      if (!token) return 0

      bmsApi.setToken(token)
      if (companyId) bmsApi.setCompanyId(companyId)

      const result = await bmsApi.notifications.getUnreadCount()
      return (result as { count?: number }).count || 0
    },
    refetchInterval: 30_000,
    refetchIntervalInBackground: false,
    staleTime: 15_000,
  })
}

export function useNotificationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.notifications.all(),
    queryFn: async () => {
      const token = authService.getToken()
      const companyId = authService.getCurrentCompanyId()
      if (!token) return []

      bmsApi.setToken(token)
      if (companyId) bmsApi.setCompanyId(companyId)

      const result = await bmsApi.notifications.getAll({ pageSize: 50 })
      return ((result as { data?: NotificationDto[] }).data || []) as NotificationDto[]
    },
    enabled,
    staleTime: 0,
  })
}

// --- Mutations ---

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notificationId: string) => bmsApi.notifications.markAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => bmsApi.notifications.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    },
  })
}
