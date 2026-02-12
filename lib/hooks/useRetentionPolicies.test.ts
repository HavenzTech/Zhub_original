import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useRetentionPolicies } from './useRetentionPolicies'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    admin: {
      retentionPolicies: {
        list: vi.fn(),
        get: vi.fn(),
        getByCode: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
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

const mockPolicies = [
  { id: '1', name: '7 Year Retention', code: '7YR', retentionDays: 2555, isActive: true },
  { id: '2', name: '3 Year Retention', code: '3YR', retentionDays: 1095, isActive: true },
]

describe('useRetentionPolicies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty retention policies and no loading', () => {
      const { result } = renderHook(() => useRetentionPolicies())
      expect(result.current.retentionPolicies).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadRetentionPolicies', () => {
    it('should load retention policies from API', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.list).mockResolvedValue(mockPolicies)

      const { result } = renderHook(() => useRetentionPolicies())

      await act(async () => {
        await result.current.loadRetentionPolicies()
      })

      expect(bmsApi.admin.retentionPolicies.list).toHaveBeenCalledWith(true)
      expect(result.current.retentionPolicies).toEqual(mockPolicies)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle non-array response gracefully', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.list).mockResolvedValue(null as any)

      const { result } = renderHook(() => useRetentionPolicies())

      await act(async () => {
        await result.current.loadRetentionPolicies()
      })

      expect(result.current.retentionPolicies).toEqual([])
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.list).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useRetentionPolicies())

      await act(async () => {
        await result.current.loadRetentionPolicies()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load retention policies', {
        description: 'Network error',
      })
    })
  })

  describe('getRetentionPolicy', () => {
    it('should return a retention policy by id', async () => {
      const policy = mockPolicies[0]
      vi.mocked(bmsApi.admin.retentionPolicies.get).mockResolvedValue(policy)

      const { result } = renderHook(() => useRetentionPolicies())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getRetentionPolicy('1')
      })

      expect(fetched).toEqual(policy)
      expect(bmsApi.admin.retentionPolicies.get).toHaveBeenCalledWith('1')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.get).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useRetentionPolicies())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getRetentionPolicy('999')
      })

      expect(fetched).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to load retention policy', {
        description: 'Not found',
      })
    })
  })

  describe('getRetentionPolicyByCode', () => {
    it('should return a retention policy by code', async () => {
      const policy = mockPolicies[0]
      vi.mocked(bmsApi.admin.retentionPolicies.getByCode).mockResolvedValue(policy)

      const { result } = renderHook(() => useRetentionPolicies())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getRetentionPolicyByCode('7YR')
      })

      expect(fetched).toEqual(policy)
      expect(bmsApi.admin.retentionPolicies.getByCode).toHaveBeenCalledWith('7YR')
    })

    it('should return null on failure without toast', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.getByCode).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useRetentionPolicies())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getRetentionPolicyByCode('INVALID')
      })

      expect(fetched).toBeNull()
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('createRetentionPolicy', () => {
    it('should create a retention policy and add to list', async () => {
      const newPolicy = { id: '3', name: '1 Year Retention', code: '1YR', retentionDays: 365, isActive: true }
      vi.mocked(bmsApi.admin.retentionPolicies.create).mockResolvedValue(newPolicy)

      const { result } = renderHook(() => useRetentionPolicies())

      let created: any
      await act(async () => {
        created = await result.current.createRetentionPolicy({ name: '1 Year Retention', code: '1YR' } as any)
      })

      expect(created).toEqual(newPolicy)
      expect(result.current.retentionPolicies).toContainEqual(newPolicy)
      expect(toast.success).toHaveBeenCalledWith('Retention policy created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useRetentionPolicies())

      let created: any
      await act(async () => {
        created = await result.current.createRetentionPolicy({ name: '' } as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create retention policy', {
        description: 'Validation error',
      })
    })
  })

  describe('updateRetentionPolicy', () => {
    it('should update a retention policy in the list', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.list).mockResolvedValue(mockPolicies)
      const updatedPolicy = { ...mockPolicies[0], name: 'Updated 7 Year' }
      vi.mocked(bmsApi.admin.retentionPolicies.update).mockResolvedValue(updatedPolicy)

      const { result } = renderHook(() => useRetentionPolicies())

      // Load policies first
      await act(async () => {
        await result.current.loadRetentionPolicies()
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updateRetentionPolicy('1', { name: 'Updated 7 Year' } as any)
      })

      expect(updated).toEqual(updatedPolicy)
      expect(result.current.retentionPolicies[0].name).toBe('Updated 7 Year')
      expect(toast.success).toHaveBeenCalledWith('Retention policy updated successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useRetentionPolicies())

      let updated: any
      await act(async () => {
        updated = await result.current.updateRetentionPolicy('999', { name: 'Nope' } as any)
      })

      expect(updated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to update retention policy', {
        description: 'Not found',
      })
    })
  })

  describe('deleteRetentionPolicy', () => {
    it('should delete a retention policy from the list', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.list).mockResolvedValue(mockPolicies)
      vi.mocked(bmsApi.admin.retentionPolicies.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useRetentionPolicies())

      await act(async () => {
        await result.current.loadRetentionPolicies()
      })
      expect(result.current.retentionPolicies).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteRetentionPolicy('1')
      })

      expect(success!).toBe(true)
      expect(result.current.retentionPolicies).toHaveLength(1)
      expect(result.current.retentionPolicies[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Retention policy deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.retentionPolicies.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useRetentionPolicies())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteRetentionPolicy('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete retention policy', {
        description: 'Forbidden',
      })
    })
  })
})
