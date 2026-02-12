import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentSearch } from './useDocumentSearch'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    documentSearch: {
      search: vi.fn(),
      getCheckedOut: vi.fn(),
      getMyCheckouts: vi.fn(),
      getNeedsReview: vi.fn(),
    },
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

const mockSearchResults = {
  documents: [{ id: 'doc-1', title: 'Report A' }],
  total: 1,
  page: 1,
  pageSize: 20,
}

const mockCheckedOut = [
  { id: 'co1', documentId: 'doc-1', checkedOutBy: 'user-1' },
]

const mockNeedsReview = [
  { id: 'nr1', documentId: 'doc-2', reason: 'Expired retention' },
]

describe('useDocumentSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with null results and empty arrays', () => {
      const { result } = renderHook(() => useDocumentSearch())
      expect(result.current.results).toBeNull()
      expect(result.current.checkedOutDocuments).toEqual([])
      expect(result.current.myCheckouts).toEqual([])
      expect(result.current.needsReview).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('search', () => {
    it('should search documents and set results', async () => {
      vi.mocked(bmsApi.documentSearch.search).mockResolvedValue(mockSearchResults)

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.search({ query: 'report' } as any)
      })

      expect(result.current.results).toEqual(mockSearchResults)
      expect(bmsApi.documentSearch.search).toHaveBeenCalledWith({ query: 'report' })
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.documentSearch.search).mockRejectedValue(new Error('Bad request'))

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.search({ query: '' } as any)
      })

      expect(result.current.error?.message).toBe('Bad request')
      expect(toast.error).toHaveBeenCalledWith('Search failed', {
        description: 'Bad request',
      })
    })
  })

  describe('loadCheckedOutDocuments', () => {
    it('should load checked out documents', async () => {
      vi.mocked(bmsApi.documentSearch.getCheckedOut).mockResolvedValue(mockCheckedOut)

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadCheckedOutDocuments()
      })

      expect(result.current.checkedOutDocuments).toEqual(mockCheckedOut)
    })

    it('should handle non-array response', async () => {
      vi.mocked(bmsApi.documentSearch.getCheckedOut).mockResolvedValue(null as any)

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadCheckedOutDocuments()
      })

      expect(result.current.checkedOutDocuments).toEqual([])
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.documentSearch.getCheckedOut).mockRejectedValue(new Error('Access denied'))

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadCheckedOutDocuments()
      })

      expect(result.current.error?.message).toBe('Access denied')
      expect(toast.error).toHaveBeenCalledWith('Failed to load checked out documents', {
        description: 'Access denied',
      })
    })
  })

  describe('loadMyCheckouts', () => {
    it('should load my checkouts', async () => {
      vi.mocked(bmsApi.documentSearch.getMyCheckouts).mockResolvedValue(mockCheckedOut)

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadMyCheckouts()
      })

      expect(result.current.myCheckouts).toEqual(mockCheckedOut)
    })

    it('should set error on failure (no toast for my checkouts)', async () => {
      vi.mocked(bmsApi.documentSearch.getMyCheckouts).mockRejectedValue(new Error('Failed'))

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadMyCheckouts()
      })

      expect(result.current.error?.message).toBe('Failed')
      // loadMyCheckouts does NOT toast on error
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('loadNeedsReview', () => {
    it('should load documents needing review', async () => {
      vi.mocked(bmsApi.documentSearch.getNeedsReview).mockResolvedValue(mockNeedsReview)

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadNeedsReview()
      })

      expect(result.current.needsReview).toEqual(mockNeedsReview)
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.documentSearch.getNeedsReview).mockRejectedValue(new Error('Server error'))

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.loadNeedsReview()
      })

      expect(result.current.error?.message).toBe('Server error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load documents needing review', {
        description: 'Server error',
      })
    })
  })

  describe('clearResults', () => {
    it('should clear search results to null', async () => {
      vi.mocked(bmsApi.documentSearch.search).mockResolvedValue(mockSearchResults)

      const { result } = renderHook(() => useDocumentSearch())

      await act(async () => {
        await result.current.search({ query: 'test' } as any)
      })
      expect(result.current.results).not.toBeNull()

      act(() => {
        result.current.clearResults()
      })

      expect(result.current.results).toBeNull()
    })
  })
})
