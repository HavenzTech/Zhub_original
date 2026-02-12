import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTasks } from './useTasks'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    tasks: {
      getAll: vi.fn(),
      getMyTasks: vi.fn(),
      getByProject: vi.fn(),
      getById: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      updateStatus: vi.fn(),
      assign: vi.fn(),
      delete: vi.fn(),
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

const mockTasks = [
  { id: '1', title: 'Task Alpha', status: 'open' },
  { id: '2', title: 'Task Beta', status: 'in_progress' },
]

const mockPagedResult = {
  data: mockTasks,
  total: 50,
  page: 1,
  pageSize: 20,
  hasMore: true,
}

describe('useTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with defaults', () => {
      const { result } = renderHook(() => useTasks())
      expect(result.current.tasks).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.total).toBe(0)
      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(20)
      expect(result.current.hasMore).toBe(false)
    })
  })

  describe('loadTasks', () => {
    it('should load paged tasks and set pagination state', async () => {
      vi.mocked(bmsApi.tasks.getAll).mockResolvedValue(mockPagedResult)

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadTasks()
      })

      expect(result.current.tasks).toEqual(mockTasks)
      expect(result.current.total).toBe(50)
      expect(result.current.page).toBe(1)
      expect(result.current.pageSize).toBe(20)
      expect(result.current.hasMore).toBe(true)
    })

    it('should pass filters to API', async () => {
      vi.mocked(bmsApi.tasks.getAll).mockResolvedValue({ data: [], total: 0, page: 1, pageSize: 20, hasMore: false })

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadTasks({ status: 'open', projectId: 'p1' })
      })

      expect(bmsApi.tasks.getAll).toHaveBeenCalledWith({ status: 'open', projectId: 'p1' })
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadTasks()
      })

      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load tasks', {
        description: 'Network error',
      })
    })
  })

  describe('loadMyTasks', () => {
    it('should load my tasks', async () => {
      vi.mocked(bmsApi.tasks.getMyTasks).mockResolvedValue(mockTasks)

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      expect(result.current.tasks).toEqual(mockTasks)
      expect(result.current.total).toBe(2)
    })

    it('should pass status filter', async () => {
      vi.mocked(bmsApi.tasks.getMyTasks).mockResolvedValue([])

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadMyTasks('in_progress')
      })

      expect(bmsApi.tasks.getMyTasks).toHaveBeenCalledWith('in_progress')
    })

    it('should handle data wrapper response', async () => {
      vi.mocked(bmsApi.tasks.getMyTasks).mockResolvedValue({ data: mockTasks } as any)

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.getMyTasks).mockRejectedValue(new Error('Auth error'))

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadMyTasks()
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to load your tasks', {
        description: 'Auth error',
      })
    })
  })

  describe('loadProjectTasks', () => {
    it('should load project tasks', async () => {
      vi.mocked(bmsApi.tasks.getByProject).mockResolvedValue(mockTasks)

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadProjectTasks('p1')
      })

      expect(bmsApi.tasks.getByProject).toHaveBeenCalledWith('p1')
      expect(result.current.tasks).toEqual(mockTasks)
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.getByProject).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadProjectTasks('bad-id')
      })

      expect(toast.error).toHaveBeenCalledWith('Failed to load project tasks', {
        description: 'Not found',
      })
    })
  })

  describe('getTaskById', () => {
    it('should return a task by ID', async () => {
      const task = { id: '1', title: 'Task Alpha' }
      vi.mocked(bmsApi.tasks.getById).mockResolvedValue(task)

      const { result } = renderHook(() => useTasks())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getTaskById('1')
      })

      expect(fetched).toEqual(task)
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.getById).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useTasks())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getTaskById('bad-id')
      })

      expect(fetched).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to load task', {
        description: 'Not found',
      })
    })
  })

  describe('createTask', () => {
    it('should create a task and prepend to list', async () => {
      const newTask = { id: '3', title: 'New Task', status: 'open' }
      vi.mocked(bmsApi.tasks.create).mockResolvedValue(newTask)

      const { result } = renderHook(() => useTasks())

      let created: any
      await act(async () => {
        created = await result.current.createTask({ title: 'New Task' } as any)
      })

      expect(created).toEqual(newTask)
      expect(result.current.tasks[0]).toEqual(newTask)
      expect(toast.success).toHaveBeenCalledWith('Task created successfully')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.create).mockRejectedValue(new Error('Validation'))

      const { result } = renderHook(() => useTasks())

      let created: any
      await act(async () => {
        created = await result.current.createTask({ title: '' } as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create task', {
        description: 'Validation',
      })
    })
  })

  describe('updateTask', () => {
    it('should update a task in the list', async () => {
      vi.mocked(bmsApi.tasks.getAll).mockResolvedValue(mockPagedResult)
      vi.mocked(bmsApi.tasks.update).mockResolvedValue({ id: '1', title: 'Updated Alpha' })

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadTasks()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTask('1', { title: 'Updated Alpha' } as any)
      })

      expect(success!).toBe(true)
      expect(toast.success).toHaveBeenCalledWith('Task updated successfully')
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.update).mockRejectedValue(new Error('Failed'))

      const { result } = renderHook(() => useTasks())

      let success: boolean
      await act(async () => {
        success = await result.current.updateTask('1', {} as any)
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update task', {
        description: 'Failed',
      })
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      vi.mocked(bmsApi.tasks.getAll).mockResolvedValue(mockPagedResult)
      vi.mocked(bmsApi.tasks.updateStatus).mockResolvedValue({ id: '1', status: 'completed' })

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadTasks()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateTaskStatus('1', 'completed')
      })

      expect(success!).toBe(true)
      expect(toast.success).toHaveBeenCalledWith('Task status updated to completed')
    })

    it('should format underscore status in toast', async () => {
      vi.mocked(bmsApi.tasks.updateStatus).mockResolvedValue({ id: '1', status: 'in_progress' })

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.updateTaskStatus('1', 'in_progress')
      })

      expect(toast.success).toHaveBeenCalledWith('Task status updated to in progress')
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.updateStatus).mockRejectedValue(new Error('Invalid status'))

      const { result } = renderHook(() => useTasks())

      let success: boolean
      await act(async () => {
        success = await result.current.updateTaskStatus('1', 'bad_status')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update task status', {
        description: 'Invalid status',
      })
    })
  })

  describe('assignTask', () => {
    it('should assign a task to a user', async () => {
      vi.mocked(bmsApi.tasks.assign).mockResolvedValue({ id: '1', assignedToUserId: 'user-1' })

      const { result } = renderHook(() => useTasks())

      let success: boolean
      await act(async () => {
        success = await result.current.assignTask('1', 'user-1')
      })

      expect(success!).toBe(true)
      expect(toast.success).toHaveBeenCalledWith('Task assigned successfully')
    })

    it('should unassign a task when no userId', async () => {
      vi.mocked(bmsApi.tasks.assign).mockResolvedValue({ id: '1', assignedToUserId: null })

      const { result } = renderHook(() => useTasks())

      let success: boolean
      await act(async () => {
        success = await result.current.assignTask('1')
      })

      expect(success!).toBe(true)
      expect(toast.success).toHaveBeenCalledWith('Task unassigned')
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.assign).mockRejectedValue(new Error('Not allowed'))

      const { result } = renderHook(() => useTasks())

      let success: boolean
      await act(async () => {
        success = await result.current.assignTask('1', 'user-1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to assign task', {
        description: 'Not allowed',
      })
    })
  })

  describe('deleteTask', () => {
    it('should delete a task from the list', async () => {
      vi.mocked(bmsApi.tasks.getAll).mockResolvedValue(mockPagedResult)
      vi.mocked(bmsApi.tasks.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useTasks())

      await act(async () => {
        await result.current.loadTasks()
      })
      expect(result.current.tasks).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteTask('1')
      })

      expect(success!).toBe(true)
      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Task deleted successfully')
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.tasks.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useTasks())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteTask('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete task', {
        description: 'Forbidden',
      })
    })
  })

  describe('setTasks', () => {
    it('should allow manually setting tasks', () => {
      const { result } = renderHook(() => useTasks())

      act(() => {
        result.current.setTasks([{ id: '99', title: 'Manual' } as any])
      })

      expect(result.current.tasks).toHaveLength(1)
      expect(result.current.tasks[0].title).toBe('Manual')
    })
  })
})
