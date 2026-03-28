import { useQuery } from '@tanstack/react-query'
import { bmsApi, BmsApiError } from '@/lib/services/bmsApi'
import { authService } from '@/lib/services/auth'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type {
  Company,
  Department,
  Project,
  Property,
  User,
  DocumentDto,
  Task,
} from '@/types/bms'

/**
 * Decomposed dashboard hook using individual React Query queries.
 * Each query shares its key with entity-specific hooks, so data cached
 * from other pages (e.g. Projects) is reused here automatically.
 */
export function useDashboardQuery() {
  const companiesQuery = useQuery({
    queryKey: queryKeys.companies.all,
    queryFn: async () => {
      try {
        const data = await bmsApi.companies.getAll()
        return extractArray<Company>(data)
      } catch (err) {
        if (err instanceof BmsApiError && err.status === 403) {
          const auth = authService.getAuth()
          if (auth?.userId) {
            const data = await bmsApi.companies.getByUser(auth.userId)
            return extractArray<Company>(data)
          }
        }
        throw err
      }
    },
    staleTime: STALE_TIMES.STATIC,
  })

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: async () => {
      const data = await bmsApi.departments.getAll()
      return extractArray<Department>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })

  const projectsQuery = useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const data = await bmsApi.projects.getAll()
      return extractArray<Project>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.all,
    queryFn: async () => {
      const data = await bmsApi.properties.getAll()
      return extractArray<Property>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })

  const usersQuery = useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const data = await bmsApi.users.getAll()
      return extractArray<User>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })

  const documentsQuery = useQuery({
    queryKey: queryKeys.documents.all,
    queryFn: async () => {
      const data = await bmsApi.documents.getAll()
      return extractArray<DocumentDto>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })

  const myTasksQuery = useQuery({
    queryKey: queryKeys.tasks.myTasks(),
    queryFn: async () => {
      try {
        const data = await bmsApi.tasks.getMyTasks()
        return extractArray<Task>(data)
      } catch {
        return []
      }
    },
    staleTime: STALE_TIMES.DYNAMIC,
  })

  const queries = [
    companiesQuery, departmentsQuery, projectsQuery, propertiesQuery,
    usersQuery, documentsQuery, myTasksQuery,
  ]

  const loading = queries.some(q => q.isLoading)
  const error = queries.find(q => q.error)?.error ?? null

  return {
    companies: companiesQuery.data ?? [],
    departments: departmentsQuery.data ?? [],
    projects: projectsQuery.data ?? [],
    properties: propertiesQuery.data ?? [],
    users: usersQuery.data ?? [],
    documents: documentsQuery.data ?? [],
    myTasks: myTasksQuery.data ?? [],
    loading,
    error,
    loadDashboardData: async () => {
      await Promise.all(queries.map(q => q.refetch()))
    },
  }
}
