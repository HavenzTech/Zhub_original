import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useCompanies } from './useCompanies'

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
    companies: {
      getAll: vi.fn(),
      getByUser: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
  BmsApiError: MockBmsApiError,
}))

// Mock authService
vi.mock('@/lib/services/auth', () => ({
  authService: {
    getAuth: vi.fn(),
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
import { authService } from '@/lib/services/auth'
import { toast } from 'sonner'

const mockCompanies = [
  { id: '1', name: 'Company Alpha', status: 'active' },
  { id: '2', name: 'Company Beta', status: 'active' },
]

describe('useCompanies', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty companies and no loading', () => {
      const { result } = renderHook(() => useCompanies())
      expect(result.current.companies).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadCompanies', () => {
    it('should load companies from API', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue(mockCompanies)

      const { result } = renderHook(() => useCompanies())

      await act(async () => {
        await result.current.loadCompanies()
      })

      expect(result.current.companies).toEqual(mockCompanies)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue({ data: mockCompanies } as any)

      const { result } = renderHook(() => useCompanies())

      await act(async () => {
        await result.current.loadCompanies()
      })

      expect(result.current.companies).toEqual(mockCompanies)
    })

    it('should fallback to getByUser on 403 from getAll', async () => {
      const forbidden = new MockBmsApiError('Forbidden', 403)
      vi.mocked(bmsApi.companies.getAll).mockRejectedValue(forbidden)
      vi.mocked(bmsApi.companies.getByUser).mockResolvedValue(mockCompanies)
      vi.mocked(authService.getAuth).mockReturnValue({ userId: 'user-1' } as any)

      const { result } = renderHook(() => useCompanies())

      await act(async () => {
        await result.current.loadCompanies()
      })

      expect(bmsApi.companies.getByUser).toHaveBeenCalledWith('user-1')
      expect(result.current.companies).toEqual(mockCompanies)
      expect(result.current.error).toBeNull()
    })

    it('should show 403 toast when getAll returns 403 and no userId available', async () => {
      const forbidden = new MockBmsApiError('Forbidden', 403)
      vi.mocked(bmsApi.companies.getAll).mockRejectedValue(forbidden)
      vi.mocked(authService.getAuth).mockReturnValue(null)

      const { result } = renderHook(() => useCompanies())

      await act(async () => {
        await result.current.loadCompanies()
      })

      expect(result.current.error).toBeInstanceOf(MockBmsApiError)
      expect(toast.error).toHaveBeenCalledWith(
        'Access denied. The GET /company endpoint may not be implemented on the backend.'
      )
    })

    it('should set error and show toast on non-403 failure', async () => {
      vi.mocked(bmsApi.companies.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useCompanies())

      await act(async () => {
        await result.current.loadCompanies()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load companies', {
        description: 'Network error',
      })
    })
  })

  describe('createCompany', () => {
    it('should create a company and add to list', async () => {
      const newCompany = { id: '3', name: 'Company Gamma', status: 'active' }
      vi.mocked(bmsApi.companies.create).mockResolvedValue(newCompany)

      const { result } = renderHook(() => useCompanies())

      let created: any
      await act(async () => {
        created = await result.current.createCompany({ name: 'Company Gamma' })
      })

      expect(created).toEqual(newCompany)
      expect(result.current.companies).toContainEqual(newCompany)
      expect(toast.success).toHaveBeenCalledWith('Company created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.companies.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useCompanies())

      let created: any
      await act(async () => {
        created = await result.current.createCompany({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create company', {
        description: 'Validation error',
      })
    })
  })

  describe('updateCompany', () => {
    it('should update a company in the list', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue(mockCompanies)
      vi.mocked(bmsApi.companies.update).mockResolvedValue(undefined)

      const { result } = renderHook(() => useCompanies())

      // Load companies first
      await act(async () => {
        await result.current.loadCompanies()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateCompany('1', { name: 'Updated Alpha' })
      })

      expect(success!).toBe(true)
      expect(result.current.companies[0].name).toBe('Updated Alpha')
      expect(toast.success).toHaveBeenCalledWith('Company updated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.companies.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useCompanies())

      let success: boolean
      await act(async () => {
        success = await result.current.updateCompany('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update company', {
        description: 'Not found',
      })
    })
  })

  describe('deleteCompany', () => {
    it('should delete a company from the list', async () => {
      vi.mocked(bmsApi.companies.getAll).mockResolvedValue(mockCompanies)
      vi.mocked(bmsApi.companies.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useCompanies())

      await act(async () => {
        await result.current.loadCompanies()
      })
      expect(result.current.companies).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteCompany('1')
      })

      expect(success!).toBe(true)
      expect(result.current.companies).toHaveLength(1)
      expect(result.current.companies[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Company deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.companies.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useCompanies())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteCompany('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete company', {
        description: 'Forbidden',
      })
    })
  })

  describe('setCompanies', () => {
    it('should allow manually setting companies', async () => {
      const { result } = renderHook(() => useCompanies())

      act(() => {
        result.current.setCompanies([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.companies).toHaveLength(1)
      expect(result.current.companies[0].name).toBe('Manual')
    })
  })
})
