import { describe, it, expect } from 'vitest'
import {
  formatDate,
  getStatusColor,
  getTypeIcon,
} from './deviceHelpers'

describe('deviceHelpers', () => {
  describe('formatDate', () => {
    it('should return "N/A" for undefined', () => {
      expect(formatDate(undefined)).toBe('N/A')
    })

    it('should format a valid date string', () => {
      // Uses new Date() directly, so timezone can shift the day
      const result = formatDate('2025-06-15T12:00:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('Jun')
    })
  })

  describe('getStatusColor', () => {
    it('should return green for online', () => {
      expect(getStatusColor('online')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for offline', () => {
      expect(getStatusColor('offline')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return yellow for maintenance', () => {
      expect(getStatusColor('maintenance')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return red for error', () => {
      expect(getStatusColor('error')).toBe('bg-red-100 text-red-800')
    })

    it('should return gray for unknown status', () => {
      expect(getStatusColor('other')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getTypeIcon', () => {
    it('should return an element for authenticator-phone', () => {
      const icon = getTypeIcon('authenticator-phone')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-blue-600')
    })

    it('should return an element for authenticator-tablet', () => {
      const icon = getTypeIcon('authenticator-tablet')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-purple-600')
    })

    it('should return an element for camera', () => {
      const icon = getTypeIcon('camera')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-green-600')
    })

    it('should return an element for sensor', () => {
      const icon = getTypeIcon('sensor')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-orange-600')
    })

    it('should return an element for access-control', () => {
      const icon = getTypeIcon('access-control')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-red-600')
    })

    it('should return a default element for unknown type', () => {
      const icon = getTypeIcon('other')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })

    it('should return a default element for undefined', () => {
      const icon = getTypeIcon(undefined)
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })
  })
})
