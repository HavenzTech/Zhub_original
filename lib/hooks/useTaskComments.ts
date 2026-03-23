import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type {
  TaskCommentDto,
  CreateTaskCommentRequest,
  UpdateTaskCommentRequest,
  PagedResult,
} from "@/types/bms"
import { toast } from "sonner"

interface UseTaskCommentsReturn {
  comments: TaskCommentDto[]
  loading: boolean
  error: Error | null
  total: number
  page: number
  pageSize: number
  hasMore: boolean
  loadComments: (taskId: string, page?: number, pageSize?: number) => Promise<void>
  loadMore: (taskId: string) => Promise<void>
  createComment: (taskId: string, data: CreateTaskCommentRequest) => Promise<TaskCommentDto | null>
  updateComment: (taskId: string, commentId: string, data: UpdateTaskCommentRequest) => Promise<TaskCommentDto | null>
  deleteComment: (taskId: string, commentId: string) => Promise<boolean>
}

export function useTaskComments(): UseTaskCommentsReturn {
  const [comments, setComments] = useState<TaskCommentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [hasMore, setHasMore] = useState(false)

  const loadComments = useCallback(async (taskId: string, p?: number, ps?: number) => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.taskComments.getAll(taskId, {
        page: p ?? 1,
        pageSize: ps ?? 20,
      }) as PagedResult<TaskCommentDto>
      setComments(data.data || [])
      setTotal(data.total || 0)
      setPage(data.page || 1)
      setPageSize(data.pageSize || 20)
      setHasMore(data.hasMore || false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load comments")
      setError(error)
      toast.error("Failed to load comments", { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const loadMore = useCallback(async (taskId: string) => {
    try {
      setLoading(true)
      const nextPage = page + 1
      const data = await bmsApi.taskComments.getAll(taskId, {
        page: nextPage,
        pageSize,
      }) as PagedResult<TaskCommentDto>
      setComments((prev) => [...prev, ...(data.data || [])])
      setTotal(data.total || 0)
      setPage(data.page || nextPage)
      setHasMore(data.hasMore || false)
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load more comments")
      toast.error("Failed to load more comments", { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [page, pageSize])

  const createComment = useCallback(
    async (taskId: string, data: CreateTaskCommentRequest): Promise<TaskCommentDto | null> => {
      try {
        const newComment = (await bmsApi.taskComments.create(taskId, data)) as TaskCommentDto

        if (data.parentCommentId) {
          // It's a reply — add it to the parent's replies array
          setComments((prev) =>
            prev.map((c) =>
              c.id === data.parentCommentId
                ? { ...c, replies: [...(c.replies || []), newComment] }
                : c
            )
          )
        } else {
          // Top-level comment — prepend
          setComments((prev) => [newComment, ...prev])
          setTotal((prev) => prev + 1)
        }

        return newComment
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to post comment")
        toast.error("Failed to post comment", { description: error.message })
        return null
      }
    },
    []
  )

  const updateComment = useCallback(
    async (taskId: string, commentId: string, data: UpdateTaskCommentRequest): Promise<TaskCommentDto | null> => {
      try {
        const updated = (await bmsApi.taskComments.update(taskId, commentId, data)) as TaskCommentDto

        setComments((prev) =>
          prev.map((c) => {
            if (c.id === commentId) return { ...c, ...updated }
            // Check replies
            if (c.replies?.some((r) => r.id === commentId)) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId ? { ...r, ...updated } : r
                ),
              }
            }
            return c
          })
        )

        toast.success("Comment updated")
        return updated
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to update comment")
        toast.error("Failed to update comment", { description: error.message })
        return null
      }
    },
    []
  )

  const deleteComment = useCallback(
    async (taskId: string, commentId: string): Promise<boolean> => {
      try {
        await bmsApi.taskComments.delete(taskId, commentId)

        setComments((prev) => {
          // Try removing as top-level
          const filtered = prev.filter((c) => c.id !== commentId)
          if (filtered.length !== prev.length) {
            setTotal((t) => t - 1)
            return filtered
          }
          // Otherwise remove from replies
          return prev.map((c) => ({
            ...c,
            replies: c.replies?.filter((r) => r.id !== commentId) ?? null,
          }))
        })

        toast.success("Comment deleted")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete comment")
        toast.error("Failed to delete comment", { description: error.message })
        return false
      }
    },
    []
  )

  return {
    comments,
    loading,
    error,
    total,
    page,
    pageSize,
    hasMore,
    loadComments,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
  }
}
