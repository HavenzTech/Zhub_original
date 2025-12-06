/**
 * API utility functions for handling responses
 */

/**
 * Extract array from API response
 * Handles both direct arrays and paginated responses with { data: T[] } structure
 */
export function extractArray<T>(response: unknown): T[] {
  if (Array.isArray(response)) {
    return response as T[]
  }
  if (response && typeof response === 'object' && 'data' in response) {
    const data = (response as { data: unknown }).data
    if (Array.isArray(data)) {
      return data as T[]
    }
  }
  return []
}
