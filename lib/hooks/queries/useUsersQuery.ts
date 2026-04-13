import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { UserResponse, CreateUserRequest, CreateUserResponse } from '@/types/bms'
import { toast } from 'sonner'

function normalizeUser<T extends { userId?: string; id?: string }>(user: T): T & { id: string | undefined } {
  return { ...user, id: user.id ?? user.userId }
}

// --- Queries ---

export function useUsersQuery() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const data = await bmsApi.users.getAll()
      return extractArray<UserResponse>(data).map(normalizeUser)
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

// --- Mutations ---

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      const newUser = (await bmsApi.adminUsers.create(userData)) as CreateUserResponse
      return normalizeUser(newUser)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create user', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<UserResponse> }) =>
      bmsApi.adminUsers.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update user', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.adminUsers.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all })
      toast.success('User deactivated successfully')
    },
    onError: (err) => {
      toast.error('Failed to deactivate user', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper matching old useUsers() return shape ---

export function useUsersQueryCompat() {
  const { data, isLoading, error, refetch } = useUsersQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateUser()
  const updateMutation = useUpdateUser()
  const deleteMutation = useDeleteUser()

  return {
    users: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadUsers: async () => { await refetch() },
    createUser: async (userData: CreateUserRequest): Promise<CreateUserResponse | null> => {
      try {
        return await createMutation.mutateAsync(userData) as CreateUserResponse
      } catch {
        return null
      }
    },
    updateUser: async (id: string, userData: Partial<UserResponse>): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: userData })
        return true
      } catch {
        return false
      }
    },
    deleteUser: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
    setUsers: (updater: React.SetStateAction<UserResponse[]>) => {
      queryClient.setQueryData(queryKeys.users.all, (old: UserResponse[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
