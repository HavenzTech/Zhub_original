import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDashboard } from './useDashboard'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    companies: { getAll: vi.fn() },
    departments: { getAll: vi.fn() },
    projects: { getAll: vi.fn() },
    properties: { getAll: vi.fn() },
    bmsDevices: { getAll: vi.fn() },
    accessLogs: { getAll: vi.fn() },
    users: { getAll: vi.fn() },
    documents: { getAll: vi.fn() },
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { bmsApi } from '@/lib/services/bmsApi'
import { toast } from 'sonner'

describe('useDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty arrays and no loading', () => {
      const { result } = renderHook(() => useDashboard())
      expect(result.current.companies).toEqual([])
      expect(result.current.departments).toEqual([])
      expect(result.current.projects).toEqual([])
      expect(result.current.properties).toEqual([])
      expect(result.current.bmsDevices).toEqual([])
      expect(result.current.accessLogs).toEqual([])
      expect(result.current.users).toEqual([])
      expect(result.current.documents).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadDashboardData', () => {
    it('should load all data in parallel', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue([{ id: 'c1' }])
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue([{ id: 'd1' }])
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue([{ id: 'p1' }])
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue([{ id: 'pr1' }])
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue([{ id: 'bms1' }])
      vi.mocked(bmsApi.accessLogs.getAll).mockResolvedValue([{ id: 'al1' }])
      vi.mocked(bmsApi.users.getAll).mockResolvedValue([{ id: 'u1' }])
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue([{ id: 'doc1' }])

      const { result } = renderHook(() => useDashboard())

      await act(async () => {
        await result.current.loadDashboardData()
      })

      expect(result.current.companies).toEqual([{ id: 'c1' }])
      expect(result.current.departments).toEqual([{ id: 'd1' }])
      expect(result.current.projects).toEqual([{ id: 'p1' }])
      expect(result.current.properties).toEqual([{ id: 'pr1' }])
      expect(result.current.bmsDevices).toEqual([{ id: 'bms1' }])
      expect(result.current.accessLogs).toEqual([{ id: 'al1' }])
      expect(result.current.users).toEqual([{ id: 'u1' }])
      expect(result.current.documents).toEqual([{ id: 'doc1' }])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle data wrapper responses', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue({ data: [{ id: 'c1' }] } as any)
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue({ data: [{ id: 'd1' }] } as any)
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue({ data: [{ id: 'p1' }] } as any)
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue({ data: [{ id: 'pr1' }] } as any)
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue({ data: [{ id: 'bms1' }] } as any)
      vi.mocked(bmsApi.accessLogs.getAll).mockResolvedValue({ data: [{ id: 'al1' }] } as any)
      vi.mocked(bmsApi.users.getAll).mockResolvedValue({ data: [{ id: 'u1' }] } as any)
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue({ data: [{ id: 'doc1' }] } as any)

      const { result } = renderHook(() => useDashboard())

      await act(async () => {
        await result.current.loadDashboardData()
      })

      expect(result.current.companies).toEqual([{ id: 'c1' }])
      expect(result.current.projects).toEqual([{ id: 'p1' }])
    })

    it('should set error and toast when any request fails', async () => {
      vi.mocked(bmsApi.companies.getAll).mockRejectedValue(new Error('Server down'))
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.accessLogs.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.users.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue([])

      const { result } = renderHook(() => useDashboard())

      await act(async () => {
        await result.current.loadDashboardData()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Server down')
      expect(toast.error).toHaveBeenCalledWith('Failed to load dashboard data', {
        description: 'Server down',
      })
    })

    it('should call all 8 API endpoints', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.departments.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.properties.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.bmsDevices.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.accessLogs.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.users.getAll).mockResolvedValue([])
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue([])

      const { result } = renderHook(() => useDashboard())

      await act(async () => {
        await result.current.loadDashboardData()
      })

      expect(bmsApi.companies.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.departments.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.projects.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.properties.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.bmsDevices.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.accessLogs.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.users.getAll).toHaveBeenCalledTimes(1)
      expect(bmsApi.documents.getAll).toHaveBeenCalledTimes(1)
    })
  })
})
