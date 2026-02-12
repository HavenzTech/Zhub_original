import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDocumentTypes } from './useDocumentTypes'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    admin: {
      documentTypes: {
        list: vi.fn(),
        get: vi.fn(),
        getByCode: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        validate: vi.fn(),
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

const mockDocumentTypes = [
  { id: '1', name: 'Drawing', code: 'DWG', isActive: true, allowedExtensions: ['.pdf', '.dwg'] },
  { id: '2', name: 'Specification', code: 'SPEC', isActive: true, allowedExtensions: ['.pdf', '.docx'] },
]

describe('useDocumentTypes', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty document types and no loading', () => {
      const { result } = renderHook(() => useDocumentTypes())
      expect(result.current.documentTypes).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadDocumentTypes', () => {
    it('should load document types from API', async () => {
      vi.mocked(bmsApi.admin.documentTypes.list).mockResolvedValue(mockDocumentTypes)

      const { result } = renderHook(() => useDocumentTypes())

      await act(async () => {
        await result.current.loadDocumentTypes()
      })

      expect(bmsApi.admin.documentTypes.list).toHaveBeenCalledWith(true)
      expect(result.current.documentTypes).toEqual(mockDocumentTypes)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle non-array response gracefully', async () => {
      vi.mocked(bmsApi.admin.documentTypes.list).mockResolvedValue(null as any)

      const { result } = renderHook(() => useDocumentTypes())

      await act(async () => {
        await result.current.loadDocumentTypes()
      })

      expect(result.current.documentTypes).toEqual([])
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.documentTypes.list).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDocumentTypes())

      await act(async () => {
        await result.current.loadDocumentTypes()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load document types', {
        description: 'Network error',
      })
    })
  })

  describe('getDocumentType', () => {
    it('should return a document type by id', async () => {
      const docType = mockDocumentTypes[0]
      vi.mocked(bmsApi.admin.documentTypes.get).mockResolvedValue(docType)

      const { result } = renderHook(() => useDocumentTypes())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getDocumentType('1')
      })

      expect(fetched).toEqual(docType)
      expect(bmsApi.admin.documentTypes.get).toHaveBeenCalledWith('1')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.documentTypes.get).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDocumentTypes())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getDocumentType('999')
      })

      expect(fetched).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to load document type', {
        description: 'Not found',
      })
    })
  })

  describe('getDocumentTypeByCode', () => {
    it('should return a document type by code', async () => {
      const docType = mockDocumentTypes[0]
      vi.mocked(bmsApi.admin.documentTypes.getByCode).mockResolvedValue(docType)

      const { result } = renderHook(() => useDocumentTypes())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getDocumentTypeByCode('DWG')
      })

      expect(fetched).toEqual(docType)
      expect(bmsApi.admin.documentTypes.getByCode).toHaveBeenCalledWith('DWG')
    })

    it('should return null on failure without toast', async () => {
      vi.mocked(bmsApi.admin.documentTypes.getByCode).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDocumentTypes())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getDocumentTypeByCode('INVALID')
      })

      expect(fetched).toBeNull()
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('createDocumentType', () => {
    it('should create a document type and add to list', async () => {
      const newType = { id: '3', name: 'Report', code: 'RPT', isActive: true, allowedExtensions: ['.pdf'] }
      vi.mocked(bmsApi.admin.documentTypes.create).mockResolvedValue(newType)

      const { result } = renderHook(() => useDocumentTypes())

      let created: any
      await act(async () => {
        created = await result.current.createDocumentType({ name: 'Report', code: 'RPT' } as any)
      })

      expect(created).toEqual(newType)
      expect(result.current.documentTypes).toContainEqual(newType)
      expect(toast.success).toHaveBeenCalledWith('Document type created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.documentTypes.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useDocumentTypes())

      let created: any
      await act(async () => {
        created = await result.current.createDocumentType({ name: '' } as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create document type', {
        description: 'Validation error',
      })
    })
  })

  describe('updateDocumentType', () => {
    it('should update a document type in the list', async () => {
      vi.mocked(bmsApi.admin.documentTypes.list).mockResolvedValue(mockDocumentTypes)
      const updatedType = { ...mockDocumentTypes[0], name: 'Updated Drawing' }
      vi.mocked(bmsApi.admin.documentTypes.update).mockResolvedValue(updatedType)

      const { result } = renderHook(() => useDocumentTypes())

      // Load document types first
      await act(async () => {
        await result.current.loadDocumentTypes()
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updateDocumentType('1', { name: 'Updated Drawing' } as any)
      })

      expect(updated).toEqual(updatedType)
      expect(result.current.documentTypes[0].name).toBe('Updated Drawing')
      expect(toast.success).toHaveBeenCalledWith('Document type updated successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.documentTypes.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDocumentTypes())

      let updated: any
      await act(async () => {
        updated = await result.current.updateDocumentType('999', { name: 'Nope' } as any)
      })

      expect(updated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to update document type', {
        description: 'Not found',
      })
    })
  })

  describe('deleteDocumentType', () => {
    it('should delete a document type from the list', async () => {
      vi.mocked(bmsApi.admin.documentTypes.list).mockResolvedValue(mockDocumentTypes)
      vi.mocked(bmsApi.admin.documentTypes.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDocumentTypes())

      await act(async () => {
        await result.current.loadDocumentTypes()
      })
      expect(result.current.documentTypes).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDocumentType('1')
      })

      expect(success!).toBe(true)
      expect(result.current.documentTypes).toHaveLength(1)
      expect(result.current.documentTypes[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Document type deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.documentTypes.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useDocumentTypes())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDocumentType('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete document type', {
        description: 'Forbidden',
      })
    })
  })

  describe('validateFile', () => {
    it('should validate a file against a document type', async () => {
      const validationResult = { isValid: true, errors: [] }
      vi.mocked(bmsApi.admin.documentTypes.validate).mockResolvedValue(validationResult)

      const mockFile = new File(['test'], 'test.pdf', { type: 'application/pdf' })

      const { result } = renderHook(() => useDocumentTypes())

      let validation: any
      await act(async () => {
        validation = await result.current.validateFile('1', mockFile)
      })

      expect(validation).toEqual(validationResult)
      expect(bmsApi.admin.documentTypes.validate).toHaveBeenCalledWith('1', mockFile)
    })

    it('should return null and show toast on validation failure', async () => {
      vi.mocked(bmsApi.admin.documentTypes.validate).mockRejectedValue(new Error('Invalid file type'))

      const mockFile = new File(['test'], 'test.exe', { type: 'application/exe' })

      const { result } = renderHook(() => useDocumentTypes())

      let validation: any
      await act(async () => {
        validation = await result.current.validateFile('1', mockFile)
      })

      expect(validation).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('File validation failed', {
        description: 'Invalid file type',
      })
    })
  })
})
