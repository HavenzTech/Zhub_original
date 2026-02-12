import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useBmsDevices } from './useBmsDevices'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    bmsDevices: {
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

const mockDevices = [
  { id: '1', name: 'HVAC Controller', type: 'controller', status: 'online' },
  { id: '2', name: 'Temperature Sensor', type: 'sensor', status: 'offline' },
]

describe('useBmsDevices', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty devices and no loading', () => {
      const { result } = renderHook(() => useBmsDevices())
      expect(result.current.devices).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadDevices', () => {
    it('should load devices from API', async () => {
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue(mockDevices)

      const { result } = renderHook(() => useBmsDevices())

      await act(async () => {
        await result.current.loadDevices()
      })

      expect(result.current.devices).toEqual(mockDevices)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(toast.success).toHaveBeenCalledWith('Loaded 2 devices')
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue({ data: mockDevices } as any)

      const { result } = renderHook(() => useBmsDevices())

      await act(async () => {
        await result.current.loadDevices()
      })

      expect(result.current.devices).toEqual(mockDevices)
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.bmsDevices.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useBmsDevices())

      await act(async () => {
        await result.current.loadDevices()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load BMS devices', {
        description: 'Network error',
      })
    })
  })

  describe('createDevice', () => {
    it('should create a device and add to list', async () => {
      const newDevice = { id: '3', name: 'New Sensor', type: 'sensor', status: 'online' }
      vi.mocked(bmsApi.bmsDevices.create).mockResolvedValue(newDevice)

      const { result } = renderHook(() => useBmsDevices())

      let created: any
      await act(async () => {
        created = await result.current.createDevice({ name: 'New Sensor' })
      })

      expect(created).toEqual(newDevice)
      expect(result.current.devices).toContainEqual(newDevice)
      expect(toast.success).toHaveBeenCalledWith('Device created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.bmsDevices.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useBmsDevices())

      let created: any
      await act(async () => {
        created = await result.current.createDevice({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create device', {
        description: 'Validation error',
      })
    })
  })

  describe('updateDevice', () => {
    it('should update a device in the list', async () => {
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue(mockDevices)
      vi.mocked(bmsApi.bmsDevices.update).mockResolvedValue(undefined)

      const { result } = renderHook(() => useBmsDevices())

      // Load devices first
      await act(async () => {
        await result.current.loadDevices()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateDevice('1', { name: 'Updated HVAC' })
      })

      expect(success!).toBe(true)
      expect(result.current.devices[0].name).toBe('Updated HVAC')
      expect(toast.success).toHaveBeenCalledWith('Device updated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.bmsDevices.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useBmsDevices())

      let success: boolean
      await act(async () => {
        success = await result.current.updateDevice('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update device', {
        description: 'Not found',
      })
    })
  })

  describe('deleteDevice', () => {
    it('should delete a device from the list', async () => {
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue(mockDevices)
      vi.mocked(bmsApi.bmsDevices.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useBmsDevices())

      await act(async () => {
        await result.current.loadDevices()
      })
      expect(result.current.devices).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDevice('1')
      })

      expect(success!).toBe(true)
      expect(result.current.devices).toHaveLength(1)
      expect(result.current.devices[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Device deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.bmsDevices.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useBmsDevices())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDevice('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete device', {
        description: 'Forbidden',
      })
    })
  })

  describe('setDevices', () => {
    it('should allow manually setting devices', async () => {
      const { result } = renderHook(() => useBmsDevices())

      act(() => {
        result.current.setDevices([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.devices).toHaveLength(1)
      expect(result.current.devices[0].name).toBe('Manual')
    })
  })
})
