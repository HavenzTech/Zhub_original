import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { AccessLog, IotMetric } from "@/types/bms"
import { toast } from "sonner"

interface UseDatacenterReturn {
  accessLogs: AccessLog[]
  iotMetrics: IotMetric[]
  loading: boolean
  error: Error | null
  loadData: () => Promise<void>
  setAccessLogs: React.Dispatch<React.SetStateAction<AccessLog[]>>
  setIotMetrics: React.Dispatch<React.SetStateAction<IotMetric[]>>
}

/**
 * Hook for managing secure datacenter data
 * Fetches access logs and IoT metrics for datacenter monitoring
 */
export function useDatacenter(): UseDatacenterReturn {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [iotMetrics, setIotMetrics] = useState<IotMetric[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [logsData, metricsData] = await Promise.all([
        bmsApi.accessLogs.getAll(),
        bmsApi.iotMetrics.getAll(),
      ])

      setAccessLogs(logsData as AccessLog[])
      setIotMetrics(metricsData as IotMetric[])
    } catch (err) {
      const error =
        err instanceof Error
          ? err
          : new Error("Failed to load datacenter data")
      setError(error)
      toast.error("Failed to load datacenter data", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    accessLogs,
    iotMetrics,
    loading,
    error,
    loadData,
    setAccessLogs,
    setIotMetrics,
  }
}
