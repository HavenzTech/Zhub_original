import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUsers } from './useUsers'

// Mock bmsApi - using adminUsers endpoints
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    adminUsers: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deactivate: vi.fn(),
    },
  },
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { bmsApi } from '@/lib/services/bmsApi'
import { toast } from 'sonner'

// Admin API returns userId, not id
const mockAdminUsers = [
  { userId: '1', email: 'alice@example.com', name: 'Alice', pictureUrl: '', createdAt: '2024-01-01', role: 'admin' },
  { userId: '2', email: 'bob@example.com', name: 'Bob', pictureUrl: '', createdAt: '2024-01-01', role: 'user' },
]

describe('useUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty users and no loading', () => {
      const { result } = renderHook(() => useUsers())
      expect(result.current.users).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadUsers', () => {
    it('should load users from admin API and normalize userId to id', async () => {
      vi.mocked(bmsApi.adminUsers.getAll).mockResolvedValue(mockAdminUsers)

      const { result } = renderHook(() => useUsers())

      await act(async () => {
        await result.current.loadUsers()
      })

      expect(result.current.users).toHaveLength(2)
      expect(result.current.users[0].id).toBe('1')
      expect(result.current.users[1].id).toBe('2')
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.adminUsers.getAll).mockResolvedValue({ data: mockAdminUsers } as any)

      const { result } = renderHook(() => useUsers())

      await act(async () => {
        await result.current.loadUsers()
      })

      expect(result.current.users).toHaveLength(2)
      expect(result.current.users[0].id).toBe('1')
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.adminUsers.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useUsers())

      await act(async () => {
        await result.current.loadUsers()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load users', {
        description: 'Network error',
      })
    })
  })

  describe('createUser', () => {
    it('should create a user and add to list with normalized userId', async () => {
      const createUserResponse = {
        userId: '3',
        email: 'charlie@example.com',
        name: 'Charlie',
        role: 'user',
        temporaryPassword: 'temp123',
        faceEnrollmentRequired: false,
      }
      vi.mocked(bmsApi.adminUsers.create).mockResolvedValue(createUserResponse)

      const { result } = renderHook(() => useUsers())

      let created: any
      await act(async () => {
        created = await result.current.createUser({
          email: 'charlie@example.com',
          name: 'Charlie',
        } as any)
      })

      // Returns the normalized response (userId mapped to id)
      expect(created.id).toBe('3')
      expect(created.userId).toBe('3')
      expect(created.temporaryPassword).toBe('temp123')
      // Adds a UserResponse to the list
      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0].id).toBe('3')
      expect(result.current.users[0].email).toBe('charlie@example.com')
      expect(result.current.users[0].name).toBe('Charlie')
      expect(result.current.users[0].role).toBe('user')
      expect(toast.success).toHaveBeenCalledWith('User created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.adminUsers.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useUsers())

      let created: any
      await act(async () => {
        created = await result.current.createUser({ email: '', name: '' } as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create user', {
        description: 'Validation error',
      })
    })
  })

  describe('updateUser', () => {
    it('should update a user in the list', async () => {
      vi.mocked(bmsApi.adminUsers.getAll).mockResolvedValue(mockAdminUsers)
      vi.mocked(bmsApi.adminUsers.update).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUsers())

      // Load users first
      await act(async () => {
        await result.current.loadUsers()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateUser('1', { name: 'Updated Alice' })
      })

      expect(success!).toBe(true)
      expect(result.current.users[0].name).toBe('Updated Alice')
      expect(toast.success).toHaveBeenCalledWith('User updated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.adminUsers.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useUsers())

      let success: boolean
      await act(async () => {
        success = await result.current.updateUser('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update user', {
        description: 'Not found',
      })
    })
  })

  describe('deleteUser', () => {
    it('should deactivate a user and remove from the list', async () => {
      vi.mocked(bmsApi.adminUsers.getAll).mockResolvedValue(mockAdminUsers)
      vi.mocked(bmsApi.adminUsers.deactivate).mockResolvedValue(undefined)

      const { result } = renderHook(() => useUsers())

      await act(async () => {
        await result.current.loadUsers()
      })
      expect(result.current.users).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteUser('1')
      })

      expect(success!).toBe(true)
      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('User deactivated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.adminUsers.deactivate).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useUsers())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteUser('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to deactivate user', {
        description: 'Forbidden',
      })
    })
  })

  describe('setUsers', () => {
    it('should allow manually setting users', async () => {
      const { result } = renderHook(() => useUsers())

      act(() => {
        result.current.setUsers([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0].name).toBe('Manual')
    })
  })
})
