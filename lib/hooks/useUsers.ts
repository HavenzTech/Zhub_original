import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import { extractArray } from "@/lib/utils/api"
import type { UserResponse, CreateUserRequest, CreateUserResponse } from "@/types/bms"
import { toast } from "sonner"

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
 * Hook for managing users
 * Handles fetching, creating, updating, and deleting users
 */
export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.users.getAll()
      setUsers(extractArray<UserResponse>(data))
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
        const newUser = (await bmsApi.users.create(userData)) as CreateUserResponse

        // Add to users list (convert CreateUserResponse to UserResponse)
        const userResponse: UserResponse = {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          pictureUrl: newUser.pictureUrl,
          createdAt: newUser.createdAt,
          updatedAt: newUser.createdAt,
          role: newUser.role,
        }
        setUsers((prev: UserResponse[]) => [...prev, userResponse])

        toast.success("User created successfully")
        return newUser
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
        await bmsApi.users.update(id, userData)
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
      await bmsApi.users.delete(id)
      setUsers((prev: UserResponse[]) =>
        prev.filter((user: UserResponse) => user.id !== id)
      )
      toast.success("User deleted successfully")
      return true
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to delete user")
      toast.error("Failed to delete user", {
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
