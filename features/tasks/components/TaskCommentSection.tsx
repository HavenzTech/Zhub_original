"use client"

import { useEffect, useState, useCallback } from "react"
import { MessageSquare, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTaskComments } from "@/lib/hooks/useTaskComments"
import { bmsApi } from "@/lib/services/bmsApi"
import { extractArray } from "@/lib/utils/api"
import { authService } from "@/lib/services/auth"
import type { UserResponse } from "@/types/bms"
import { TaskCommentInput } from "./TaskCommentInput"
import { TaskCommentItem } from "./TaskCommentItem"

interface TaskCommentSectionProps {
  taskId: string
}

export function TaskCommentSection({ taskId }: TaskCommentSectionProps) {
  const {
    comments,
    loading,
    total,
    hasMore,
    loadComments,
    loadMore,
    createComment,
    updateComment,
    deleteComment,
  } = useTaskComments()

  const [users, setUsers] = useState<UserResponse[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    loadComments(taskId)
  }, [taskId, loadComments])

  useEffect(() => {
    // Load company users for @mentions
    const loadUsers = async () => {
      try {
        const data = await bmsApi.users.getAll()
        setUsers(extractArray<UserResponse>(data))
      } catch {
        // Silently fail — mentions just won't autocomplete
      }
    }
    loadUsers()

    // Get current user info
    const auth = authService.getAuth()
    if (auth) {
      setCurrentUserId(auth.userId ?? undefined)
      setIsAdmin(authService.isAdmin())
    }
  }, [])

  const handleCreateComment = useCallback(
    async (content: string, mentionedUserIds: string[]) => {
      await createComment(taskId, {
        content,
        mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : null,
      })
    },
    [taskId, createComment]
  )

  const handleReply = useCallback(
    (parentCommentId: string) =>
      async (content: string, mentionedUserIds: string[]) => {
        await createComment(taskId, {
          content,
          parentCommentId,
          mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : null,
        })
      },
    [taskId, createComment]
  )

  const handleEdit = useCallback(
    async (commentId: string, content: string, mentionedUserIds: string[]) => {
      await updateComment(taskId, commentId, {
        content,
        mentionedUserIds: mentionedUserIds.length > 0 ? mentionedUserIds : null,
      })
    },
    [taskId, updateComment]
  )

  const handleDelete = useCallback(
    async (commentId: string) => {
      await deleteComment(taskId, commentId)
    },
    [taskId, deleteComment]
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-4 h-4 text-stone-400" />
        <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100">
          Comments
          {total > 0 && (
            <span className="ml-1.5 text-stone-400 font-normal">({total})</span>
          )}
        </h3>
      </div>

      {/* Comment input */}
      <TaskCommentInput
        onSubmit={handleCreateComment}
        users={users}
      />

      {/* Comments list */}
      {loading && comments.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-stone-400" />
        </div>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-stone-400 dark:text-stone-500 py-6">
          No comments yet. Be the first to comment.
        </p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <TaskCommentItem
              key={comment.id}
              comment={comment}
              currentUserId={currentUserId}
              isAdmin={isAdmin}
              isTopLevel={true}
              users={users}
              onReply={comment.id ? handleReply(comment.id) : undefined}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="flex justify-center pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => loadMore(taskId)}
                disabled={loading}
                className="text-xs text-stone-400 hover:text-accent-cyan"
              >
                {loading ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : null}
                Load more comments
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
