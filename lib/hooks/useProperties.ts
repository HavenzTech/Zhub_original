import { useState, useCallback } from "react"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import type { Property, PropertyType, PropertyStatus } from "@/types/bms"
import { toast } from "sonner"

interface UsePropertiesReturn {
  properties: Property[]
  loading: boolean
  error: string | null
  loadProperties: () => Promise<void>
  createProperty: (propertyData: any) => Promise<Property | null>
  updateProperty: (id: string, propertyData: any) => Promise<boolean>
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>
}

/**
 * Hook for managing properties
 * Handles fetching, creating, and updating properties
 */
export function useProperties(): UsePropertiesReturn {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadProperties = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.properties.getAll()
      setProperties(data as Property[])
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to load properties"
      setError(errorMessage)
      toast.error(errorMessage)
      console.error("Error loading properties:", err)
    } finally {
      setLoading(false)
    }
  }, [])

  const createProperty = useCallback(async (propertyData: any): Promise<Property | null> => {
    try {
      const newProperty = await bmsApi.properties.create(propertyData)
      setProperties((prev: Property[]) => [...prev, newProperty as Property])
      toast.success("Property created successfully!")
      return newProperty as Property
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create property"
      toast.error(errorMessage)
      console.error("Error creating property:", err)
      return null
    }
  }, [])

  const updateProperty = useCallback(
    async (id: string, propertyData: any): Promise<boolean> => {
      try {
        await bmsApi.properties.update(id, propertyData)
        setProperties((prev: Property[]) =>
          prev.map((property: Property) =>
            property.id === id ? { ...property, ...propertyData } : property
          )
        )
        toast.success("Property updated successfully!")
        return true
      } catch (err) {
        const errorMessage =
          err instanceof BmsApiError ? err.message : "Failed to update property"
        toast.error(errorMessage)
        console.error("Error updating property:", err)
        return false
      }
    },
    []
  )

  return {
    properties,
    loading,
    error,
    loadProperties,
    createProperty,
    updateProperty,
    setProperties,
  }
}
