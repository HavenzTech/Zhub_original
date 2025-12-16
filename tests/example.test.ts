import { describe, it, expect } from 'vitest'

/**
 * Example unit tests to verify the testing setup works
 */
describe('Example Tests', () => {
  describe('Basic assertions', () => {
    it('should pass a simple equality test', () => {
      expect(1 + 1).toBe(2)
    })

    it('should work with objects', () => {
      const user = { name: 'John', role: 'admin' }
      expect(user).toEqual({ name: 'John', role: 'admin' })
    })

    it('should work with arrays', () => {
      const items = [1, 2, 3]
      expect(items).toHaveLength(3)
      expect(items).toContain(2)
    })
  })

  describe('Async tests', () => {
    it('should handle promises', async () => {
      const fetchData = () => Promise.resolve({ data: 'test' })
      const result = await fetchData()
      expect(result.data).toBe('test')
    })

    it('should handle async/await', async () => {
      const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
      await delay(10)
      expect(true).toBe(true)
    })
  })
})
