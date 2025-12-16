import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getTaskStatusColor,
  getTaskStatusLabel,
  getTaskPriorityColor,
  getTaskPriorityLabel,
  formatDate,
  formatDateForInput,
  isOverdue,
  getRelativeTime,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from './taskHelpers'

describe('taskHelpers', () => {
  describe('getTaskStatusColor', () => {
    it('should return correct color for todo status', () => {
      expect(getTaskStatusColor('todo')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return correct color for in_progress status', () => {
      expect(getTaskStatusColor('in_progress')).toBe('bg-blue-100 text-blue-800')
    })

    it('should return correct color for in_review status', () => {
      expect(getTaskStatusColor('in_review')).toBe('bg-purple-100 text-purple-800')
    })

    it('should return correct color for completed status', () => {
      expect(getTaskStatusColor('completed')).toBe('bg-green-100 text-green-800')
    })

    it('should return correct color for cancelled status', () => {
      expect(getTaskStatusColor('cancelled')).toBe('bg-red-100 text-red-800')
    })

    it('should return default color for unknown status', () => {
      expect(getTaskStatusColor('unknown')).toBe('bg-gray-100 text-gray-800')
    })

    it('should return default color for null status', () => {
      expect(getTaskStatusColor(null)).toBe('bg-gray-100 text-gray-800')
    })

    it('should return default color for undefined status', () => {
      expect(getTaskStatusColor(undefined)).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getTaskStatusLabel', () => {
    it('should return "To Do" for todo status', () => {
      expect(getTaskStatusLabel('todo')).toBe('To Do')
    })

    it('should return "In Progress" for in_progress status', () => {
      expect(getTaskStatusLabel('in_progress')).toBe('In Progress')
    })

    it('should return "In Review" for in_review status', () => {
      expect(getTaskStatusLabel('in_review')).toBe('In Review')
    })

    it('should return "Completed" for completed status', () => {
      expect(getTaskStatusLabel('completed')).toBe('Completed')
    })

    it('should return "Cancelled" for cancelled status', () => {
      expect(getTaskStatusLabel('cancelled')).toBe('Cancelled')
    })

    it('should return the status itself for unknown status', () => {
      expect(getTaskStatusLabel('custom_status')).toBe('custom_status')
    })

    it('should return "Unknown" for null/undefined status', () => {
      expect(getTaskStatusLabel(null)).toBe('Unknown')
      expect(getTaskStatusLabel(undefined)).toBe('Unknown')
    })
  })

  describe('getTaskPriorityColor', () => {
    it('should return correct color for critical priority', () => {
      expect(getTaskPriorityColor('critical')).toBe('bg-red-100 text-red-800')
    })

    it('should return correct color for high priority', () => {
      expect(getTaskPriorityColor('high')).toBe('bg-orange-100 text-orange-800')
    })

    it('should return correct color for medium priority', () => {
      expect(getTaskPriorityColor('medium')).toBe('bg-yellow-100 text-yellow-800')
    })

    it('should return correct color for low priority', () => {
      expect(getTaskPriorityColor('low')).toBe('bg-green-100 text-green-800')
    })

    it('should return default color for unknown priority', () => {
      expect(getTaskPriorityColor('unknown')).toBe('bg-gray-100 text-gray-800')
    })
  })

  describe('getTaskPriorityLabel', () => {
    it('should return correct labels for all priorities', () => {
      expect(getTaskPriorityLabel('critical')).toBe('Critical')
      expect(getTaskPriorityLabel('high')).toBe('High')
      expect(getTaskPriorityLabel('medium')).toBe('Medium')
      expect(getTaskPriorityLabel('low')).toBe('Low')
    })

    it('should return "None" for null/undefined priority', () => {
      expect(getTaskPriorityLabel(null)).toBe('None')
      expect(getTaskPriorityLabel(undefined)).toBe('None')
    })
  })

  describe('formatDateForInput', () => {
    it('should return empty string for null/undefined', () => {
      expect(formatDateForInput(null)).toBe('')
      expect(formatDateForInput(undefined)).toBe('')
    })

    it('should return date as-is if already in yyyy-MM-dd format', () => {
      expect(formatDateForInput('2025-01-31')).toBe('2025-01-31')
    })

    it('should extract date from ISO string', () => {
      expect(formatDateForInput('2025-01-31T00:00:00Z')).toBe('2025-01-31')
      expect(formatDateForInput('2025-12-25T14:30:00.000Z')).toBe('2025-12-25')
    })
  })

  describe('isOverdue', () => {
    beforeEach(() => {
      // Mock current date to 2025-01-15
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 15))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return false for null/undefined due date', () => {
      expect(isOverdue(null, 'todo')).toBe(false)
      expect(isOverdue(undefined, 'in_progress')).toBe(false)
    })

    it('should return false for completed tasks', () => {
      expect(isOverdue('2025-01-01', 'completed')).toBe(false)
    })

    it('should return false for cancelled tasks', () => {
      expect(isOverdue('2025-01-01', 'cancelled')).toBe(false)
    })

    it('should return true for past due dates', () => {
      expect(isOverdue('2025-01-10', 'todo')).toBe(true)
      expect(isOverdue('2025-01-14', 'in_progress')).toBe(true)
    })

    it('should return false for future due dates', () => {
      expect(isOverdue('2025-01-20', 'todo')).toBe(false)
      expect(isOverdue('2025-01-16', 'in_progress')).toBe(false)
    })

    it('should return false for today due date', () => {
      expect(isOverdue('2025-01-15', 'todo')).toBe(false)
    })
  })

  describe('getRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2025, 0, 15))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return null for null/undefined', () => {
      expect(getRelativeTime(null)).toBe(null)
      expect(getRelativeTime(undefined)).toBe(null)
    })

    it('should return "Today" for today', () => {
      expect(getRelativeTime('2025-01-15')).toBe('Today')
    })

    it('should return "Tomorrow" for tomorrow', () => {
      expect(getRelativeTime('2025-01-16')).toBe('Tomorrow')
    })

    it('should return "Yesterday" for yesterday', () => {
      expect(getRelativeTime('2025-01-14')).toBe('Yesterday')
    })

    it('should return "in X days" for future dates', () => {
      expect(getRelativeTime('2025-01-20')).toBe('in 5 days')
    })

    it('should return "X days ago" for past dates', () => {
      expect(getRelativeTime('2025-01-10')).toBe('5 days ago')
    })
  })

  describe('Constants', () => {
    it('should have correct task status options', () => {
      expect(TASK_STATUS_OPTIONS).toHaveLength(5)
      expect(TASK_STATUS_OPTIONS.map(o => o.value)).toEqual([
        'todo',
        'in_progress',
        'in_review',
        'completed',
        'cancelled',
      ])
    })

    it('should have correct task priority options', () => {
      expect(TASK_PRIORITY_OPTIONS).toHaveLength(4)
      expect(TASK_PRIORITY_OPTIONS.map(o => o.value)).toEqual([
        'low',
        'medium',
        'high',
        'critical',
      ])
    })
  })
})
