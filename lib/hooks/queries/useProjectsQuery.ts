import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bmsApi } from '@/lib/services/bmsApi'
import { extractArray } from '@/lib/utils/api'
import { queryKeys } from '@/lib/query/queryKeys'
import { STALE_TIMES } from '@/lib/query/staleTimes'
import type { Project } from '@/types/bms'
import { toast } from 'sonner'

// --- Queries ---

export function useProjectsQuery() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async () => {
      const data = await bmsApi.projects.getAll()
      return extractArray<Project>(data)
    },
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useProjectDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => bmsApi.projects.getById(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useProjectMembersQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.projects.members(id),
    queryFn: () => bmsApi.projects.getMembers(id),
    enabled: !!id,
    staleTime: STALE_TIMES.STANDARD,
  })
}

export function useProjectActivityQuery(id: string, page = 1, pageSize = 20) {
  return useQuery({
    queryKey: queryKeys.projects.activity(id),
    queryFn: () => bmsApi.projects.getActivity(id, { page, pageSize }),
    enabled: !!id,
    staleTime: STALE_TIMES.DYNAMIC,
  })
}

// --- Mutations ---

export function useCreateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Project>) => bmsApi.projects.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast.success('Project created successfully')
    },
    onError: (err) => {
      toast.error('Failed to create project', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useUpdateProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      bmsApi.projects.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(id) })
      toast.success('Project updated successfully')
    },
    onError: (err) => {
      toast.error('Failed to update project', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

export function useDeleteProject() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => bmsApi.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all })
      toast.success('Project deleted successfully')
    },
    onError: (err) => {
      toast.error('Failed to delete project', {
        description: err instanceof Error ? err.message : 'Unknown error',
      })
    },
  })
}

// --- Compat wrapper ---

export function useProjectsQueryCompat() {
  const { data, isLoading, error, refetch } = useProjectsQuery()
  const queryClient = useQueryClient()
  const createMutation = useCreateProject()
  const updateMutation = useUpdateProject()
  const deleteMutation = useDeleteProject()

  return {
    projects: data ?? [],
    loading: isLoading,
    error: error ?? null,
    loadProjects: async () => { await refetch() },
    createProject: async (projectData: Partial<Project>): Promise<Project | null> => {
      try {
        return await createMutation.mutateAsync(projectData) as Project
      } catch {
        return null
      }
    },
    updateProject: async (id: string, projectData: Partial<Project>): Promise<boolean> => {
      try {
        await updateMutation.mutateAsync({ id, data: projectData })
        return true
      } catch {
        return false
      }
    },
    deleteProject: async (id: string): Promise<boolean> => {
      try {
        await deleteMutation.mutateAsync(id)
        return true
      } catch {
        return false
      }
    },
    setProjects: (updater: React.SetStateAction<Project[]>) => {
      queryClient.setQueryData(queryKeys.projects.all, (old: Project[] | undefined) => {
        if (typeof updater === 'function') return updater(old ?? [])
        return updater
      })
    },
  }
}
