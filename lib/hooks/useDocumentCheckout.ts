import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  CheckoutStatusDto,
  CheckoutRequest,
  CheckinRequest,
  CheckoutOperationResponse,
  ForceCheckoutCancelRequest,
} from "@/types/bms"
import { toast } from "sonner"

interface UseDocumentCheckoutReturn {
  status: CheckoutStatusDto | null
  loading: boolean
  error: Error | null
  loadStatus: () => Promise<void>
  checkout: (duration?: number) => Promise<CheckoutOperationResponse | null>
  checkin: (request: CheckinRequest) => Promise<CheckoutOperationResponse | null>
  cancelCheckout: () => Promise<CheckoutOperationResponse | null>
  forceCancel: (reason: string) => Promise<CheckoutOperationResponse | null>
  isCheckedOutByMe: boolean
  isCheckedOutByOther: boolean
}

/**
 * Hook for managing document check-out/check-in
 * Handles checkout, checkin, and status operations
 */
export function useDocumentCheckout(documentId: string, currentUserId?: string): UseDocumentCheckoutReturn {
  const [status, setStatus] = useState<CheckoutStatusDto | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadStatus = useCallback(async () => {
    if (!documentId) return
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documentCheckout.getStatus(documentId)
      setStatus(data)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load checkout status")
      setError(error)
    } finally {
      setLoading(false)
    }
  }, [documentId])

  const checkout = useCallback(
    async (duration?: number): Promise<CheckoutOperationResponse | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const request: CheckoutRequest = duration ? { durationHours: duration } : {}
        const response = await bmsApi.documentCheckout.checkout(documentId, request)
        toast.success("Document checked out successfully")
        await loadStatus()
        return response
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to check out document")
        toast.error("Failed to check out document", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId, loadStatus]
  )

  const checkin = useCallback(
    async (request: CheckinRequest): Promise<CheckoutOperationResponse | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const response = await bmsApi.documentCheckout.checkin(documentId, request)
        toast.success("Document checked in successfully")
        await loadStatus()
        return response
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to check in document")
        toast.error("Failed to check in document", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId, loadStatus]
  )

  const cancelCheckout = useCallback(async (): Promise<CheckoutOperationResponse | null> => {
    if (!documentId) return null
    try {
      setLoading(true)
      const response = await bmsApi.documentCheckout.cancel(documentId)
      toast.success("Checkout cancelled successfully")
      await loadStatus()
      return response
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to cancel checkout")
      toast.error("Failed to cancel checkout", {
        description: error.message,
      })
      return null
    } finally {
      setLoading(false)
    }
  }, [documentId, loadStatus])

  const forceCancel = useCallback(
    async (reason: string): Promise<CheckoutOperationResponse | null> => {
      if (!documentId) return null
      try {
        setLoading(true)
        const request: ForceCheckoutCancelRequest = { reason }
        const response = await bmsApi.documentCheckout.forceCancel(documentId, request)
        toast.success("Checkout force cancelled")
        await loadStatus()
        return response
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to force cancel checkout")
        toast.error("Failed to force cancel checkout", {
          description: error.message,
        })
        return null
      } finally {
        setLoading(false)
      }
    },
    [documentId, loadStatus]
  )

  const isCheckedOutByMe = status?.isCheckedOut && status?.checkedOutByUserId === currentUserId
  const isCheckedOutByOther = status?.isCheckedOut && status?.checkedOutByUserId !== currentUserId

  return {
    status,
    loading,
    error,
    loadStatus,
    checkout,
    checkin,
    cancelCheckout,
    forceCancel,
    isCheckedOutByMe: !!isCheckedOutByMe,
    isCheckedOutByOther: !!isCheckedOutByOther,
  }
}
