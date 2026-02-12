import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getPriorityColor,
  getScheduleStatusColor,
} from './projectHelpers'

describe('projectHelpers', () => {
  describe('formatCurrency', () => {
    it('should format a normal number as CAD', () => {
      expect(formatCurrency(250000)).toBe('$250,000')
    })

    it('should format a large number', () => {
      expect(formatCurrency(5000000)).toBe('$5,000,000')
    })

    it('should return "N/A" for null', () => {
      expect(formatCurrency(null)).toBe('N/A')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('N/A')
    })

    it('should format 0 as currency', () => {
      // This version checks === null/undefined, so 0 should format
      expect(formatCurrency(0)).toBe('$0')
    })
  })

  describe('formatDate', () => {
    it('should return "N/A" for null', () => {
      expect(formatDate(null)).toBe('N/A')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatDate(undefined)).toBe('N/A')
    })

    it('should extract date from ISO string without timezone shift', () => {
      // The key behavior: "2025-01-31T00:00:00Z" should show Jan 31, not Jan 30
      const result = formatDate('2025-01-31T00:00:00Z')
      expect(result).toContain('31')
      expect(result).toContain('2025')
    })

    it('should handle plain date string', () => {
      const result = formatDate('2025-06-15')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })

    it('should handle ISO string with time component', () => {
      const result = formatDate('2025-12-25T14:30:00.000Z')
      expect(result).toContain('25')
      expect(result).toContain('2025')
    })
  })

  describe('getStatusColor', () => {
    it('should return green for active', () => {
      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800')
    })

    it('should return blue for planning', () => {
      expect(getStatusColor('planning')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return yellow for on-hold', () => {
      expect(getStatusColor('on-hold')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return gray for completed', () => {
      expect(getStatusColor('completed')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return red for cancelled', () => {
      expect(getStatusColor('cancelled')).toBe('bg-red-100 text-red-800')
    })

    it('should return gray for unknown status', () => {
      expect(getStatusColor('other')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for null', () => {
      expect(getStatusColor(null)).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for undefined', () => {
      expect(getStatusColor(undefined)).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getPriorityColor', () => {
    it('should return red for critical', () => {
      expect(getPriorityColor('critical')).toBe('bg-red-100 text-red-800')
    })

    it('should return orange for high', () => {
      expect(getPriorityColor('high')).toBe('bg-orange-100 text-orange-800')
    })

    it('should return yellow for medium', () => {
      expect(getPriorityColor('medium')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return green for low', () => {
      expect(getPriorityColor('low')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for unknown', () => {
      expect(getPriorityColor('other')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for null', () => {
      expect(getPriorityColor(null)).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getScheduleStatusColor', () => {
    it('should return green for ahead', () => {
      expect(getScheduleStatusColor('ahead')).toBe('bg-green-100 text-green-800')
    })

    it('should return yellow for on_track', () => {
      expect(getScheduleStatusColor('on_track')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return red for behind', () => {
      expect(getScheduleStatusColor('behind')).toBe('bg-red-100 text-red-800')
    })

    it('should return gray for unknown', () => {
      expect(getScheduleStatusColor('unknown')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for null', () => {
      expect(getScheduleStatusColor(null)).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for undefined', () => {
      expect(getScheduleStatusColor(undefined)).toBe('bg-gray-100 text-gray-800')
    })
  })
})
