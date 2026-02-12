import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useFavoriteDocuments } from './useFavoriteDocuments'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    documentRecent: {
      getFavorites: vi.fn(),
      addFavorite: vi.fn(),
      removeFavorite: vi.fn(),
      reorderFavorites: vi.fn(),
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

const mockFavorites = [
  { id: 'f1', documentId: 'doc-1', title: 'Doc A', order: 0 },
  { id: 'f2', documentId: 'doc-2', title: 'Doc B', order: 1 },
]

describe('useFavoriteDocuments', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty favorites', () => {
      const { result } = renderHook(() => useFavoriteDocuments())
      expect(result.current.favorites).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadFavorites', () => {
    it('should load favorites from API', async () => {
      vi.mocked(bmsApi.documentRecent.getFavorites).mockResolvedValue(mockFavorites)

      const { result } = renderHook(() => useFavoriteDocuments())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.favorites).toEqual(mockFavorites)
    })

    it('should handle non-array response', async () => {
      vi.mocked(bmsApi.documentRecent.getFavorites).mockResolvedValue(null as any)

      const { result } = renderHook(() => useFavoriteDocuments())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.favorites).toEqual([])
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.documentRecent.getFavorites).mockRejectedValue(new Error('Network'))

      const { result } = renderHook(() => useFavoriteDocuments())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.error?.message).toBe('Network')
      expect(toast.error).toHaveBeenCalledWith('Failed to load favorites', {
        description: 'Network',
      })
    })
  })

  describe('addFavorite', () => {
    it('should add a favorite and append to list', async () => {
      const newFavorite = { id: 'f3', documentId: 'doc-3', title: 'Doc C', order: 2 }
      vi.mocked(bmsApi.documentRecent.addFavorite).mockResolvedValue(newFavorite)

      const { result } = renderHook(() => useFavoriteDocuments())

      let added: any
      await act(async () => {
        added = await result.current.addFavorite('doc-3')
      })

      expect(added).toEqual(newFavorite)
      expect(result.current.favorites).toContainEqual(newFavorite)
      expect(toast.success).toHaveBeenCalledWith('Added to favorites')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentRecent.addFavorite).mockRejectedValue(new Error('Already exists'))

      const { result } = renderHook(() => useFavoriteDocuments())

      let added: any
      await act(async () => {
        added = await result.current.addFavorite('doc-1')
      })

      expect(added).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to add to favorites', {
        description: 'Already exists',
      })
    })
  })

  describe('removeFavorite', () => {
    it('should remove a favorite from list', async () => {
      vi.mocked(bmsApi.documentRecent.getFavorites).mockResolvedValue(mockFavorites)
      vi.mocked(bmsApi.documentRecent.removeFavorite).mockResolvedValue(undefined)

      const { result } = renderHook(() => useFavoriteDocuments())

      await act(async () => {
        await result.current.loadFavorites()
      })
      expect(result.current.favorites).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.removeFavorite('doc-1')
      })

      expect(success!).toBe(true)
      expect(result.current.favorites).toHaveLength(1)
      expect(result.current.favorites[0].documentId).toBe('doc-2')
      expect(toast.success).toHaveBeenCalledWith('Removed from favorites')
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.documentRecent.removeFavorite).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useFavoriteDocuments())

      let success: boolean
      await act(async () => {
        success = await result.current.removeFavorite('doc-99')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to remove from favorites', {
        description: 'Not found',
      })
    })
  })

  describe('reorderFavorites', () => {
    it('should reorder and reload favorites', async () => {
      vi.mocked(bmsApi.documentRecent.reorderFavorites).mockResolvedValue(undefined)
      vi.mocked(bmsApi.documentRecent.getFavorites).mockResolvedValue(mockFavorites)

      const { result } = renderHook(() => useFavoriteDocuments())

      let success: boolean
      await act(async () => {
        success = await result.current.reorderFavorites([
          { documentId: 'doc-2', displayOrder: 0 },
          { documentId: 'doc-1', displayOrder: 1 },
        ])
      })

      expect(success!).toBe(true)
      expect(bmsApi.documentRecent.reorderFavorites).toHaveBeenCalledWith({
        items: [
          { documentId: 'doc-2', displayOrder: 0 },
          { documentId: 'doc-1', displayOrder: 1 },
        ],
      })
      // Should reload favorites after reorder
      expect(bmsApi.documentRecent.getFavorites).toHaveBeenCalled()
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.documentRecent.reorderFavorites).mockRejectedValue(new Error('Server error'))

      const { result } = renderHook(() => useFavoriteDocuments())

      let success: boolean
      await act(async () => {
        success = await result.current.reorderFavorites([])
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to reorder favorites', {
        description: 'Server error',
      })
    })
  })

  describe('isFavorite', () => {
    it('should return true for favorited document', async () => {
      vi.mocked(bmsApi.documentRecent.getFavorites).mockResolvedValue(mockFavorites)

      const { result } = renderHook(() => useFavoriteDocuments())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.isFavorite('doc-1')).toBe(true)
      expect(result.current.isFavorite('doc-2')).toBe(true)
    })

    it('should return false for non-favorited document', async () => {
      vi.mocked(bmsApi.documentRecent.getFavorites).mockResolvedValue(mockFavorites)

      const { result } = renderHook(() => useFavoriteDocuments())

      await act(async () => {
        await result.current.loadFavorites()
      })

      expect(result.current.isFavorite('doc-99')).toBe(false)
    })

    it('should return false when no favorites loaded', () => {
      const { result } = renderHook(() => useFavoriteDocuments())
      expect(result.current.isFavorite('doc-1')).toBe(false)
    })
  })
})
