import { describe, it, expect } from 'vitest'
import {
  getStatusColor,
  getTypeColor,
  getStatusIcon,
} from './workflowHelpers'

describe('workflowHelpers', () => {
  describe('getStatusColor', () => {
    it('should return green for active', () => {
      expect(getStatusColor('active')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for inactive', () => {
      expect(getStatusColor('inactive')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return red for error', () => {
      expect(getStatusColor('error')).toBe('bg-red-100 text-red-800')
    })

    it('should return yellow for pending', () => {
      expect(getStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return gray for unknown status', () => {
      expect(getStatusColor('other')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getTypeColor', () => {
    it('should return blue for automation', () => {
      expect(getTypeColor('automation')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return purple for integration', () => {
      expect(getTypeColor('integration')).toBe('bg-purple-100 text-purple-800')
    })

    it('should return orange for notification', () => {
      expect(getTypeColor('notification')).toBe('bg-orange-100 text-orange-800')
    })

    it('should return green for data-sync', () => {
      expect(getTypeColor('data-sync')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for unknown type', () => {
      expect(getTypeColor('other')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getStatusIcon', () => {
    it('should return an element for active', () => {
      const icon = getStatusIcon('active')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-green-600')
    })

    it('should return an element for inactive', () => {
      const icon = getStatusIcon('inactive')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })

    it('should return an element for error', () => {
      const icon = getStatusIcon('error')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-red-600')
    })

    it('should return an element for pending', () => {
      const icon = getStatusIcon('pending')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-yellow-600')
    })

    it('should return a default element for unknown', () => {
      const icon = getStatusIcon('other')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('text-gray-600')
    })
  })
})
