import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProperties } from './useProperties'

// Must use vi.hoisted so the class is available to hoisted vi.mock factories
const { MockBmsApiError } = vi.hoisted(() => {
  class MockBmsApiError extends Error {
    status: number
    code?: string
    details?: any
    constructor(message: string, status: number, code?: string, details?: any) {
      super(message)
      this.name = 'BmsApiError'
      this.status = status
      this.code = code
      this.details = details
    }
  }
  return { MockBmsApiError }
})

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    properties: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
  BmsApiError: MockBmsApiError,
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

const mockProperties = [
  { id: '1', name: 'Property Alpha', type: 'commercial', status: 'active' },
  { id: '2', name: 'Property Beta', type: 'residential', status: 'active' },
]

describe('useProperties', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty properties and no loading', () => {
      const { result } = renderHook(() => useProperties())
      expect(result.current.properties).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadProperties', () => {
    it('should load properties from API', async () => {
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue(mockProperties)

      const { result } = renderHook(() => useProperties())

      await act(async () => {
        await result.current.loadProperties()
      })

      expect(result.current.properties).toEqual(mockProperties)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue({ data: mockProperties } as any)

      const { result } = renderHook(() => useProperties())

      await act(async () => {
        await result.current.loadProperties()
      })

      expect(result.current.properties).toEqual(mockProperties)
    })

    it('should set error string and show toast on BmsApiError failure', async () => {
      const apiError = new MockBmsApiError('Server error', 500)
      vi.mocked(bmsApi.properties.getAll).mockRejectedValue(apiError)

      const { result } = renderHook(() => useProperties())

      await act(async () => {
        await result.current.loadProperties()
      })

      expect(result.current.error).toBe('Server error')
      expect(toast.error).toHaveBeenCalledWith('Server error')
    })

    it('should set default error message on non-BmsApiError failure', async () => {
      vi.mocked(bmsApi.properties.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useProperties())

      await act(async () => {
        await result.current.loadProperties()
      })

      expect(result.current.error).toBe('Failed to load properties')
      expect(toast.error).toHaveBeenCalledWith('Failed to load properties')
    })
  })

  describe('createProperty', () => {
    it('should create a property and add to list', async () => {
      const newProperty = { id: '3', name: 'Property Gamma', type: 'industrial', status: 'active' }
      vi.mocked(bmsApi.properties.create).mockResolvedValue(newProperty)

      const { result } = renderHook(() => useProperties())

      let created: any
      await act(async () => {
        created = await result.current.createProperty({ name: 'Property Gamma' })
      })

      expect(created).toEqual(newProperty)
      expect(result.current.properties).toContainEqual(newProperty)
      expect(toast.success).toHaveBeenCalledWith('Property created successfully!')
    })

    it('should return null and show toast on BmsApiError failure', async () => {
      const apiError = new MockBmsApiError('Validation failed', 400)
      vi.mocked(bmsApi.properties.create).mockRejectedValue(apiError)

      const { result } = renderHook(() => useProperties())

      let created: any
      await act(async () => {
        created = await result.current.createProperty({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Validation failed')
    })

    it('should return null and show default toast on non-BmsApiError failure', async () => {
      vi.mocked(bmsApi.properties.create).mockRejectedValue(new Error('Unknown error'))

      const { result } = renderHook(() => useProperties())

      let created: any
      await act(async () => {
        created = await result.current.createProperty({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create property')
    })
  })

  describe('updateProperty', () => {
    it('should update a property in the list', async () => {
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue(mockProperties)
      vi.mocked(bmsApi.properties.update).mockResolvedValue(undefined)

      const { result } = renderHook(() => useProperties())

      // Load properties first
      await act(async () => {
        await result.current.loadProperties()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateProperty('1', { name: 'Updated Alpha' })
      })

      expect(success!).toBe(true)
      expect(result.current.properties[0].name).toBe('Updated Alpha')
      expect(toast.success).toHaveBeenCalledWith('Property updated successfully!')
    })

    it('should return false and show toast on BmsApiError failure', async () => {
      const apiError = new MockBmsApiError('Not found', 404)
      vi.mocked(bmsApi.properties.update).mockRejectedValue(apiError)

      const { result } = renderHook(() => useProperties())

      let success: boolean
      await act(async () => {
        success = await result.current.updateProperty('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Not found')
    })

    it('should return false and show default toast on non-BmsApiError failure', async () => {
      vi.mocked(bmsApi.properties.update).mockRejectedValue(new Error('Unknown'))

      const { result } = renderHook(() => useProperties())

      let success: boolean
      await act(async () => {
        success = await result.current.updateProperty('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update property')
    })
  })

  describe('setProperties', () => {
    it('should allow manually setting properties', async () => {
      const { result } = renderHook(() => useProperties())

      act(() => {
        result.current.setProperties([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.properties).toHaveLength(1)
      expect(result.current.properties[0].name).toBe('Manual')
    })
  })
})
