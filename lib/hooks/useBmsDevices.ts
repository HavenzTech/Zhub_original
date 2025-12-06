import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import { extractArray } from "@/lib/utils/api"
import type { BmsDevice } from "@/types/bms"
import { toast } from "sonner"

interface UseBmsDevicesReturn {
  devices: BmsDevice[]
  loading: boolean
  error: Error | null
  loadDevices: () => Promise<void>
  createDevice: (deviceData: Partial<BmsDevice>) => Promise<BmsDevice | null>
  updateDevice: (
    id: string,
    deviceData: Partial<BmsDevice>
  ) => Promise<boolean>
  deleteDevice: (id: string) => Promise<boolean>
  setDevices: React.Dispatch<React.SetStateAction<BmsDevice[]>>
}

/**
 * Hook for managing BMS devices
 * Handles fetching, creating, updating, and deleting BMS hardware devices
 */
export function useBmsDevices(): UseBmsDevicesReturn {
  const [devices, setDevices] = useState<BmsDevice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadDevices = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.bmsDevices.getAll()
      const devices = extractArray<BmsDevice>(data)
      setDevices(devices)
      toast.success(`Loaded ${devices.length} devices`)
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load BMS devices")
      setError(error)
      toast.error("Failed to load BMS devices", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const createDevice = useCallback(
    async (deviceData: Partial<BmsDevice>): Promise<BmsDevice | null> => {
      try {
        const newDevice = await bmsApi.bmsDevices.create(deviceData)
        setDevices((prev: BmsDevice[]) => [...prev, newDevice as BmsDevice])
        toast.success("Device created successfully")
        return newDevice as BmsDevice
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create device")
        toast.error("Failed to create device", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateDevice = useCallback(
    async (id: string, deviceData: Partial<BmsDevice>): Promise<boolean> => {
      try {
        await bmsApi.bmsDevices.update(id, deviceData)
        setDevices((prev: BmsDevice[]) =>
          prev.map((device: BmsDevice) =>
            device.id === id ? { ...device, ...deviceData } : device
          )
        )
        toast.success("Device updated successfully")
        return true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update device")
        toast.error("Failed to update device", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteDevice = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.bmsDevices.delete(id)
      setDevices((prev: BmsDevice[]) =>
        prev.filter((device: BmsDevice) => device.id !== id)
      )
      toast.success("Device deleted successfully")
      return true
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete device")
      toast.error("Failed to delete device", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    devices,
    loading,
    error,
    loadDevices,
    createDevice,
    updateDevice,
    deleteDevice,
    setDevices,
  }
}
