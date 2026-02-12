import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useWorkflows } from './useWorkflows'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    admin: {
      workflows: {
        list: vi.fn(),
        get: vi.fn(),
        getByCode: vi.fn(),
        getDefault: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
      },
    },
  },
}))

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

import { bmsApi } from '@/lib/services/bmsApi'
import { toast } from 'sonner'

const mockWorkflows = [
  { id: '1', name: 'Approval Workflow', code: 'APPROVAL', isActive: true, isDefault: false, steps: [], description: 'Standard approval' },
  { id: '2', name: 'Review Workflow', code: 'REVIEW', isActive: false, isDefault: true, steps: [], description: 'Review process' },
]

const mockDefaultWorkflow = { id: '2', name: 'Review Workflow', code: 'REVIEW', isActive: true, isDefault: true, steps: [] }

describe('useWorkflows', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty workflows and no loading', () => {
      const { result } = renderHook(() => useWorkflows())
      expect(result.current.workflows).toEqual([])
      expect(result.current.defaultWorkflow).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadWorkflows', () => {
    it('should load workflows from API', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadWorkflows()
      })

      expect(bmsApi.admin.workflows.list).toHaveBeenCalledWith(true)
      expect(result.current.workflows).toEqual(mockWorkflows)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle non-array response gracefully', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(null as any)

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadWorkflows()
      })

      expect(result.current.workflows).toEqual([])
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadWorkflows()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load workflows', {
        description: 'Network error',
      })
    })
  })

  describe('loadDefaultWorkflow', () => {
    it('should load the default workflow', async () => {
      vi.mocked(bmsApi.admin.workflows.getDefault).mockResolvedValue(mockDefaultWorkflow)

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadDefaultWorkflow()
      })

      expect(result.current.defaultWorkflow).toEqual(mockDefaultWorkflow)
    })

    it('should set defaultWorkflow to null on failure', async () => {
      vi.mocked(bmsApi.admin.workflows.getDefault).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadDefaultWorkflow()
      })

      expect(result.current.defaultWorkflow).toBeNull()
    })
  })

  describe('getWorkflow', () => {
    it('should return a workflow by id', async () => {
      const workflow = mockWorkflows[0]
      vi.mocked(bmsApi.admin.workflows.get).mockResolvedValue(workflow)

      const { result } = renderHook(() => useWorkflows())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getWorkflow('1')
      })

      expect(fetched).toEqual(workflow)
      expect(bmsApi.admin.workflows.get).toHaveBeenCalledWith('1')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.workflows.get).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useWorkflows())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getWorkflow('999')
      })

      expect(fetched).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to load workflow', {
        description: 'Not found',
      })
    })
  })

  describe('getWorkflowByCode', () => {
    it('should return a workflow by code', async () => {
      const workflow = mockWorkflows[0]
      vi.mocked(bmsApi.admin.workflows.getByCode).mockResolvedValue(workflow)

      const { result } = renderHook(() => useWorkflows())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getWorkflowByCode('APPROVAL')
      })

      expect(fetched).toEqual(workflow)
      expect(bmsApi.admin.workflows.getByCode).toHaveBeenCalledWith('APPROVAL')
    })

    it('should return null on failure without toast', async () => {
      vi.mocked(bmsApi.admin.workflows.getByCode).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useWorkflows())

      let fetched: any
      await act(async () => {
        fetched = await result.current.getWorkflowByCode('INVALID')
      })

      expect(fetched).toBeNull()
      expect(toast.error).not.toHaveBeenCalled()
    })
  })

  describe('createWorkflow', () => {
    it('should create a workflow and add to list', async () => {
      const newWorkflow = { id: '3', name: 'New Workflow', code: 'NEW', isActive: true, steps: [] }
      vi.mocked(bmsApi.admin.workflows.create).mockResolvedValue(newWorkflow)

      const { result } = renderHook(() => useWorkflows())

      let created: any
      await act(async () => {
        created = await result.current.createWorkflow({ name: 'New Workflow', code: 'NEW', steps: [] } as any)
      })

      expect(created).toEqual(newWorkflow)
      expect(result.current.workflows).toContainEqual(newWorkflow)
      expect(toast.success).toHaveBeenCalledWith('Workflow created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.workflows.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useWorkflows())

      let created: any
      await act(async () => {
        created = await result.current.createWorkflow({ name: '' } as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create workflow', {
        description: 'Validation error',
      })
    })
  })

  describe('updateWorkflow', () => {
    it('should update a workflow in the list', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)
      const updatedWorkflow = { ...mockWorkflows[0], name: 'Updated Approval' }
      vi.mocked(bmsApi.admin.workflows.update).mockResolvedValue(updatedWorkflow)

      const { result } = renderHook(() => useWorkflows())

      // Load workflows first
      await act(async () => {
        await result.current.loadWorkflows()
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updateWorkflow('1', { name: 'Updated Approval' } as any)
      })

      expect(updated).toEqual(updatedWorkflow)
      expect(result.current.workflows[0].name).toBe('Updated Approval')
      expect(toast.success).toHaveBeenCalledWith('Workflow updated successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.workflows.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useWorkflows())

      let updated: any
      await act(async () => {
        updated = await result.current.updateWorkflow('999', { name: 'Nope' } as any)
      })

      expect(updated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to update workflow', {
        description: 'Not found',
      })
    })
  })

  describe('deleteWorkflow', () => {
    it('should delete a workflow from the list', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)
      vi.mocked(bmsApi.admin.workflows.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadWorkflows()
      })
      expect(result.current.workflows).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteWorkflow('1')
      })

      expect(success!).toBe(true)
      expect(result.current.workflows).toHaveLength(1)
      expect(result.current.workflows[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Workflow deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.admin.workflows.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useWorkflows())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteWorkflow('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete workflow', {
        description: 'Forbidden',
      })
    })
  })

  describe('activateWorkflow', () => {
    it('should activate a workflow and update list', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)
      const activatedWorkflow = { ...mockWorkflows[1], isActive: true }
      vi.mocked(bmsApi.admin.workflows.update).mockResolvedValue(activatedWorkflow)

      const { result } = renderHook(() => useWorkflows())

      // Load workflows first so activateWorkflow can find the workflow
      await act(async () => {
        await result.current.loadWorkflows()
      })

      let activated: any
      await act(async () => {
        activated = await result.current.activateWorkflow('2')
      })

      expect(activated).toEqual(activatedWorkflow)
      expect(result.current.workflows[1]).toEqual(activatedWorkflow)
      expect(toast.success).toHaveBeenCalledWith('Workflow activated')
      // Verify the update was called with isActive: true
      expect(bmsApi.admin.workflows.update).toHaveBeenCalledWith('2', expect.objectContaining({
        isActive: true,
      }))
    })

    it('should return null and show toast if workflow not found', async () => {
      const { result } = renderHook(() => useWorkflows())

      let activated: any
      await act(async () => {
        activated = await result.current.activateWorkflow('999')
      })

      expect(activated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Workflow not found')
    })

    it('should return null and show toast on API failure', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)
      vi.mocked(bmsApi.admin.workflows.update).mockRejectedValue(new Error('Server error'))

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadWorkflows()
      })

      let activated: any
      await act(async () => {
        activated = await result.current.activateWorkflow('1')
      })

      expect(activated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to activate workflow', {
        description: 'Server error',
      })
    })
  })

  describe('deactivateWorkflow', () => {
    it('should deactivate a workflow and update list', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)
      const deactivatedWorkflow = { ...mockWorkflows[0], isActive: false }
      vi.mocked(bmsApi.admin.workflows.update).mockResolvedValue(deactivatedWorkflow)

      const { result } = renderHook(() => useWorkflows())

      // Load workflows first
      await act(async () => {
        await result.current.loadWorkflows()
      })

      let deactivated: any
      await act(async () => {
        deactivated = await result.current.deactivateWorkflow('1')
      })

      expect(deactivated).toEqual(deactivatedWorkflow)
      expect(result.current.workflows[0]).toEqual(deactivatedWorkflow)
      expect(toast.success).toHaveBeenCalledWith('Workflow deactivated')
      // Verify the update was called with isActive: false
      expect(bmsApi.admin.workflows.update).toHaveBeenCalledWith('1', expect.objectContaining({
        isActive: false,
      }))
    })

    it('should return null and show toast if workflow not found', async () => {
      const { result } = renderHook(() => useWorkflows())

      let deactivated: any
      await act(async () => {
        deactivated = await result.current.deactivateWorkflow('999')
      })

      expect(deactivated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Workflow not found')
    })

    it('should return null and show toast on API failure', async () => {
      vi.mocked(bmsApi.admin.workflows.list).mockResolvedValue(mockWorkflows)
      vi.mocked(bmsApi.admin.workflows.update).mockRejectedValue(new Error('Server error'))

      const { result } = renderHook(() => useWorkflows())

      await act(async () => {
        await result.current.loadWorkflows()
      })

      let deactivated: any
      await act(async () => {
        deactivated = await result.current.deactivateWorkflow('1')
      })

      expect(deactivated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to deactivate workflow', {
        description: 'Server error',
      })
    })
  })
})
