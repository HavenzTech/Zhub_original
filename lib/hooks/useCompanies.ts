import { useState, useCallback, Dispatch, SetStateAction } from "react"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import type { Company } from "@/types/bms"
import { toast } from "sonner"

interface UseCompaniesReturn {
  companies: Company[]
  loading: boolean
  error: Error | null
  loadCompanies: () => Promise<void>
  createCompany: (companyData: Partial<Company>) => Promise<Company | null>
  updateCompany: (
    id: string,
    companyData: Partial<Company>
  ) => Promise<boolean>
  deleteCompany: (id: string) => Promise<boolean>
  setCompanies: Dispatch<SetStateAction<Company[]>>
}

/**
 * Hook for managing companies
 * Handles fetching, creating, updating, and deleting companies
 * Includes fallback logic for permission-based company access
 */
export function useCompanies(): UseCompaniesReturn {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get all companies - if 403, try getting user's companies instead
      try {
        const data = await bmsApi.companies.getAll()
        setCompanies(data as Company[])
      } catch (getAllError) {
        // If getAll fails with 403, try getting companies by user
        if (getAllError instanceof BmsApiError && getAllError.status === 403) {
          console.log(
            "⚠️ GET /company returned 403, trying to get user companies..."
          )
          const auth = authService.getAuth()
          if (auth?.userId) {
            const data = await bmsApi.companies.getByUser(auth.userId)
            setCompanies(data as Company[])
          } else {
            throw getAllError
          }
        } else {
          throw getAllError
        }
      }
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load companies")
      setError(error)

      // Show specific error message for 403
      if (err instanceof BmsApiError && err.status === 403) {
        toast.error(
          "Access denied. The GET /company endpoint may not be implemented on the backend."
        )
      } else {
        toast.error("Failed to load companies", {
          description: error.message,
        })
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const createCompany = useCallback(
    async (companyData: Partial<Company>): Promise<Company | null> => {
      try {
        const newCompany = await bmsApi.companies.create(companyData)
        setCompanies((prev) => [...prev, newCompany as Company])
        toast.success("Company created successfully")
        return newCompany as Company
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create company")
        toast.error("Failed to create company", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateCompany = useCallback(
    async (id: string, companyData: Partial<Company>): Promise<boolean> => {
      try {
        await bmsApi.companies.update(id, companyData)
        setCompanies((prev) =>
          prev.map((company) =>
            company.id === id ? { ...company, ...companyData } : company
          )
        )
        toast.success("Company updated successfully")
        return true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update company")
        toast.error("Failed to update company", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteCompany = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.companies.delete(id)
      setCompanies((prev) => prev.filter((company) => company.id !== id))
      toast.success("Company deleted successfully")
      return true
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete company")
      toast.error("Failed to delete company", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    companies,
    loading,
    error,
    loadCompanies,
    createCompany,
    updateCompany,
    deleteCompany,
    setCompanies,
  }
}
