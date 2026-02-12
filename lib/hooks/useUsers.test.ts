import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUsers } from './useUsers'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    users: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

const mockUsers = [
  { id: '1', email: 'alice@example.com', name: 'Alice', pictureUrl: '', createdAt: '2024-01-01', updatedAt: '2024-01-01', role: 'admin' },
  { id: '2', email: 'bob@example.com', name: 'Bob', pictureUrl: '', createdAt: '2024-01-01', updatedAt: '2024-01-01', role: 'user' },
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
    it('should load users from API', async () => {
      vi.mocked(bmsApi.users.getAll).mockResolvedValue(mockUsers)

      const { result } = renderHook(() => useUsers())

      await act(async () => {
        await result.current.loadUsers()
      })

      expect(result.current.users).toEqual(mockUsers)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.users.getAll).mockResolvedValue({ data: mockUsers } as any)

      const { result } = renderHook(() => useUsers())

      await act(async () => {
        await result.current.loadUsers()
      })

      expect(result.current.users).toEqual(mockUsers)
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.users.getAll).mockRejectedValue(new Error('Network error'))

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
    it('should create a user and add to list with CreateUserResponse conversion', async () => {
      const createUserResponse = {
        id: '3',
        email: 'charlie@example.com',
        name: 'Charlie',
        pictureUrl: '',
        createdAt: '2024-02-01',
        role: 'user',
        temporaryPassword: 'temp123',
      }
      vi.mocked(bmsApi.users.create).mockResolvedValue(createUserResponse)

      const { result } = renderHook(() => useUsers())

      let created: any
      await act(async () => {
        created = await result.current.createUser({
          email: 'charlie@example.com',
          name: 'Charlie',
        } as any)
      })

      // Returns the full CreateUserResponse (with temporaryPassword)
      expect(created).toEqual(createUserResponse)
      // But adds a converted UserResponse to the list (updatedAt = createdAt)
      expect(result.current.users).toHaveLength(1)
      expect(result.current.users[0]).toEqual({
        id: '3',
        email: 'charlie@example.com',
        name: 'Charlie',
        pictureUrl: '',
        createdAt: '2024-02-01',
        updatedAt: '2024-02-01',
        role: 'user',
      })
      expect(toast.success).toHaveBeenCalledWith('User created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.users.create).mockRejectedValue(new Error('Validation error'))

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
      vi.mocked(bmsApi.users.getAll).mockResolvedValue(mockUsers)
      vi.mocked(bmsApi.users.update).mockResolvedValue(undefined)

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
      vi.mocked(bmsApi.users.update).mockRejectedValue(new Error('Not found'))

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
    it('should delete a user from the list', async () => {
      vi.mocked(bmsApi.users.getAll).mockResolvedValue(mockUsers)
      vi.mocked(bmsApi.users.delete).mockResolvedValue(undefined)

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
      vi.mocked(bmsApi.users.delete).mockRejectedValue(new Error('Forbidden'))

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
