import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useDocumentShares } from './useDocumentShares'

// Mock bmsApi
vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    documentShares: {
      list: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      revoke: vi.fn(),
      getLogs: vi.fn(),
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

const mockDocumentId = 'doc-123'

const mockShares = [
  { id: 'share-1', documentId: 'doc-123', recipientEmail: 'user@example.com', permission: 'view', expiresAt: '2026-03-01' },
  { id: 'share-2', documentId: 'doc-123', recipientEmail: 'admin@example.com', permission: 'edit', expiresAt: '2026-04-01' },
]

const mockLogs = [
  { id: 'log-1', shareId: 'share-1', accessedAt: '2026-02-10T10:00:00Z', ipAddress: '192.168.1.1' },
  { id: 'log-2', shareId: 'share-1', accessedAt: '2026-02-11T14:30:00Z', ipAddress: '10.0.0.1' },
]

describe('useDocumentShares', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with empty shares and no loading', () => {
      const { result } = renderHook(() => useDocumentShares(mockDocumentId))
      expect(result.current.shares).toEqual([])
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  describe('loadShares', () => {
    it('should load shares from API for the given documentId', async () => {
      vi.mocked(bmsApi.documentShares.list).mockResolvedValue(mockShares)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      await act(async () => {
        await result.current.loadShares()
      })

      expect(bmsApi.documentShares.list).toHaveBeenCalledWith(mockDocumentId)
      expect(result.current.shares).toEqual(mockShares)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    it('should handle non-array response gracefully', async () => {
      vi.mocked(bmsApi.documentShares.list).mockResolvedValue(null as any)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      await act(async () => {
        await result.current.loadShares()
      })

      expect(result.current.shares).toEqual([])
    })

    it('should not load if documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentShares(''))

      await act(async () => {
        await result.current.loadShares()
      })

      expect(bmsApi.documentShares.list).not.toHaveBeenCalled()
      expect(result.current.shares).toEqual([])
    })

    it('should set error and show toast on failure', async () => {
      vi.mocked(bmsApi.documentShares.list).mockRejectedValue(new Error('Network error'))

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      await act(async () => {
        await result.current.loadShares()
      })

      expect(result.current.error).toBeInstanceOf(Error)
      expect(result.current.error?.message).toBe('Network error')
      expect(toast.error).toHaveBeenCalledWith('Failed to load document shares', {
        description: 'Network error',
      })
    })
  })

  describe('createShare', () => {
    it('should create a share and add to list', async () => {
      const newShare = { id: 'share-3', documentId: 'doc-123', recipientEmail: 'new@example.com', permission: 'view' }
      vi.mocked(bmsApi.documentShares.create).mockResolvedValue(newShare)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let created: any
      await act(async () => {
        created = await result.current.createShare({ recipientEmail: 'new@example.com', permission: 'view' } as any)
      })

      expect(created).toEqual(newShare)
      expect(bmsApi.documentShares.create).toHaveBeenCalledWith(mockDocumentId, { recipientEmail: 'new@example.com', permission: 'view' })
      expect(result.current.shares).toContainEqual(newShare)
      expect(toast.success).toHaveBeenCalledWith('Share link created successfully')
    })

    it('should return null if documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentShares(''))

      let created: any
      await act(async () => {
        created = await result.current.createShare({ recipientEmail: 'new@example.com' } as any)
      })

      expect(created).toBeNull()
      expect(bmsApi.documentShares.create).not.toHaveBeenCalled()
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.documentShares.create).mockRejectedValue(new Error('Validation error'))

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let created: any
      await act(async () => {
        created = await result.current.createShare({ recipientEmail: '' } as any)
      })

      expect(created).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to create share link', {
        description: 'Validation error',
      })
    })
  })

  describe('updateShare', () => {
    it('should update a share in the list', async () => {
      vi.mocked(bmsApi.documentShares.list).mockResolvedValue(mockShares)
      const updatedShare = { ...mockShares[0], permission: 'edit' }
      vi.mocked(bmsApi.documentShares.update).mockResolvedValue(updatedShare)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      // Load shares first
      await act(async () => {
        await result.current.loadShares()
      })

      let updated: any
      await act(async () => {
        updated = await result.current.updateShare('share-1', { permission: 'edit' } as any)
      })

      expect(updated).toEqual(updatedShare)
      expect(bmsApi.documentShares.update).toHaveBeenCalledWith(mockDocumentId, 'share-1', { permission: 'edit' })
      expect((result.current.shares[0] as any).permission).toBe('edit')
      expect(toast.success).toHaveBeenCalledWith('Share link updated successfully')
    })

    it('should return null if documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentShares(''))

      let updated: any
      await act(async () => {
        updated = await result.current.updateShare('share-1', { permission: 'edit' } as any)
      })

      expect(updated).toBeNull()
      expect(bmsApi.documentShares.update).not.toHaveBeenCalled()
    })

    it('should return null and show toast on failure', async () => {
      vi.mocked(bmsApi.documentShares.update).mockRejectedValue(new Error('Not found'))

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let updated: any
      await act(async () => {
        updated = await result.current.updateShare('share-999', { permission: 'edit' } as any)
      })

      expect(updated).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to update share link', {
        description: 'Not found',
      })
    })
  })

  describe('revokeShare', () => {
    it('should revoke a share and remove from list', async () => {
      vi.mocked(bmsApi.documentShares.list).mockResolvedValue(mockShares)
      vi.mocked(bmsApi.documentShares.revoke).mockResolvedValue(undefined)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      await act(async () => {
        await result.current.loadShares()
      })
      expect(result.current.shares).toHaveLength(2)

      let success: boolean
      await act(async () => {
        success = await result.current.revokeShare('share-1')
      })

      expect(success!).toBe(true)
      expect(bmsApi.documentShares.revoke).toHaveBeenCalledWith(mockDocumentId, 'share-1')
      expect(result.current.shares).toHaveLength(1)
      expect(result.current.shares[0].id).toBe('share-2')
      expect(toast.success).toHaveBeenCalledWith('Share link revoked successfully')
    })

    it('should return false if documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentShares(''))

      let success: boolean
      await act(async () => {
        success = await result.current.revokeShare('share-1')
      })

      expect(success!).toBe(false)
      expect(bmsApi.documentShares.revoke).not.toHaveBeenCalled()
    })

    it('should return false and show toast on failure', async () => {
      vi.mocked(bmsApi.documentShares.revoke).mockRejectedValue(new Error('Forbidden'))

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let success: boolean
      await act(async () => {
        success = await result.current.revokeShare('share-1')
      })

      expect(success!).toBe(false)
      expect(toast.error).toHaveBeenCalledWith('Failed to revoke share link', {
        description: 'Forbidden',
      })
    })
  })

  describe('getShareLogs', () => {
    it('should return access logs for a share', async () => {
      vi.mocked(bmsApi.documentShares.getLogs).mockResolvedValue(mockLogs)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let logs: any
      await act(async () => {
        logs = await result.current.getShareLogs('share-1')
      })

      expect(logs).toEqual(mockLogs)
      expect(bmsApi.documentShares.getLogs).toHaveBeenCalledWith(mockDocumentId, 'share-1')
    })

    it('should handle non-array response gracefully', async () => {
      vi.mocked(bmsApi.documentShares.getLogs).mockResolvedValue(null as any)

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let logs: any
      await act(async () => {
        logs = await result.current.getShareLogs('share-1')
      })

      expect(logs).toEqual([])
    })

    it('should return empty array if documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentShares(''))

      let logs: any
      await act(async () => {
        logs = await result.current.getShareLogs('share-1')
      })

      expect(logs).toEqual([])
      expect(bmsApi.documentShares.getLogs).not.toHaveBeenCalled()
    })

    it('should return empty array and show toast on failure', async () => {
      vi.mocked(bmsApi.documentShares.getLogs).mockRejectedValue(new Error('Server error'))

      const { result } = renderHook(() => useDocumentShares(mockDocumentId))

      let logs: any
      await act(async () => {
        logs = await result.current.getShareLogs('share-1')
      })

      expect(logs).toEqual([])
      expect(toast.error).toHaveBeenCalledWith('Failed to load share access logs', {
        description: 'Server error',
      })
    })
  })
})
