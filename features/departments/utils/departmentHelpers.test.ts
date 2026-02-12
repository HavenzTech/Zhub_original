import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  formatCurrency,
  formatDate,
  getTimeAgo,
  getBudgetUtilization,
} from './departmentHelpers'

describe('departmentHelpers', () => {
  describe('formatCurrency', () => {
    it('should format a normal number as CAD', () => {
      expect(formatCurrency(75000)).toBe('$75,000')
    })

    it('should format a large number', () => {
      expect(formatCurrency(2000000)).toBe('$2,000,000')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('N/A')
    })

    it('should return "N/A" for 0', () => {
      expect(formatCurrency(0)).toBe('N/A')
    })
  })

  describe('formatDate', () => {
    it('should format an ISO date string', () => {
      const result = formatDate('2025-03-20T00:00:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('20')
    })

    it('should format a plain date string', () => {
      const result = formatDate('2025-12-25')
      expect(result).toContain('2025')
      expect(result).toContain('25')
    })
  })

  describe('getTimeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "Just now" for less than 1 hour ago', () => {
      const date = new Date(2025, 0, 15, 11, 45, 0).toISOString()
      expect(getTimeAgo(date)).toBe('Just now')
    })

    it('should return hours ago for same day', () => {
      const date = new Date(2025, 0, 15, 7, 0, 0).toISOString()
      expect(getTimeAgo(date)).toBe('5 hours ago')
    })

    it('should return "1 day ago" for yesterday', () => {
      const date = new Date(2025, 0, 14, 10, 0, 0).toISOString()
      expect(getTimeAgo(date)).toBe('1 day ago')
    })

    it('should return "X days ago" for multiple days', () => {
      const date = new Date(2025, 0, 12, 12, 0, 0).toISOString()
      expect(getTimeAgo(date)).toBe('3 days ago')
    })
  })

  describe('getBudgetUtilization', () => {
    it('should calculate percentage correctly', () => {
      expect(getBudgetUtilization(100000, 50000)).toBe(50)
    })

    it('should round to nearest integer', () => {
      expect(getBudgetUtilization(300, 100)).toBe(33)
    })

    it('should handle over-budget (> 100%)', () => {
      expect(getBudgetUtilization(100000, 150000)).toBe(150)
    })

    it('should return 0 when allocated is undefined', () => {
      expect(getBudgetUtilization(undefined, 50000)).toBe(0)
    })

    it('should return 0 when spent is undefined', () => {
      expect(getBudgetUtilization(100000, undefined)).toBe(0)
    })

    it('should return 0 when both are undefined', () => {
      expect(getBudgetUtilization(undefined, undefined)).toBe(0)
    })

    it('should return 0 when allocated is 0', () => {
      expect(getBudgetUtilization(0, 50000)).toBe(0)
    })

    it('should return 0 when spent is 0', () => {
      expect(getBudgetUtilization(100000, 0)).toBe(0)
    })
  })
})
