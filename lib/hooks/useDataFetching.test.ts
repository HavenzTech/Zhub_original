import { describe, it, expect, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDataFetching } from './useDataFetching'

describe('useDataFetching', () => {
  describe('initial state', () => {
    it('should start with loading false and no data', () => {
      const fetchFn = vi.fn().mockResolvedValue([])
      const { result } = renderHook(() =>
        useDataFetching({ fetchFn, autoFetch: false })
      )
      expect(result.current.data).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should use initialData when provided', () => {
      const fetchFn = vi.fn().mockResolvedValue([])
      const { result } = renderHook(() =>
        useDataFetching({ fetchFn, autoFetch: false, initialData: 'initial' })
      )
      expect(result.current.data).toBe('initial')
    })
  })

  describe('autoFetch', () => {
    it('should fetch automatically when autoFetch is true (default)', async () => {
      const fetchFn = vi.fn().mockResolvedValue(['item1', 'item2'])
      const { result } = renderHook(() =>
        useDataFetching({ fetchFn })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(fetchFn).toHaveBeenCalledTimes(1)
      expect(result.current.data).toEqual(['item1', 'item2'])
    })

    it('should not fetch when autoFetch is false', () => {
      const fetchFn = vi.fn().mockResolvedValue([])
      renderHook(() =>
        useDataFetching({ fetchFn, autoFetch: false })
      )

      expect(fetchFn).not.toHaveBeenCalled()
    })
  })

  describe('loading states', () => {
    it('should set loading to true during fetch', async () => {
      let resolveFetch: (value: string) => void
      const fetchFn = vi.fn().mockImplementation(
        () => new Promise<string>((resolve) => { resolveFetch = resolve })
      )

      const { result } = renderHook(() =>
        useDataFetching({ fetchFn, autoFetch: false })
      )

      // Trigger fetch manually
      act(() => {
        result.current.refetch()
      })

      expect(result.current.loading).toBe(true)

      // Resolve the fetch
      await act(async () => {
        resolveFetch!('done')
      })

      expect(result.current.loading).toBe(false)
    })
  })

  describe('error handling', () => {
    it('should set error when fetch fails', async () => {
      const fetchFn = vi.fn().mockRejectedValue(new Error('Network error'))
      const { result } = renderHook(() =>
        useDataFetching({ fetchFn })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(result.current.data).toBeNull()
    })

    it('should wrap non-Error throws as Error', async () => {
      const fetchFn = vi.fn().mockRejectedValue('string error')
      const { result } = renderHook(() =>
        useDataFetching({ fetchFn })
      )

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('An error occurred')
    })

    it('should clear error on successful refetch', async () => {
      const fetchFn = vi.fn()
        .mockRejectedValueOnce(new Error('fail'))
        .mockResolvedValueOnce('success')

      const { result } = renderHook(() =>
        useDataFetching({ fetchFn })
      )

      // Wait for first (failed) fetch
      await waitFor(() => {
        expect(result.current.error).not.toBeNull()
      })

      // Refetch (succeeds)
      await act(async () => {
        await result.current.refetch()
      })

      expect(result.current.error).toBeNull()
      expect(result.current.data).toBe('success')
    })
  })

  describe('callbacks', () => {
    it('should call onSuccess with data on successful fetch', async () => {
      const onSuccess = vi.fn()
      const fetchFn = vi.fn().mockResolvedValue({ id: 1 })

      renderHook(() =>
        useDataFetching({ fetchFn, onSuccess })
      )

      await waitFor(() => {
        expect(onSuccess).toHaveBeenCalledWith({ id: 1 })
      })
    })

    it('should call onError with error on failed fetch', async () => {
      const onError = vi.fn()
      const fetchFn = vi.fn().mockRejectedValue(new Error('fail'))

      renderHook(() =>
        useDataFetching({ fetchFn, onError })
      )

      await waitFor(() => {
        expect(onError).toHaveBeenCalledWith(expect.any(Error))
      })
      expect(onError.mock.calls[0][0].message).toBe('fail')
    })
  })

  describe('refetch', () => {
    it('should allow manual refetch', async () => {
      const fetchFn = vi.fn()
        .mockResolvedValueOnce('first')
        .mockResolvedValueOnce('second')

      const { result } = renderHook(() =>
        useDataFetching({ fetchFn, autoFetch: false })
      )

      await act(async () => {
        await result.current.refetch()
      })
      expect(result.current.data).toBe('first')

      await act(async () => {
        await result.current.refetch()
      })
      expect(result.current.data).toBe('second')
    })
  })

  describe('setData', () => {
    it('should allow manually setting data', async () => {
      const fetchFn = vi.fn().mockResolvedValue('fetched')
      const { result } = renderHook(() =>
        useDataFetching({ fetchFn, autoFetch: false })
      )

      act(() => {
        result.current.setData('manual')
      })

      expect(result.current.data).toBe('manual')
    })
  })
})
