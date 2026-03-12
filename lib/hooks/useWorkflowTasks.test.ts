import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useWorkflowTasks } from './useWorkflowTasks'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    workflowTasks: {
      getMyTasks: vi.fn(),
      getAllTasks: vi.fn(),
      getTask: vi.fn(),
      complete: vi.fn(),
      delegate: vi.fn(),
    },
  },
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { bmsApi } from '@/lib/services/bmsApi'
import { toast } from 'sonner'

const mockMyTasks = [
  { id: 't1', title: 'Approve Invoice', status: 'pending' },
  { id: 't2', title: 'Review Contract', status: 'pending' },
]

const mockAllTasks = [
  { id: 't3', title: 'Budget Approval', status: 'pending' },
  { id: 't4', title: 'Completed Review', status: 'completed' },
  { id: 't5', title: 'Approved Doc', status: 'approved' },
  { id: 't6', title: 'Rejected Request', status: 'rejected' },
]

describe('useWorkflowTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty arrays and no loading', () => {
      const { result } = renderHook(() => useWorkflowTasks())
      expect(result.current.myTasks).toEqual([])
      expect(result.current.completedTasks).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadMyTasks', () => {
    it('should load my tasks from API', async () => {
      vi.mocked(bmsApi.workflowTasks.getMyTasks).mockResolvedValue(mockMyTasks)

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      expect(result.current.myTasks).toEqual(mockMyTasks)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle non-array response', async () => {
      vi.mocked(bmsApi.workflowTasks.getMyTasks).mockResolvedValue(null as any)

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      expect(result.current.myTasks).toEqual([])
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.workflowTasks.getMyTasks).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(toast.error).toHaveBeenCalledWith('Failed to load workflow tasks', {
        description: 'Network error',
      })
    })
  })

  describe('loadCompletedTasks', () => {
    it('should load and filter to completed/approved/rejected tasks', async () => {
      vi.mocked(bmsApi.workflowTasks.getAllTasks).mockResolvedValue(mockAllTasks)

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadCompletedTasks()
      })

      // Should only include completed, approved, rejected — not pending
      expect(result.current.completedTasks).toHaveLength(3)
      expect(result.current.completedTasks.map((t: any) => t.id)).toEqual(['t4', 't5', 't6'])
    })

    it('should handle wrapped response', async () => {
      vi.mocked(bmsApi.workflowTasks.getAllTasks).mockResolvedValue({ data: mockAllTasks } as any)

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadCompletedTasks()
      })

      expect(result.current.completedTasks).toHaveLength(3)
    })

    it('should set error on failure (no toast for completed)', async () => {
      vi.mocked(bmsApi.workflowTasks.getAllTasks).mockRejectedValue(new Error('Denied'))

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadCompletedTasks()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      // loadCompletedTasks does NOT toast on error
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('getTask', () => {
    it('should return a single task', async () => {
      const task = { id: 't1', title: 'Task 1' }
      vi.mocked(bmsApi.workflowTasks.getTask).mockResolvedValue(task)

      const { result } = renderHook(() => useWorkflowTasks())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getTask('t1')
      })

      expect(fetched).toEqual(task)
      expect(bmsApi.workflowTasks.getTask).toHaveBeenCalledWith('t1')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.workflowTasks.getTask).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useWorkflowTasks())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getTask('bad-id')
      })

      expect(fetched).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to load task', {
        description: 'Not found',
      })
    })
  })

  describe('completeTask', () => {
    it('should complete a task with approve action and remove from myTasks', async () => {
      vi.mocked(bmsApi.workflowTasks.getMyTasks).mockResolvedValue(mockMyTasks)
      const completedTask = { id: 't1', title: 'Approve Invoice', status: 'completed' }
      vi.mocked(bmsApi.workflowTasks.complete).mockResolvedValue(completedTask)

      const { result } = renderHook(() => useWorkflowTasks())

      // Load tasks first
      await act(async () => {
        await result.current.loadMyTasks()
      })
      expect(result.current.myTasks).toHaveLength(2)

      let completed: any
      await act(async () => {
        completed = await result.current.completeTask('t1', { action: 'approve' })
      })

      expect(completed).toEqual(completedTask)
      expect(result.current.myTasks).toHaveLength(1)
      expect(result.current.myTasks[0].id).toBe('t2')
      expect(toast.success).toHaveBeenCalledWith('Task approved successfully')
    })

    it('should show rejected message for reject action', async () => {
      const completedTask = { id: 't1', status: 'rejected' }
      vi.mocked(bmsApi.workflowTasks.complete).mockResolvedValue(completedTask)

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.completeTask('t1', { action: 'reject' })
      })

      expect(toast.success).toHaveBeenCalledWith('Task rejected successfully')
    })

    it('should show completed message for other actions', async () => {
      vi.mocked(bmsApi.workflowTasks.complete).mockResolvedValue({ id: 't1' })

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.completeTask('t1', { action: 'other' as any })
      })

      expect(toast.success).toHaveBeenCalledWith('Task completed successfully')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.workflowTasks.complete).mockRejectedValue(new Error('Failed'))

      const { result } = renderHook(() => useWorkflowTasks())

      let completed: any
      await act(async () => {
        completed = await result.current.completeTask('t1', { action: 'approve' })
      })

      expect(completed).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to complete task', {
        description: 'Failed',
      })
    })
  })

  describe('delegateTask', () => {
    it('should delegate a task and remove from myTasks', async () => {
      vi.mocked(bmsApi.workflowTasks.getMyTasks).mockResolvedValue(mockMyTasks)
      const delegatedTask = { id: 't1', title: 'Delegated', status: 'delegated' }
      vi.mocked(bmsApi.workflowTasks.delegate).mockResolvedValue(delegatedTask)

      const { result } = renderHook(() => useWorkflowTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      let delegated: any
      await act(async () => {
        delegated = await result.current.delegateTask('t1', { delegateToUserId: 'user-2' })
      })

      expect(delegated).toEqual(delegatedTask)
      expect(result.current.myTasks).toHaveLength(1)
      expect(toast.success).toHaveBeenCalledWith('Task delegated successfully')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.workflowTasks.delegate).mockRejectedValue(new Error('Cannot delegate'))

      const { result } = renderHook(() => useWorkflowTasks())

      let delegated: any
      await act(async () => {
        delegated = await result.current.delegateTask('t1', { delegateToUserId: 'user-2' })
      })

      expect(delegated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to delegate task', {
        description: 'Cannot delegate',
      })
    })
  })
})
