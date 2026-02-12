import { describe, it, expect } from 'vitest'
import {
  getRoleBadgeColor,
  getRoleLabel,
  formatDate,
  getInitials,
} from './userHelpers'

describe('userHelpers', () => {
  describe('getRoleBadgeColor', () => {
    it('should return purple for super_admin', () => {
      expect(getRoleBadgeColor('super_admin')).toContain('purple')
    })

    it('should return cyan for admin', () => {
      expect(getRoleBadgeColor('admin')).toContain('accent-cyan')
    })

    it('should return emerald for dept_manager', () => {
      expect(getRoleBadgeColor('dept_manager')).toContain('emerald')
    })

    it('should return amber for project_lead', () => {
      expect(getRoleBadgeColor('project_lead')).toContain('amber')
    })

    it('should return stone for employee', () => {
      expect(getRoleBadgeColor('employee')).toContain('stone')
    })

    it('should return stone for unknown role', () => {
      expect(getRoleBadgeColor('other')).toContain('stone')
    })

    it('should return stone for null', () => {
      expect(getRoleBadgeColor(null)).toContain('stone')
    })

    it('should return stone for undefined', () => {
      expect(getRoleBadgeColor(undefined)).toContain('stone')
    })
  })

  describe('getRoleLabel', () => {
    it('should return "Super Admin" for super_admin', () => {
      expect(getRoleLabel('super_admin')).toBe('Super Admin')
    })

    it('should return "Admin" for admin', () => {
      expect(getRoleLabel('admin')).toBe('Admin')
    })

    it('should return "Dept Manager" for dept_manager', () => {
      expect(getRoleLabel('dept_manager')).toBe('Dept Manager')
    })

    it('should return "Project Lead" for project_lead', () => {
      expect(getRoleLabel('project_lead')).toBe('Project Lead')
    })

    it('should return "Employee" for employee', () => {
      expect(getRoleLabel('employee')).toBe('Employee')
    })

    it('should return the role string for unknown role', () => {
      expect(getRoleLabel('custom_role')).toBe('custom_role')
    })

    it('should return "Unknown" for null', () => {
      expect(getRoleLabel(null)).toBe('Unknown')
    })

    it('should return "Unknown" for undefined', () => {
      expect(getRoleLabel(undefined)).toBe('Unknown')
    })
  })

  describe('formatDate', () => {
    it('should return "N/A" for null', () => {
      expect(formatDate(null)).toBe('N/A')
    })

    it('should return "N/A" for undefined', () => {
      expect(formatDate(undefined)).toBe('N/A')
    })

    it('should format ISO string without timezone shift', () => {
      const result = formatDate('2025-01-31T00:00:00Z')
      expect(result).toContain('31')
      expect(result).toContain('2025')
    })

    it('should handle plain date string', () => {
      const result = formatDate('2025-06-15')
      expect(result).toContain('15')
      expect(result).toContain('2025')
    })
  })

  describe('getInitials', () => {
    it('should return initials for a full name', () => {
      expect(getInitials('John Doe')).toBe('JD')
    })

    it('should return single initial for single name', () => {
      expect(getInitials('Alice')).toBe('A')
    })

    it('should limit to 2 characters', () => {
      expect(getInitials('John Michael Doe')).toBe('JM')
    })

    it('should uppercase initials', () => {
      expect(getInitials('john doe')).toBe('JD')
    })

    it('should return "?" for null', () => {
      expect(getInitials(null)).toBe('?')
    })

    it('should return "?" for undefined', () => {
      expect(getInitials(undefined)).toBe('?')
    })

    it('should return "?" for empty string', () => {
      expect(getInitials('')).toBe('?')
    })
  })
})
