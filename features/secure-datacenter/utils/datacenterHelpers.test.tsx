import { describe, it, expect } from 'vitest'
import {
  formatDate,
  getAccessTypeColor,
  getVerificationIcon,
  getAlertSeverityColor,
  getMetricIcon,
} from './datacenterHelpers'

describe('datacenterHelpers', () => {
  describe('formatDate', () => {
    it('should format a valid date string with time', () => {
      const result = formatDate('2025-06-15T14:30:00Z')
      expect(result).toContain('2025')
      expect(result).toContain('15')
    })
  })

  describe('getAccessTypeColor', () => {
    it('should return green for entry', () => {
      expect(getAccessTypeColor('entry')).toBe('bg-green-100 text-green-800')
    })

    it('should return blue for exit', () => {
      expect(getAccessTypeColor('exit')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return red for denied', () => {
      expect(getAccessTypeColor('denied')).toBe('bg-red-100 text-red-800')
    })

    it('should return orange for tailgate', () => {
      expect(getAccessTypeColor('tailgate')).toBe('bg-orange-100 text-orange-800')
    })

    it('should return red for forced', () => {
      expect(getAccessTypeColor('forced')).toBe('bg-red-100 text-red-800')
    })

    it('should return gray for unknown', () => {
      expect(getAccessTypeColor('other')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getVerificationIcon', () => {
    it('should return an element for facial-recognition', () => {
      const icon = getVerificationIcon('facial-recognition')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('w-4 h-4')
    })

    it('should return an element for RfidCard', () => {
      const icon = getVerificationIcon('RfidCard')
      expect(icon).toBeDefined()
    })

    it('should return an element for PinCode', () => {
      const icon = getVerificationIcon('PinCode')
      expect(icon).toBeDefined()
    })

    it('should return an element for QrCode', () => {
      const icon = getVerificationIcon('QrCode')
      expect(icon).toBeDefined()
    })

    it('should return a default element for unknown method', () => {
      const icon = getVerificationIcon('other')
      expect(icon).toBeDefined()
    })
  })

  describe('getAlertSeverityColor', () => {
    it('should return red for critical', () => {
      expect(getAlertSeverityColor('critical')).toBe('bg-red-100 text-red-800')
    })

    it('should return yellow for warning', () => {
      expect(getAlertSeverityColor('warning')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return blue for info', () => {
      expect(getAlertSeverityColor('info')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return gray for unknown', () => {
      expect(getAlertSeverityColor('other')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return gray for undefined', () => {
      expect(getAlertSeverityColor(undefined)).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getMetricIcon', () => {
    it('should return an element for temperature', () => {
      const icon = getMetricIcon('temperature')
      expect(icon).toBeDefined()
      expect((icon.props as { className: string }).className).toContain('w-5 h-5')
    })

    it('should return an element for humidity', () => {
      const icon = getMetricIcon('humidity')
      expect(icon).toBeDefined()
    })

    it('should return an element for power', () => {
      const icon = getMetricIcon('power')
      expect(icon).toBeDefined()
    })

    it('should return an element for airflow', () => {
      const icon = getMetricIcon('airflow')
      expect(icon).toBeDefined()
    })

    it('should return an element for network', () => {
      const icon = getMetricIcon('network')
      expect(icon).toBeDefined()
    })

    it('should return a default element for unknown type', () => {
      const icon = getMetricIcon('other')
      expect(icon).toBeDefined()
    })
  })
})
