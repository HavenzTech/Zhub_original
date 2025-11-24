import { useState, useEffect, useCallback } from "react"

interface UseDataFetchingOptions<T> {
  fetchFn: () => Promise<T>
  initialData?: T
  autoFetch?: boolean
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseDataFetchingReturn<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
  setData: (data: T | null) => void
}

/**
 * Generic hook for data fetching with loading and error states
 * @example
 * const { data, loading, error, refetch } = useDataFetching({
 *   fetchFn: () => bmsApi.companies.getAll(),
 *   autoFetch: true
 * })
 */
export function useDataFetching<T>({
  fetchFn,
  initialData,
  autoFetch = true,
  onSuccess,
  onError,
}: UseDataFetchingOptions<T>): UseDataFetchingReturn<T> {
  const [data, setData] = useState<T | null>(initialData ?? null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetchFn()
      setData(result)
      onSuccess?.(result)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("An error occurred")
      setError(error)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }, [fetchFn, onSuccess, onError])

  useEffect(() => {
    if (autoFetch) {
      fetchData()
    }
  }, [autoFetch, fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  }
}
