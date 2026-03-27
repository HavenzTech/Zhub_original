import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { ProjectActivityEntryDto } from "@/types/bms"
import { toast } from "sonner"

interface UseProjectActivityReturn {
  activities: ProjectActivityEntryDto[]
  loading: boolean
  total: number
  page: number
  hasMore: boolean
  loadActivity: (projectId: string, page?: number, pageSize?: number) => Promise<void>
  loadMore: (projectId: string) => Promise<void>
}

/**
 * Hook for fetching paginated project activity feed.
 * Used in project detail pages to show a timeline of actions.
 */
export function useProjectActivity(): UseProjectActivityReturn {
  const [activities, setActivities] = useState<ProjectActivityEntryDto[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(50)

  const hasMore = activities.length < total

  const loadActivity = useCallback(
    async (projectId: string, requestPage = 1, requestPageSize = 50) => {
      try {
        setLoading(true)
        const result = (await bmsApi.projects.getActivity(projectId, {
          page: requestPage,
          pageSize: requestPageSize,
        })) as { data: ProjectActivityEntryDto[]; total: number; page: number; pageSize: number }

        if (requestPage === 1) {
          setActivities(result.data || [])
        } else {
          setActivities((prev) => [...prev, ...(result.data || [])])
        }
        setTotal(result.total || 0)
        setPage(result.page || requestPage)
        setPageSize(result.pageSize || requestPageSize)
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to load activity")
        toast.error("Failed to load project activity", {
          description: error.message,
        })
        if (requestPage === 1) setActivities([])
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const loadMore = useCallback(
    async (projectId: string) => {
      await loadActivity(projectId, page + 1, pageSize)
    },
    [loadActivity, page, pageSize]
  )

  return {
    activities,
    loading,
    total,
    page,
    hasMore,
    loadActivity,
    loadMore,
  }
}
