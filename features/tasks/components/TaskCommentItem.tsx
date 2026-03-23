"use client"

import { useState, useMemo } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Reply, Edit, Trash2 } from "lucide-react"
import type { TaskCommentDto, UserResponse } from "@/types/bms"
import { TaskCommentInput } from "./TaskCommentInput"

interface TaskCommentItemProps {
  comment: TaskCommentDto
  currentUserId?: string
  isAdmin?: boolean
  isTopLevel?: boolean
  users: UserResponse[]
  onReply?: (content: string, mentionedUserIds: string[]) => Promise<void>
  onEdit: (commentId: string, content: string, mentionedUserIds: string[]) => Promise<void>
  onDelete: (commentId: string) => Promise<void>
}

function formatCommentTime(dateStr?: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

function renderContentWithMentions(
  content: string | null | undefined,
  userNames: string[]
): React.ReactNode {
  if (!content || userNames.length === 0) return content

  // Build a regex that matches @<known user name> (longest names first to avoid partial matches)
  const sorted = [...userNames].sort((a, b) => b.length - a.length)
  const escaped = sorted.map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
  const pattern = new RegExp(`(@(?:${escaped.join("|")}))`, "gi")

  const parts = content.split(pattern)
  return parts.map((part, i) => {
    if (part.startsWith("@")) {
      const name = part.slice(1)
      if (userNames.some((n) => n.toLowerCase() === name.toLowerCase())) {
        return (
          <span
            key={i}
            className="bg-accent-cyan/15 text-accent-cyan font-medium rounded px-0.5"
          >
            {part}
          </span>
        )
      }
    }
    return part
  })
}

export function TaskCommentItem({
  comment,
  currentUserId,
  isAdmin = false,
  isTopLevel = true,
  users,
  onReply,
  onEdit,
  onDelete,
}: TaskCommentItemProps) {
  const [replying, setReplying] = useState(false)
  const [editing, setEditing] = useState(false)

  // Build list of user names for mention matching
  const userNameList = useMemo(
    () => users.map((u) => u.name || u.email || "").filter(Boolean),
    [users]
  )

  const isOwner = currentUserId && comment.userId === currentUserId
  const canModify = isOwner || isAdmin

  const handleReply = async (content: string, mentionedUserIds: string[]) => {
    await onReply?.(content, mentionedUserIds)
    setReplying(false)
  }

  const handleEdit = async (content: string, mentionedUserIds: string[]) => {
    if (!comment.id) return
    await onEdit(comment.id, content, mentionedUserIds)
    setEditing(false)
  }

  const handleDelete = async () => {
    if (!comment.id) return
    await onDelete(comment.id)
  }

  const initials = (comment.userName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  return (
    <div className={`group ${isTopLevel ? "" : "ml-8 mt-3"}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div
          className={`shrink-0 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center font-medium ${
            isTopLevel ? "w-8 h-8 text-xs" : "w-6 h-6 text-[10px]"
          }`}
        >
          {initials}
        </div>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
              {comment.userName || "Unknown"}
            </span>
            <span className="text-xs text-stone-400 dark:text-stone-500">
              {formatCommentTime(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-stone-400 dark:text-stone-500 italic">
                (edited)
              </span>
            )}

            {/* Actions */}
            {canModify && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setEditing(true)}>
                    <Edit className="w-3.5 h-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content */}
          {editing ? (
            <div className="mt-1">
              <TaskCommentInput
                onSubmit={handleEdit}
                users={users}
                initialContent={comment.content || ""}
                submitLabel="Save"
                autoFocus
                onCancel={() => setEditing(false)}
              />
            </div>
          ) : (
            <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap mt-0.5 leading-relaxed">
              {renderContentWithMentions(comment.content, userNameList)}
            </p>
          )}

          {/* Reply button — only on top-level comments */}
          {isTopLevel && !editing && onReply && (
            <button
              type="button"
              onClick={() => setReplying(!replying)}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-accent-cyan mt-1 transition-colors"
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
          )}

          {/* Reply input */}
          {replying && (
            <div className="mt-2">
              <TaskCommentInput
                onSubmit={handleReply}
                users={users}
                placeholder="Write a reply..."
                submitLabel="Reply"
                autoFocus
                onCancel={() => setReplying(false)}
              />
            </div>
          )}

          {/* Nested replies */}
          {isTopLevel && comment.replies && comment.replies.length > 0 && (
            <div className="mt-2 space-y-2">
              {comment.replies.map((reply) => (
                <TaskCommentItem
                  key={reply.id}
                  comment={reply}
                  currentUserId={currentUserId}
                  isAdmin={isAdmin}
                  isTopLevel={false}
                  users={users}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
