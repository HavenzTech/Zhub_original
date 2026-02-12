import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getTypeIcon,
} from './propertyHelpers'

describe('propertyHelpers', () => {
  describe('formatCurrency', () => {
    it('should format a number as CAD', () => {
      expect(formatCurrency(350000)).toBe('$350,000')
    })

    it('should return "N/A" for null', () => {
      expect(formatCurrency(null)).toBe('N/A')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatCurrency(undefined)).toBe('N/A')
    })

    it('should format 0 as currency', () => {
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

    it('should format a date string', () => {
      const result = formatDate('2025-06-15T12:00:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('Jun')
    })
  })

  describe('getStatusColor', () => {
    it('should return emerald for active', () => {
      expect(getStatusColor('active')).toContain('emerald')
    })

    it('should return stone for inactive', () => {
      expect(getStatusColor('inactive')).toContain('stone')
    })

    it('should return amber for under-construction', () => {
      expect(getStatusColor('under-construction')).toContain('amber')
    })

    it('should return yellow for maintenance', () => {
      expect(getStatusColor('maintenance')).toContain('yellow')
    })

    it('should return stone for unknown', () => {
      expect(getStatusColor('other')).toContain('stone')
    })

    it('should return stone for null', () => {
      expect(getStatusColor(null)).toContain('stone')
    })
  })

  describe('getTypeIcon', () => {
    it('should return an element for office', () => {
      const icon = getTypeIcon('office')
      expect(icon).toBeDefined()
    })

    it('should return an element for office_building', () => {
      const icon = getTypeIcon('office_building')
      expect(icon).toBeDefined()
    })

    it('should return an element for warehouse', () => {
      const icon = getTypeIcon('warehouse')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('amber')
    })

    it('should return an element for datacenter', () => {
      const icon = getTypeIcon('datacenter')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('violet')
    })

    it('should return an element for residential', () => {
      const icon = getTypeIcon('residential')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('emerald')
    })

    it('should return an element for industrial', () => {
      const icon = getTypeIcon('industrial')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('red')
    })

    it('should return an element for retail', () => {
      const icon = getTypeIcon('retail')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('pink')
    })

    it('should return an element for power_plant', () => {
      const icon = getTypeIcon('power_plant')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('yellow')
    })

    it('should return a default element for unknown type', () => {
      const icon = getTypeIcon('other')
      expect(icon).toBeDefined()
    })

    it('should return a default element for null', () => {
      const icon = getTypeIcon(null)
      expect(icon).toBeDefined()
    })
  })
})
