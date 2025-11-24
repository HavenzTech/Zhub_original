import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  Company,
  Department,
  Project,
  Property,
  BmsDevice,
  AccessLog,
} from "@/types/bms"
import { toast } from "sonner"

interface DashboardData {
  companies: Company[]
  departments: Department[]
  projects: Project[]
  properties: Property[]
  bmsDevices: BmsDevice[]
  accessLogs: AccessLog[]
}

interface UseDashboardReturn extends DashboardData {
  loading: boolean
  error: Error | null
  loadDashboardData: () => Promise<void>
}

/**
 * Hook for managing dashboard data
 * Fetches all necessary data for the dashboard in parallel
 */
export function useDashboard(): UseDashboardReturn {
  const [companies, setCompanies] = useState<Company[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [bmsDevices, setBmsDevices] = useState<BmsDevice[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const [
        companiesData,
        departmentsData,
        projectsData,
        propertiesData,
        devicesData,
        logsData,
      ] = await Promise.all([
        bmsApi.companies.getAll(),
        bmsApi.departments.getAll(),
        bmsApi.projects.getAll(),
        bmsApi.properties.getAll(),
        bmsApi.bmsDevices.getAll(),
        bmsApi.accessLogs.getAll(),
      ])

      setCompanies(companiesData as Company[])
      setDepartments(departmentsData as Department[])
      setProjects(projectsData as Project[])
      setProperties(propertiesData as Property[])
      setBmsDevices(devicesData as BmsDevice[])
      setAccessLogs(logsData as AccessLog[])
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to load dashboard data")
      setError(error)
      toast.error("Failed to load dashboard data", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    companies,
    departments,
    projects,
    properties,
    bmsDevices,
    accessLogs,
    loading,
    error,
    loadDashboardData,
  }
}
