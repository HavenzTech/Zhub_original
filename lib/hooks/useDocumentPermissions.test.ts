import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentPermissions } from './useDocumentPermissions'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    documentPermissions: {
      list: vi.fn(),
      getEffective: vi.fn(),
      getUserEffective: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      revoke: vi.fn(),
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

const mockPermissions = [
  { id: 'p1', userId: 'user-1', permission: 'read', documentId: 'doc-1' },
  { id: 'p2', userId: 'user-2', permission: 'write', documentId: 'doc-1' },
]

const mockEffective = {
  canRead: true,
  canWrite: true,
  canDelete: false,
  canShare: true,
}

describe('useDocumentPermissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty permissions', () => {
      const { result } = renderHook(() => useDocumentPermissions('doc-1'))
      expect(result.current.permissions).toEqual([])
      expect(result.current.effectivePermissions).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadPermissions', () => {
    it('should load permissions for document', async () => {
      vi.mocked(bmsApi.documentPermissions.list).mockResolvedValue(mockPermissions)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadPermissions()
      })

      expect(result.current.permissions).toEqual(mockPermissions)
      expect(bmsApi.documentPermissions.list).toHaveBeenCalledWith('doc-1')
    })

    it('should handle non-array response', async () => {
      vi.mocked(bmsApi.documentPermissions.list).mockResolvedValue(null as any)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadPermissions()
      })

      expect(result.current.permissions).toEqual([])
    })

    it('should not call API when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentPermissions(''))

      await act(async () => {
        await result.current.loadPermissions()
      })

      expect(bmsApi.documentPermissions.list).not.toHaveBeenCalled()
    })

    it('should set error and toast on failure', async () => {
      vi.mocked(bmsApi.documentPermissions.list).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadPermissions()
      })

      expect(result.current.error?.message).toBe('Forbidden')
      expect(toast.error).toHaveBeenCalledWith('Failed to load document permissions', {
        description: 'Forbidden',
      })
    })
  })

  describe('loadEffectivePermissions', () => {
    it('should load effective permissions', async () => {
      vi.mocked(bmsApi.documentPermissions.getEffective).mockResolvedValue(mockEffective)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadEffectivePermissions()
      })

      expect(result.current.effectivePermissions).toEqual(mockEffective)
    })

    it('should not call API when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentPermissions(''))

      await act(async () => {
        await result.current.loadEffectivePermissions()
      })

      expect(bmsApi.documentPermissions.getEffective).not.toHaveBeenCalled()
    })

    it('should set error on failure', async () => {
      vi.mocked(bmsApi.documentPermissions.getEffective).mockRejectedValue(new Error('Failed'))

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadEffectivePermissions()
      })

      expect(result.current.error?.message).toBe('Failed')
    })
  })

  describe('getUserEffectivePermissions', () => {
    it('should return user effective permissions', async () => {
      vi.mocked(bmsApi.documentPermissions.getUserEffective).mockResolvedValue(mockEffective)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      let perms: any
      await act(async () => {
        perms = await result.current.getUserEffectivePermissions('user-1')
      })

      expect(perms).toEqual(mockEffective)
      expect(bmsApi.documentPermissions.getUserEffective).toHaveBeenCalledWith('doc-1', 'user-1')
    })

    it('should return null when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentPermissions(''))

      let perms: any
      await act(async () => {
        perms = await result.current.getUserEffectivePermissions('user-1')
      })

      expect(perms).toBeNull()
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentPermissions.getUserEffective).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      let perms: any
      await act(async () => {
        perms = await result.current.getUserEffectivePermissions('user-99')
      })

      expect(perms).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to load user permissions', {
        description: 'Not found',
      })
    })
  })

  describe('createPermission', () => {
    it('should create permission and add to list', async () => {
      const newPerm = { id: 'p3', userId: 'user-3', permission: 'read', documentId: 'doc-1' }
      vi.mocked(bmsApi.documentPermissions.create).mockResolvedValue(newPerm)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      let created: any
      await act(async () => {
        created = await result.current.createPermission({ userId: 'user-3', permission: 'read' } as any)
      })

      expect(created).toEqual(newPerm)
      expect(result.current.permissions).toContainEqual(newPerm)
      expect(toast.success).toHaveBeenCalledWith('Permission granted successfully')
    })

    it('should return null when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentPermissions(''))

      let created: any
      await act(async () => {
        created = await result.current.createPermission({} as any)
      })

      expect(created).toBeNull()
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentPermissions.create).mockRejectedValue(new Error('Conflict'))

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      let created: any
      await act(async () => {
        created = await result.current.createPermission({} as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to grant permission', {
        description: 'Conflict',
      })
    })
  })

  describe('updatePermission', () => {
    it('should update permission in list', async () => {
      vi.mocked(bmsApi.documentPermissions.list).mockResolvedValue(mockPermissions)
      const updatedPerm = { id: 'p1', userId: 'user-1', permission: 'admin', documentId: 'doc-1' }
      vi.mocked(bmsApi.documentPermissions.update).mockResolvedValue(updatedPerm)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadPermissions()
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updatePermission('p1', { permission: 'admin' } as any)
      })

      expect(updated).toEqual(updatedPerm)
      expect((result.current.permissions[0] as any).permission).toBe('admin')
      expect(toast.success).toHaveBeenCalledWith('Permission updated successfully')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentPermissions.update).mockRejectedValue(new Error('Invalid'))

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      let updated: any
      await act(async () => {
        updated = await result.current.updatePermission('p1', {} as any)
      })

      expect(updated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to update permission', {
        description: 'Invalid',
      })
    })
  })

  describe('revokePermission', () => {
    it('should revoke permission and remove from list', async () => {
      vi.mocked(bmsApi.documentPermissions.list).mockResolvedValue(mockPermissions)
      vi.mocked(bmsApi.documentPermissions.revoke).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      await act(async () => {
        await result.current.loadPermissions()
      })
      expect(result.current.permissions).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.revokePermission('p1')
      })

      expect(success!).toBe(true)
      expect(result.current.permissions).toHaveLength(1)
      expect(result.current.permissions[0].id).toBe('p2')
      expect(toast.success).toHaveBeenCalledWith('Permission revoked successfully')
    })

    it('should return false when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentPermissions(''))

      let success: boolean
      await act(async () => {
        success = await result.current.revokePermission('p1')
      })

      expect(success!).toBe(false)
    })

    it('should return false and toast on failure', async () => {
      vi.mocked(bmsApi.documentPermissions.revoke).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useDocumentPermissions('doc-1'))

      let success: boolean
      await act(async () => {
        success = await result.current.revokePermission('p1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to revoke permission', {
        description: 'Forbidden',
      })
    })
  })
})
