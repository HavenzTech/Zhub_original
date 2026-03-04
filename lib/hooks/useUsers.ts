import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import { extractArray } from "@/lib/utils/api"
import type { UserResponse, CreateUserRequest, CreateUserResponse } from "@/types/bms"
import { toast } from "sonner"

/** Normalize admin API responses (userId → id) for consistent frontend usage */
function normalizeUser<T extends { userId?: string; id?: string }>(user: T): T & { id: string | undefined } {
  return { ...user, id: user.id ?? user.userId }
}

interface UseUsersReturn {
  users: UserResponse[]
  loading: boolean
  error: Error | null
  loadUsers: () => Promise<void>
  createUser: (userData: CreateUserRequest) => Promise<CreateUserResponse | null>
  updateUser: (id: string, userData: Partial<UserResponse>) => Promise<boolean>
  deleteUser: (id: string) => Promise<boolean>
  setUsers: React.Dispatch<React.SetStateAction<UserResponse[]>>
}

/**
 * Hook for managing users via admin endpoints (/api/admin/users)
 * Handles fetching, creating, updating, and deactivating users
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.adminUsers.getAll()
      const normalized = extractArray<UserResponse>(data).map(normalizeUser)
      setUsers(normalized)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load users")
      setError(error)
      toast.error("Failed to load users", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const createUser = useCallback(
    async (userData: CreateUserRequest): Promise<CreateUserResponse | null> => {
      try {
        const newUser = (await bmsApi.adminUsers.create(userData)) as CreateUserResponse
        const normalized = normalizeUser(newUser)

        // Add to users list (convert CreateUserResponse to UserResponse)
        const userResponse: UserResponse = {
          id: normalized.id,
          email: normalized.email,
          name: normalized.name,
          role: normalized.role,
          faceEnrollmentRequired: normalized.faceEnrollmentRequired,
        }
        setUsers((prev: UserResponse[]) => [...prev, userResponse])

        toast.success("User created successfully")
        return normalized
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to create user")
        toast.error("Failed to create user", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateUser = useCallback(
    async (id: string, userData: Partial<UserResponse>): Promise<boolean> => {
      try {
        await bmsApi.adminUsers.update(id, userData)
        setUsers((prev: UserResponse[]) =>
          prev.map((user: UserResponse) =>
            user.id === id ? { ...user, ...userData } : user
          )
        )
        toast.success("User updated successfully")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update user")
        toast.error("Failed to update user", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteUser = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.adminUsers.deactivate(id)
      setUsers((prev: UserResponse[]) =>
        prev.filter((user: UserResponse) => user.id !== id)
      )
      toast.success("User deactivated successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to deactivate user")
      toast.error("Failed to deactivate user", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    users,
    loading,
    error,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    setUsers,
  }
}
