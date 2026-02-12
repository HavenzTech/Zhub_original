import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getStatusColor,
  formatCurrency,
  formatDate,
  getTimeAgo,
} from './companyHelpers'

describe('companyHelpers', () => {
  describe('getStatusColor', () => {
    it('should return green for active status', () => {
      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for inactive status', () => {
      expect(getStatusColor('inactive')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return yellow for pending status', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return gray for unknown status', () => {
      expect(getStatusColor('something-else')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for empty string', () => {
      expect(getStatusColor('')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('formatCurrency', () => {
    it('should format a normal number as CAD', () => {
      expect(formatCurrency(50000)).toBe('$50,000')
    })

    it('should format a large number', () => {
      expect(formatCurrency(1500000)).toBe('$1,500,000')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('N/A')
    })

    it('should return "N/A" for 0', () => {
      // Note: 0 is falsy, so !value is true
      expect(formatCurrency(0)).toBe('N/A')
    })
  })

  describe('formatDate', () => {
    it('should format an ISO date string with en-CA locale', () => {
      // Uses new Date() directly, so timezone can shift the day
      const result = formatDate('2025-06-15T12:00:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('Jun')
    })

    it('should return a string containing year and month', () => {
      const result = formatDate('2025-03-10T12:00:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('Mar')
    })
  })

  describe('getTimeAgo', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 15, 12, 0, 0)) // Jan 15, 2025 noon
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return "Just now" for less than 1 hour ago', () => {
      // 30 minutes ago
      const date = new Date(2025, 0, 15, 11, 30, 0).toISOString()
      expect(getTimeAgo(date)).toBe('Just now')
    })

    it('should return hours ago for same day', () => {
      // 3 hours ago
      const date = new Date(2025, 0, 15, 9, 0, 0).toISOString()
      expect(getTimeAgo(date)).toBe('3 hours ago')
    })

    it('should return "1 day ago" for yesterday', () => {
      // 25 hours ago
      const date = new Date(2025, 0, 14, 11, 0, 0).toISOString()
      expect(getTimeAgo(date)).toBe('1 day ago')
    })

    it('should return "X days ago" for multiple days', () => {
      // 5 days ago
      const date = new Date(2025, 0, 10, 12, 0, 0).toISOString()
      expect(getTimeAgo(date)).toBe('5 days ago')
    })
  })
})
