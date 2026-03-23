import { useState, useCallback } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { TaskAttachmentDto, DownloadAttachmentResponse } from "@/types/bms"
import { extractArray } from "@/lib/utils/api"
import { toast } from "sonner"

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

interface UseTaskAttachmentsReturn {
  attachments: TaskAttachmentDto[]
  loading: boolean
  uploading: boolean
  loadAttachments: (taskId: string) => Promise<void>
  uploadFiles: (taskId: string, files: File[]) => Promise<TaskAttachmentDto[]>
  downloadAttachment: (taskId: string, attachmentId: string) => Promise<void>
  deleteAttachment: (taskId: string, attachmentId: string) => Promise<boolean>
}

export function useTaskAttachments(): UseTaskAttachmentsReturn {
  const [attachments, setAttachments] = useState<TaskAttachmentDto[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadAttachments = useCallback(async (taskId: string) => {
    try {
      setLoading(true)
      const data = await bmsApi.taskAttachments.getAll(taskId)
      setAttachments(extractArray<TaskAttachmentDto>(data))
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load attachments")
      toast.error("Failed to load attachments", { description: error.message })
    } finally {
      setLoading(false)
    }
  }, [])

  const uploadFiles = useCallback(
    async (taskId: string, files: File[]): Promise<TaskAttachmentDto[]> => {
      // Validate file sizes
      const oversized = files.filter((f) => f.size > MAX_FILE_SIZE)
      if (oversized.length > 0) {
        toast.error(`${oversized.length} file(s) exceed the 10 MB limit`)
        return []
      }

      try {
        setUploading(true)
        const result = await bmsApi.taskAttachments.upload(taskId, files)
        const newAttachments = extractArray<TaskAttachmentDto>(result)
        setAttachments((prev) => [...newAttachments, ...prev])
        toast.success(`${newAttachments.length} file(s) uploaded`)
        return newAttachments
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to upload files")
        toast.error("Failed to upload files", { description: error.message })
        return []
      } finally {
        setUploading(false)
      }
    },
    []
  )

  const downloadAttachment = useCallback(
    async (taskId: string, attachmentId: string) => {
      try {
        const response = (await bmsApi.taskAttachments.getDownloadUrl(
          taskId,
          attachmentId
        )) as DownloadAttachmentResponse

        if (response.downloadUrl) {
          window.open(response.downloadUrl, "_blank")
        } else {
          toast.error("Download URL not available")
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to get download link")
        toast.error("Failed to download file", { description: error.message })
      }
    },
    []
  )

  const deleteAttachment = useCallback(
    async (taskId: string, attachmentId: string): Promise<boolean> => {
      try {
        await bmsApi.taskAttachments.delete(taskId, attachmentId)
        setAttachments((prev) => prev.filter((a) => a.id !== attachmentId))
        toast.success("Attachment deleted")
        return true
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Failed to delete attachment")
        toast.error("Failed to delete attachment", { description: error.message })
        return false
      }
    },
    []
  )

  return {
    attachments,
    loading,
    uploading,
    loadAttachments,
    uploadFiles,
    downloadAttachment,
    deleteAttachment,
  }
}
