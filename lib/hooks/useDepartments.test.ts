import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDepartments } from './useDepartments'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    departments: {
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

const mockDepartments = [
  { id: '1', name: 'Engineering', status: 'active' },
  { id: '2', name: 'Marketing', status: 'active' },
]

describe('useDepartments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty departments and no loading', () => {
      const { result } = renderHook(() => useDepartments())
      expect(result.current.departments).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadDepartments', () => {
    it('should load departments from API', async () => {
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue(mockDepartments)

      const { result } = renderHook(() => useDepartments())

      await act(async () => {
        await result.current.loadDepartments()
      })

      expect(result.current.departments).toEqual(mockDepartments)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue({ data: mockDepartments } as any)

      const { result } = renderHook(() => useDepartments())

      await act(async () => {
        await result.current.loadDepartments()
      })

      expect(result.current.departments).toEqual(mockDepartments)
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.departments.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDepartments())

      await act(async () => {
        await result.current.loadDepartments()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load departments', {
        description: 'Network error',
      })
    })
  })

  describe('createDepartment', () => {
    it('should create a department and add to list', async () => {
      const newDepartment = { id: '3', name: 'Sales', status: 'active' }
      vi.mocked(bmsApi.departments.create).mockResolvedValue(newDepartment)

      const { result } = renderHook(() => useDepartments())

      let created: any
      await act(async () => {
        created = await result.current.createDepartment({ name: 'Sales' })
      })

      expect(created).toEqual(newDepartment)
      expect(result.current.departments).toContainEqual(newDepartment)
      expect(toast.success).toHaveBeenCalledWith('Department created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.departments.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useDepartments())

      let created: any
      await act(async () => {
        created = await result.current.createDepartment({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create department', {
        description: 'Validation error',
      })
    })
  })

  describe('updateDepartment', () => {
    it('should update a department in the list', async () => {
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue(mockDepartments)
      vi.mocked(bmsApi.departments.update).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDepartments())

      // Load departments first
      await act(async () => {
        await result.current.loadDepartments()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateDepartment('1', { name: 'Updated Engineering' })
      })

      expect(success!).toBe(true)
      expect(result.current.departments[0].name).toBe('Updated Engineering')
      expect(toast.success).toHaveBeenCalledWith('Department updated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.departments.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDepartments())

      let success: boolean
      await act(async () => {
        success = await result.current.updateDepartment('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update department', {
        description: 'Not found',
      })
    })
  })

  describe('deleteDepartment', () => {
    it('should delete a department from the list', async () => {
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue(mockDepartments)
      vi.mocked(bmsApi.departments.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDepartments())

      await act(async () => {
        await result.current.loadDepartments()
      })
      expect(result.current.departments).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDepartment('1')
      })

      expect(success!).toBe(true)
      expect(result.current.departments).toHaveLength(1)
      expect(result.current.departments[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Department deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.departments.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useDepartments())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDepartment('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete department', {
        description: 'Forbidden',
      })
    })
  })

  describe('setDepartments', () => {
    it('should allow manually setting departments', async () => {
      const { result } = renderHook(() => useDepartments())

      act(() => {
        result.current.setDepartments([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.departments).toHaveLength(1)
      expect(result.current.departments[0].name).toBe('Manual')
    })
  })
})
