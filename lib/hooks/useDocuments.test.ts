import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDocuments } from './useDocuments'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    documents: {
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

const mockDocuments = [
  { id: '1', name: 'Document Alpha', status: 'draft' },
  { id: '2', name: 'Document Beta', status: 'published' },
]

describe('useDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty documents and no loading', () => {
      const { result } = renderHook(() => useDocuments())
      expect(result.current.documents).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadDocuments', () => {
    it('should load documents from API', async () => {
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue(mockDocuments)

      const { result } = renderHook(() => useDocuments())

      await act(async () => {
        await result.current.loadDocuments()
      })

      expect(result.current.documents).toEqual(mockDocuments)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue({ data: mockDocuments } as any)

      const { result } = renderHook(() => useDocuments())

      await act(async () => {
        await result.current.loadDocuments()
      })

      expect(result.current.documents).toEqual(mockDocuments)
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.documents.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDocuments())

      await act(async () => {
        await result.current.loadDocuments()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load documents', {
        description: 'Network error',
      })
    })
  })

  describe('createDocument', () => {
    it('should create a document and add to list', async () => {
      const newDocument = { id: '3', name: 'Document Gamma', status: 'draft' }
      vi.mocked(bmsApi.documents.create).mockResolvedValue(newDocument)

      const { result } = renderHook(() => useDocuments())

      let created: any
      await act(async () => {
        created = await result.current.createDocument({ name: 'Document Gamma' })
      })

      expect(created).toEqual(newDocument)
      expect(result.current.documents).toContainEqual(newDocument)
      expect(toast.success).toHaveBeenCalledWith('Document created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.documents.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useDocuments())

      let created: any
      await act(async () => {
        created = await result.current.createDocument({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create document', {
        description: 'Validation error',
      })
    })
  })

  describe('updateDocument', () => {
    it('should update a document in the list', async () => {
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue(mockDocuments)
      vi.mocked(bmsApi.documents.update).mockResolvedValue({ id: '1', name: 'Updated Alpha' } as any)

      const { result } = renderHook(() => useDocuments())

      // Load documents first
      await act(async () => {
        await result.current.loadDocuments()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateDocument('1', { name: 'Updated Alpha' })
      })

      expect(success!).toBe(true)
      expect(result.current.documents[0].name).toBe('Updated Alpha')
      expect(toast.success).toHaveBeenCalledWith('Document updated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.documents.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDocuments())

      let success: boolean
      await act(async () => {
        success = await result.current.updateDocument('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update document', {
        description: 'Not found',
      })
    })
  })

  describe('deleteDocument', () => {
    it('should delete a document from the list', async () => {
      vi.mocked(bmsApi.documents.getAll).mockResolvedValue(mockDocuments)
      vi.mocked(bmsApi.documents.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDocuments())

      await act(async () => {
        await result.current.loadDocuments()
      })
      expect(result.current.documents).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDocument('1')
      })

      expect(success!).toBe(true)
      expect(result.current.documents).toHaveLength(1)
      expect(result.current.documents[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Document deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.documents.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useDocuments())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteDocument('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete document', {
        description: 'Forbidden',
      })
    })
  })

  describe('setDocuments', () => {
    it('should allow manually setting documents', async () => {
      const { result } = renderHook(() => useDocuments())

      act(() => {
        result.current.setDocuments([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.documents).toHaveLength(1)
      expect(result.current.documents[0].name).toBe('Manual')
    })
  })
})
