import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useProjects } from './useProjects'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    projects: {
      getAll: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
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

const mockProjects = [
  { id: '1', name: 'Project Alpha', status: 'active' },
  { id: '2', name: 'Project Beta', status: 'planning' },
]

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty projects and no loading', () => {
      const { result } = renderHook(() => useProjects())
      expect(result.current.projects).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadProjects', () => {
    it('should load projects from API', async () => {
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects())

      await act(async () => {
        await result.current.loadProjects()
      })

      expect(result.current.projects).toEqual(mockProjects)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle paginated response with data wrapper', async () => {
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue({ data: mockProjects } as any)

      const { result } = renderHook(() => useProjects())

      await act(async () => {
        await result.current.loadProjects()
      })

      expect(result.current.projects).toEqual(mockProjects)
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.projects.getAll).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useProjects())

      await act(async () => {
        await result.current.loadProjects()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load projects', {
        description: 'Network error',
      })
    })
  })

  describe('createProject', () => {
    it('should create a project and add to list', async () => {
      const newProject = { id: '3', name: 'Project Gamma', status: 'planning' }
      vi.mocked(bmsApi.projects.create).mockResolvedValue(newProject)

      const { result } = renderHook(() => useProjects())

      let created: any
      await act(async () => {
        created = await result.current.createProject({ name: 'Project Gamma' })
      })

      expect(created).toEqual(newProject)
      expect(result.current.projects).toContainEqual(newProject)
      expect(toast.success).toHaveBeenCalledWith('Project created successfully')
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.projects.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useProjects())

      let created: any
      await act(async () => {
        created = await result.current.createProject({ name: '' })
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create project', {
        description: 'Validation error',
      })
    })
  })

  describe('updateProject', () => {
    it('should update a project in the list', async () => {
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue(mockProjects)
      vi.mocked(bmsApi.projects.update).mockResolvedValue(undefined)

      const { result } = renderHook(() => useProjects())

      // Load projects first
      await act(async () => {
        await result.current.loadProjects()
      })

      let success: boolean
      await act(async () => {
        success = await result.current.updateProject('1', { name: 'Updated Alpha' })
      })

      expect(success!).toBe(true)
      expect(result.current.projects[0].name).toBe('Updated Alpha')
      expect(toast.success).toHaveBeenCalledWith('Project updated successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.projects.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useProjects())

      let success: boolean
      await act(async () => {
        success = await result.current.updateProject('999', { name: 'Nope' })
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to update project', {
        description: 'Not found',
      })
    })
  })

  describe('deleteProject', () => {
    it('should delete a project from the list', async () => {
      vi.mocked(bmsApi.projects.getAll).mockResolvedValue(mockProjects)
      vi.mocked(bmsApi.projects.delete).mockResolvedValue(undefined)

      const { result } = renderHook(() => useProjects())

      await act(async () => {
        await result.current.loadProjects()
      })
      expect(result.current.projects).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.deleteProject('1')
      })

      expect(success!).toBe(true)
      expect(result.current.projects).toHaveLength(1)
      expect(result.current.projects[0].id).toBe('2')
      expect(toast.success).toHaveBeenCalledWith('Project deleted successfully')
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.projects.delete).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useProjects())

      let success: boolean
      await act(async () => {
        success = await result.current.deleteProject('1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to delete project', {
        description: 'Forbidden',
      })
    })
  })

  describe('setProjects', () => {
    it('should allow manually setting projects', async () => {
      const { result } = renderHook(() => useProjects())

      act(() => {
        result.current.setProjects([{ id: '99', name: 'Manual' } as any])
      })

      expect(result.current.projects).toHaveLength(1)
      expect(result.current.projects[0].name).toBe('Manual')
    })
  })
})
