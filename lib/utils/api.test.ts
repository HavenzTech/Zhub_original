import { describe, it, expect } from 'vitest'
import { extractArray } from './api'

describe('extractArray', () => {
  it('should return the array directly if response is an array', () => {
    const input = [1, 2, 3]
    expect(extractArray(input)).toEqual([1, 2, 3])
  })

  it('should extract data array from paginated response', () => {
    const input = { data: [{ id: 1 }, { id: 2 }] }
    expect(extractArray(input)).toEqual([{ id: 1 }, { id: 2 }])
  })

  it('should return empty array for null', () => {
    expect(extractArray(null)).toEqual([])
  })

  it('should return empty array for undefined', () => {
    expect(extractArray(undefined)).toEqual([])
  })

  it('should return empty array for a plain object without data key', () => {
    expect(extractArray({ items: [1, 2] })).toEqual([])
  })

  it('should return empty array when data is not an array', () => {
    expect(extractArray({ data: 'not-an-array' })).toEqual([])
  })

  it('should return empty array for a number', () => {
    expect(extractArray(42)).toEqual([])
  })

  it('should return empty array for a string', () => {
    expect(extractArray('hello')).toEqual([])
  })

  it('should handle empty array', () => {
    expect(extractArray([])).toEqual([])
  })

  it('should handle { data: [] }', () => {
    expect(extractArray({ data: [] })).toEqual([])
  })

  it('should preserve object types in array', () => {
    interface User { name: string }
    const input = { data: [{ name: 'Alice' }, { name: 'Bob' }] }
    const result = extractArray<User>(input)
    expect(result).toHaveLength(2)
    expect(result[0].name).toBe('Alice')
  })
})
