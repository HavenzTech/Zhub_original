import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { FavoriteDocumentDto, FavoriteOrderItem, UpdateFavoriteOrderRequest } from "@/types/bms"
import { toast } from "sonner"

interface UseFavoriteDocumentsReturn {
  favorites: FavoriteDocumentDto[]
  loading: boolean
  error: Error | null
  loadFavorites: () => Promise<void>
  addFavorite: (documentId: string) => Promise<FavoriteDocumentDto | null>
  removeFavorite: (documentId: string) => Promise<boolean>
  reorderFavorites: (items: FavoriteOrderItem[]) => Promise<boolean>
  isFavorite: (documentId: string) => boolean
}

/**
 * Hook for managing favorite documents
 * Handles adding, removing, and reordering favorite documents
 */
export function useFavoriteDocuments(): UseFavoriteDocumentsReturn {
  const [favorites, setFavorites] = useState<FavoriteDocumentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadFavorites = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentRecent.getFavorites()
      setFavorites(Array.isArray(data) ? data : [])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load favorites")
      setError(error)
      toast.error("Failed to load favorites", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const addFavorite = useCallback(
    async (documentId: string): Promise<FavoriteDocumentDto | null> => {
      try {
        setLoading(true)
        const newFavorite = await bmsApi.documentRecent.addFavorite(documentId)
        setFavorites((prev) => [...prev, newFavorite])
        toast.success("Added to favorites")
        return newFavorite
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to add to favorites")
        toast.error("Failed to add to favorites", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const removeFavorite = useCallback(
    async (documentId: string): Promise<boolean> => {
      try {
        setLoading(true)
        await bmsApi.documentRecent.removeFavorite(documentId)
        setFavorites((prev) => prev.filter((fav) => fav.documentId !== documentId))
        toast.success("Removed from favorites")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to remove from favorites")
        toast.error("Failed to remove from favorites", {
          description: error.message,
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const reorderFavorites = useCallback(
    async (items: FavoriteOrderItem[]): Promise<boolean> => {
      try {
        setLoading(true)
        const request: UpdateFavoriteOrderRequest = { items }
        await bmsApi.documentRecent.reorderFavorites(request)
        // Reload to get updated order
        await loadFavorites()
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to reorder favorites")
        toast.error("Failed to reorder favorites", {
          description: error.message,
        })
        return false
      } finally {
        setLoading(false)
      }
    },
    [loadFavorites]
  )

  const isFavorite = useCallback(
    (documentId: string): boolean => {
      return favorites.some((fav) => fav.documentId === documentId)
    },
    [favorites]
  )

  return {
    favorites,
    loading,
    error,
    loadFavorites,
    addFavorite,
    removeFavorite,
    reorderFavorites,
    isFavorite,
  }
}
