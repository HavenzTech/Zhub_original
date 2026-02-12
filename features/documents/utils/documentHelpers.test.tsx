import { describe, it, expect } from 'vitest'
import {
  formatFileSize,
  formatDate,
  getStatusColor,
  getAccessLevelColor,
  getAccessLevelIcon,
  getFileTypeIcon,
} from './documentHelpers'

describe('documentHelpers', () => {
  describe('formatFileSize', () => {
    it('should return "N/A" for null', () => {
      expect(formatFileSize(null)).toBe('N/A')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatFileSize(undefined)).toBe('N/A')
    })

    it('should format bytes as KB when less than 1 MB', () => {
      expect(formatFileSize(512000)).toBe('500.0 KB')
    })

    it('should format bytes as MB when >= 1 MB', () => {
      expect(formatFileSize(2097152)).toBe('2.00 MB')
    })

    it('should handle small files in KB', () => {
      expect(formatFileSize(1024)).toBe('1.0 KB')
    })

    it('should handle large files', () => {
      // 10 MB
      expect(formatFileSize(10485760)).toBe('10.00 MB')
    })

    it('should handle 0 bytes', () => {
      expect(formatFileSize(0)).toBe('0.0 KB')
    })
  })

  describe('formatDate', () => {
    it('should return "N/A" for null', () => {
      expect(formatDate(null)).toBe('N/A')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatDate(undefined)).toBe('N/A')
    })

    it('should format a valid ISO date string', () => {
      const result = formatDate('2025-06-15T14:30:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('15')
    })
  })

  describe('getStatusColor', () => {
    it('should return green for approved', () => {
      expect(getStatusColor('approved')).toBe('bg-green-100 text-green-800')
    })

    it('should return yellow for pending', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return red for rejected', () => {
      expect(getStatusColor('rejected')).toBe('bg-red-100 text-red-800')
    })

    it('should return gray for draft', () => {
      expect(getStatusColor('draft')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for unknown status', () => {
      expect(getStatusColor('something')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for null', () => {
      expect(getStatusColor(null)).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for undefined', () => {
      expect(getStatusColor(undefined)).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getAccessLevelColor', () => {
    it('should return blue for public', () => {
      expect(getAccessLevelColor('public')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return orange for private', () => {
      expect(getAccessLevelColor('private')).toBe('bg-orange-100 text-orange-800')
    })

    it('should return red for restricted', () => {
      expect(getAccessLevelColor('restricted')).toBe('bg-red-100 text-red-800')
    })

    it('should return gray for unknown', () => {
      expect(getAccessLevelColor('other')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for null', () => {
      expect(getAccessLevelColor(null)).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getAccessLevelIcon', () => {
    it('should return an element for public', () => {
      const icon = getAccessLevelIcon('public')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('w-4 h-4')
    })

    it('should return an element for private', () => {
      const icon = getAccessLevelIcon('private')
      expect(icon).toBeDefined()
    })

    it('should return an element for restricted', () => {
      const icon = getAccessLevelIcon('restricted')
      expect(icon).toBeDefined()
    })

    it('should return a default element for unknown', () => {
      const icon = getAccessLevelIcon('other')
      expect(icon).toBeDefined()
    })

    it('should return a default element for null', () => {
      const icon = getAccessLevelIcon(null)
      expect(icon).toBeDefined()
    })
  })

  describe('getFileTypeIcon', () => {
    it('should return red icon for pdf', () => {
      const icon = getFileTypeIcon('application/pdf')
      expect((icon.props as { className: string }).className).toContain('text-red-600')
    })

    it('should return blue icon for doc', () => {
      const icon = getFileTypeIcon('application/doc')
      expect((icon.props as { className: string }).className).toContain('text-blue-600')
    })

    it('should return green icon for xls', () => {
      const icon = getFileTypeIcon('application/xls')
      expect((icon.props as { className: string }).className).toContain('text-green-600')
    })

    it('should return green icon for sheet', () => {
      const icon = getFileTypeIcon('spreadsheet')
      expect((icon.props as { className: string }).className).toContain('text-green-600')
    })

    it('should return orange icon for ppt', () => {
      const icon = getFileTypeIcon('application/ppt')
      expect((icon.props as { className: string }).className).toContain('text-orange-600')
    })

    it('should return gray icon for txt', () => {
      const icon = getFileTypeIcon('text/txt')
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })

    it('should return gray icon for unknown type', () => {
      const icon = getFileTypeIcon('unknown')
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })

    it('should return gray icon for null', () => {
      const icon = getFileTypeIcon(null)
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })
  })
})
