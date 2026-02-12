import { describe, it, expect } from 'vitest'
import {
  getLevelColor,
  getIntegrationStatusColor,
} from './settingsHelpers'

describe('settingsHelpers', () => {
  describe('getLevelColor', () => {
    it('should return red for critical', () => {
      expect(getLevelColor('critical')).toBe('bg-red-100 text-red-800')
    })

    it('should return orange for high', () => {
      expect(getLevelColor('high')).toBe('bg-orange-100 text-orange-800')
    })

    it('should return yellow for medium', () => {
      expect(getLevelColor('medium')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return green for low', () => {
      expect(getLevelColor('low')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for unknown level', () => {
      expect(getLevelColor('other')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getIntegrationStatusColor', () => {
    it('should return green for connected', () => {
      expect(getIntegrationStatusColor('connected')).toBe('bg-green-100 text-green-800')
    })

    it('should return gray for disconnected', () => {
      expect(getIntegrationStatusColor('disconnected')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return red for error', () => {
      expect(getIntegrationStatusColor('error')).toBe('bg-red-100 text-red-800')
    })

    it('should return yellow for pending', () => {
      expect(getIntegrationStatusColor('pending')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return gray for unknown status', () => {
      expect(getIntegrationStatusColor('other')).toBe('bg-gray-100 text-gray-800')
    })
  })
})
