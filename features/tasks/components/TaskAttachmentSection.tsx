"use client"

import { useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Paperclip,
  Upload,
  Download,
  Trash2,
  FileText,
  Image,
  FileSpreadsheet,
  FileCode,
  File,
  Loader2,
} from "lucide-react"
import { useTaskAttachments } from "@/lib/hooks/useTaskAttachments"
import { authService } from "@/lib/services/auth"
import type { TaskAttachmentDto } from "@/types/bms"

interface TaskAttachmentSectionProps {
  taskId: string
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return "0 B"
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(mimeType?: string | null, fileType?: string | null) {
  const type = mimeType || ""
  const ext = fileType?.toLowerCase() || ""

  if (type.startsWith("image/") || ["png", "jpg", "jpeg", "gif", "webp", "svg"].includes(ext))
    return <Image className="w-4 h-4 text-violet-500" />
  if (type.includes("spreadsheet") || ["xlsx", "xls", "csv"].includes(ext))
    return <FileSpreadsheet className="w-4 h-4 text-green-500" />
  if (type.includes("pdf") || ext === "pdf")
    return <FileText className="w-4 h-4 text-red-500" />
  if (["js", "ts", "py", "json", "html", "css", "xml"].includes(ext))
    return <FileCode className="w-4 h-4 text-amber-500" />
  return <File className="w-4 h-4 text-stone-400" />
}

function formatAttachmentTime(dateStr?: string): string {
  if (!dateStr) return ""
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
}

export function TaskAttachmentSection({ taskId }: TaskAttachmentSectionProps) {
  const {
    attachments,
    loading,
    uploading,
    loadAttachments,
    uploadFiles,
    downloadAttachment,
    deleteAttachment,
  } = useTaskAttachments()

  const fileInputRef = useRef<HTMLInputElement>(null)
  const auth = authService.getAuth()
  const currentUserId = auth?.userId ?? undefined
  const isAdmin = authService.isAdmin()

  useEffect(() => {
    loadAttachments(taskId)
  }, [taskId, loadAttachments])

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (!files || files.length === 0) return
      await uploadFiles(taskId, Array.from(files))
      // Reset input so same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = ""
    },
    [taskId, uploadFiles]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        await uploadFiles(taskId, files)
      }
    },
    [taskId, uploadFiles]
  )

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const canDelete = (attachment: TaskAttachmentDto) =>
    isAdmin || attachment.uploadedByUserId === currentUserId

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-stone-400" />
          <h3 className="text-sm font-medium text-stone-900 dark:text-stone-100">
            Attachments
            {attachments.length > 0 && (
              <span className="ml-1.5 text-stone-400 font-normal">
                ({attachments.length})
              </span>
            )}
          </h3>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="h-7 text-xs text-stone-400 hover:text-accent-cyan"
        >
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
          ) : (
            <Upload className="w-3.5 h-3.5 mr-1" />
          )}
          Upload
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drop zone (only shows when no attachments) */}
      {attachments.length === 0 && !loading && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className="border-2 border-dashed border-stone-200 dark:border-stone-700 rounded-lg p-6 text-center hover:border-accent-cyan/50 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-6 h-6 text-stone-300 dark:text-stone-600 mx-auto mb-2" />
          <p className="text-sm text-stone-400 dark:text-stone-500">
            Drop files here or click to upload
          </p>
          <p className="text-xs text-stone-300 dark:text-stone-600 mt-1">
            Max 10 MB per file
          </p>
        </div>
      )}

      {/* Loading */}
      {loading && attachments.length === 0 && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
        </div>
      )}

      {/* Attachment list */}
      {attachments.length > 0 && (
        <div
          className="space-y-1"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
            >
              {getFileIcon(attachment.mimeType, attachment.fileType)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-stone-700 dark:text-stone-300 truncate">
                  {attachment.fileName}
                </p>
                <p className="text-xs text-stone-400 dark:text-stone-500">
                  {formatFileSize(attachment.fileSizeBytes)}
                  {attachment.uploadedByUserName && (
                    <> &middot; {attachment.uploadedByUserName}</>
                  )}
                  {attachment.createdAt && (
                    <> &middot; {formatAttachmentTime(attachment.createdAt)}</>
                  )}
                </p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    attachment.id && downloadAttachment(taskId, attachment.id)
                  }
                  className="h-7 w-7 p-0 text-stone-400 hover:text-accent-cyan"
                  title="Download"
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
                {canDelete(attachment) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      attachment.id && deleteAttachment(taskId, attachment.id)
                    }
                    className="h-7 w-7 p-0 text-stone-400 hover:text-red-500"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
