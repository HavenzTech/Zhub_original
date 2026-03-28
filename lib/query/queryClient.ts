import { QueryClient } from '@tanstack/react-query'
import { BmsApiError } from '@/lib/services/bmsApi'

function shouldRetry(failureCount: number, error: unknown): boolean {
  if (error instanceof BmsApiError) {
    // Always retry 429s (rate limited) up to 3 times
    if (error.status === 429) return failureCount < 3
    // Never retry other 4xx client errors
    if (error.status >= 400 && error.status < 500) return false
  }
  // Retry server errors (5xx) and network errors once
  return failureCount < 1
}

function getRetryDelay(attemptIndex: number, error: unknown): number {
  if (error instanceof BmsApiError && error.status === 429) {
    // Longer backoff for rate limits: 2s, 4s, 8s
    return Math.min(2000 * 2 ** attemptIndex, 16000)
  }
  // Standard backoff for other errors: 1s, 2s
  return Math.min(1000 * 2 ** attemptIndex, 30000)
}

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 2 * 60 * 1000,       // 2 minutes default
        gcTime: 10 * 60 * 1000,          // 10 minutes garbage collection
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: shouldRetry,
        retryDelay: getRetryDelay,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
