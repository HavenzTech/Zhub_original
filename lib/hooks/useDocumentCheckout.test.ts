import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useDocumentCheckout } from './useDocumentCheckout'

vi.mock('@/lib/services/bmsApi', () => ({
  bmsApi: {
    documentCheckout: {
      getStatus: vi.fn(),
      checkout: vi.fn(),
      checkin: vi.fn(),
      cancel: vi.fn(),
      forceCancel: vi.fn(),
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

const mockStatus = {
  isCheckedOut: true,
  checkedOutByUserId: 'user-1',
  checkedOutByUserName: 'John Doe',
  checkedOutAt: '2025-01-15T10:00:00Z',
}

const mockResponse = { success: true, message: 'OK' }

describe('useDocumentCheckout', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('initial state', () => {
    it('should start with null status and no loading', () => {
      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))
      expect(result.current.status).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
      expect(result.current.isCheckedOutByMe).toBe(false)
      expect(result.current.isCheckedOutByOther).toBe(false)
    })
  })

  describe('loadStatus', () => {
    it('should load checkout status', async () => {
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      await act(async () => {
        await result.current.loadStatus()
      })

      expect(result.current.status).toEqual(mockStatus)
      expect(bmsApi.documentCheckout.getStatus).toHaveBeenCalledWith('doc-1')
    })

    it('should not call API when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentCheckout('', 'user-1'))

      await act(async () => {
        await result.current.loadStatus()
      })

      expect(bmsApi.documentCheckout.getStatus).not.toHaveBeenCalled()
    })

    it('should set error on failure', async () => {
      vi.mocked(bmsApi.documentCheckout.getStatus).mockRejectedValue(new Error('Failed'))

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      await act(async () => {
        await result.current.loadStatus()
      })

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('isCheckedOutByMe / isCheckedOutByOther', () => {
    it('should be true for isCheckedOutByMe when current user checked out', async () => {
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      await act(async () => {
        await result.current.loadStatus()
      })

      expect(result.current.isCheckedOutByMe).toBe(true)
      expect(result.current.isCheckedOutByOther).toBe(false)
    })

    it('should be true for isCheckedOutByOther when different user checked out', async () => {
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-2'))

      await act(async () => {
        await result.current.loadStatus()
      })

      expect(result.current.isCheckedOutByMe).toBe(false)
      expect(result.current.isCheckedOutByOther).toBe(true)
    })

    it('should both be false when not checked out', async () => {
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue({
        isCheckedOut: false,
        checkedOutByUserId: null,
      })

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      await act(async () => {
        await result.current.loadStatus()
      })

      expect(result.current.isCheckedOutByMe).toBe(false)
      expect(result.current.isCheckedOutByOther).toBe(false)
    })
  })

  describe('checkout', () => {
    it('should checkout document and reload status', async () => {
      vi.mocked(bmsApi.documentCheckout.checkout).mockResolvedValue(mockResponse)
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.checkout()
      })

      expect(response).toEqual(mockResponse)
      expect(bmsApi.documentCheckout.checkout).toHaveBeenCalledWith('doc-1', {})
      expect(toast.success).toHaveBeenCalledWith('Document checked out successfully')
      // Should have called loadStatus after checkout
      expect(bmsApi.documentCheckout.getStatus).toHaveBeenCalled()
    })

    it('should pass duration when provided', async () => {
      vi.mocked(bmsApi.documentCheckout.checkout).mockResolvedValue(mockResponse)
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue(mockStatus)

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      await act(async () => {
        await result.current.checkout(24)
      })

      expect(bmsApi.documentCheckout.checkout).toHaveBeenCalledWith('doc-1', { durationHours: 24 })
    })

    it('should return null when documentId is empty', async () => {
      const { result } = renderHook(() => useDocumentCheckout('', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.checkout()
      })

      expect(response).toBeNull()
      expect(bmsApi.documentCheckout.checkout).not.toHaveBeenCalled()
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentCheckout.checkout).mockRejectedValue(new Error('Already checked out'))

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.checkout()
      })

      expect(response).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to check out document', {
        description: 'Already checked out',
      })
    })
  })

  describe('checkin', () => {
    it('should checkin document and reload status', async () => {
      vi.mocked(bmsApi.documentCheckout.checkin).mockResolvedValue(mockResponse)
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue({ isCheckedOut: false })

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.checkin({ comment: 'Done' })
      })

      expect(response).toEqual(mockResponse)
      expect(bmsApi.documentCheckout.checkin).toHaveBeenCalledWith('doc-1', { comment: 'Done' })
      expect(toast.success).toHaveBeenCalledWith('Document checked in successfully')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentCheckout.checkin).mockRejectedValue(new Error('Not checked out'))

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.checkin({})
      })

      expect(response).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to check in document', {
        description: 'Not checked out',
      })
    })
  })

  describe('cancelCheckout', () => {
    it('should cancel checkout and reload status', async () => {
      vi.mocked(bmsApi.documentCheckout.cancel).mockResolvedValue(mockResponse)
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue({ isCheckedOut: false })

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.cancelCheckout()
      })

      expect(response).toEqual(mockResponse)
      expect(toast.success).toHaveBeenCalledWith('Checkout cancelled successfully')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentCheckout.cancel).mockRejectedValue(new Error('Not authorized'))

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.cancelCheckout()
      })

      expect(response).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to cancel checkout', {
        description: 'Not authorized',
      })
    })
  })

  describe('forceCancel', () => {
    it('should force cancel with reason and reload status', async () => {
      vi.mocked(bmsApi.documentCheckout.forceCancel).mockResolvedValue(mockResponse)
      vi.mocked(bmsApi.documentCheckout.getStatus).mockResolvedValue({ isCheckedOut: false })

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.forceCancel('Admin override')
      })

      expect(response).toEqual(mockResponse)
      expect(bmsApi.documentCheckout.forceCancel).toHaveBeenCalledWith('doc-1', { reason: 'Admin override' })
      expect(toast.success).toHaveBeenCalledWith('Checkout force cancelled')
    })

    it('should return null and toast on failure', async () => {
      vi.mocked(bmsApi.documentCheckout.forceCancel).mockRejectedValue(new Error('Not admin'))

      const { result } = renderHook(() => useDocumentCheckout('doc-1', 'user-1'))

      let response: any
      await act(async () => {
        response = await result.current.forceCancel('Override')
      })

      expect(response).toBeNull()
      expect(toast.error).toHaveBeenCalledWith('Failed to force cancel checkout', {
        description: 'Not admin',
      })
    })
  })
})
