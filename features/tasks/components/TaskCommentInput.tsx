"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Send, AtSign, Loader2 } from "lucide-react"
import type { UserResponse } from "@/types/bms"

interface TaskCommentInputProps {
  onSubmit: (content: string, mentionedUserIds: string[]) => Promise<void>
  users: UserResponse[]
  placeholder?: string
  submitLabel?: string
  initialContent?: string
  autoFocus?: boolean
  onCancel?: () => void
  disabled?: boolean
}

export function TaskCommentInput({
  onSubmit,
  users,
  placeholder = "Write a comment...",
  submitLabel = "Comment",
  initialContent = "",
  autoFocus = false,
  onCancel,
  disabled = false,
}: TaskCommentInputProps) {
  const [content, setContent] = useState(initialContent)
  const [submitting, setSubmitting] = useState(false)
  const [mentionQuery, setMentionQuery] = useState("")
  const [mentionOpen, setMentionOpen] = useState(false)
  const [mentionedIds, setMentionedIds] = useState<Set<string>>(new Set())
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [autoFocus])

  // Build set for highlight matching
  const userNameSet = useMemo(
    () => new Set(users.map((u) => (u.name || u.email || "").toLowerCase()).filter(Boolean)),
    [users]
  )

  // Render content with highlighted mentions for the overlay
  const renderHighlightedContent = () => {
    if (!content) return null
    const parts = content.split(/(@[\w][\w .'-]*)/g)
    return parts.map((part, i) => {
      if (part.startsWith("@")) {
        const name = part.slice(1).trim()
        if (userNameSet.has(name.toLowerCase())) {
          return (
            <span key={i} className="bg-accent-cyan/15 text-accent-cyan font-medium rounded px-0.5">
              {part}
            </span>
          )
        }
      }
      return part
    })
  }

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(mentionQuery.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "Escape" && onCancel) {
      onCancel()
    }
  }

  const handleSubmit = useCallback(async () => {
    const trimmed = content.trim()
    if (!trimmed || submitting) return

    setSubmitting(true)
    try {
      await onSubmit(trimmed, Array.from(mentionedIds))
      setContent("")
      setMentionedIds(new Set())
    } finally {
      setSubmitting(false)
    }
  }, [content, submitting, mentionedIds, onSubmit])

  const insertMention = (user: UserResponse) => {
    const name = user.name || user.email || "Unknown"
    // Replace the @query with @name
    const textarea = textareaRef.current
    if (textarea) {
      const cursorPos = textarea.selectionStart
      const textBefore = content.substring(0, cursorPos)
      const textAfter = content.substring(cursorPos)
      // Find the last @ before cursor
      const lastAt = textBefore.lastIndexOf("@")
      if (lastAt >= 0) {
        const newContent = textBefore.substring(0, lastAt) + `@${name} ` + textAfter
        setContent(newContent)
      } else {
        setContent(content + `@${name} `)
      }
    } else {
      setContent(content + `@${name} `)
    }

    if (user.id) {
      setMentionedIds((prev) => new Set(prev).add(user.id!))
    }
    setMentionOpen(false)
    setMentionQuery("")
    textareaRef.current?.focus()
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setContent(val)

    // Detect @mention trigger
    const cursorPos = e.target.selectionStart
    const textBefore = val.substring(0, cursorPos)
    const lastAt = textBefore.lastIndexOf("@")
    if (lastAt >= 0) {
      const query = textBefore.substring(lastAt + 1)
      // Only trigger if no space in query (still typing the mention)
      if (!query.includes(" ") && query.length <= 30) {
        setMentionQuery(query)
        setMentionOpen(true)
        return
      }
    }
    setMentionOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || submitting}
          className="min-h-[80px] resize-none pr-10 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 focus:border-accent-cyan"
          rows={3}
        />
        {/* Mention popover */}
        {mentionOpen && filteredUsers.length > 0 && (
          <div className="absolute left-0 bottom-full mb-1 w-64 max-h-48 overflow-y-auto bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-lg shadow-lg z-50">
            {filteredUsers.slice(0, 8).map((user) => (
              <button
                key={user.id || user.userId}
                type="button"
                onClick={() => insertMention(user)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"
              >
                <div className="w-6 h-6 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center text-xs font-medium shrink-0">
                  {(user.name || user.email || "?")[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-stone-900 dark:text-stone-100 truncate">
                    {user.name || "Unknown"}
                  </p>
                  {user.email && (
                    <p className="text-xs text-stone-400 truncate">{user.email}</p>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-stone-400 hover:text-accent-cyan"
                disabled={disabled || submitting}
              >
                <AtSign className="w-3.5 h-3.5 mr-1" />
                Mention
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-0 max-h-48 overflow-y-auto" align="start">
              {users.length === 0 ? (
                <p className="px-3 py-2 text-sm text-stone-400">No users found</p>
              ) : (
                users.map((user) => (
                  <button
                    key={user.id || user.userId}
                    type="button"
                    onClick={() => insertMention(user)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-stone-50 dark:hover:bg-stone-800 flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-accent-cyan/20 text-accent-cyan flex items-center justify-center text-xs font-medium shrink-0">
                      {(user.name || user.email || "?")[0].toUpperCase()}
                    </div>
                    <span className="text-stone-900 dark:text-stone-100 truncate">
                      {user.name || user.email || "Unknown"}
                    </span>
                  </button>
                ))
              )}
            </PopoverContent>
          </Popover>
          <span className="text-[11px] text-stone-400">
            Ctrl+Enter to submit
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCancel}
              disabled={submitting}
              className="h-8"
            >
              Cancel
            </Button>
          )}
          <Button
            type="button"
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() || disabled || submitting}
            className="h-8 bg-accent-cyan hover:bg-accent-cyan/90 text-white"
          >
            {submitting ? (
              <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1" />
            )}
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
