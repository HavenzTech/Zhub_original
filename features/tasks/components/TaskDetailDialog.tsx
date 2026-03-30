"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  CheckCircle,
  Circle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  XCircle,
  FolderOpen,
  Users,
  Tag,
  FileText,
  CalendarClock,
  Edit,
  Trash2,
  Hourglass,
  ShieldCheck,
  Send,
  ThumbsUp,
  ThumbsDown,
  History,
  ChevronDown,
  ChevronUp,
  Loader2,
} from "lucide-react"
import type { TaskDto, TaskRejectionDto, TaskHistoryEntryDto } from "@/types/bms"
import { bmsApi } from "@/lib/services/bmsApi"
import {
  getTaskStatusColor,
  getTaskStatusLabel,
  getTaskPriorityColor,
  getTaskPriorityLabel,
  formatDate,
  isOverdue,
  getRelativeTime,
} from "../utils/taskHelpers"
import { TaskCommentSection } from "./TaskCommentSection"
import { TaskAttachmentSection } from "./TaskAttachmentSection"

interface TaskDetailDialogProps {
  task: TaskDto | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange?: (task: TaskDto, status: string) => void
  onEdit?: (task: TaskDto) => void
  onDelete?: (task: TaskDto) => void
  onSubmitForReview?: (task: TaskDto) => void
  onApprove?: (task: TaskDto) => void
  onReject?: (task: TaskDto, reason: string) => void
  currentUserId?: string
  isProjectLeadOrAdmin?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canChangeStatus?: boolean
}

const STATUS_STEPS = [
  { value: "todo", label: "To Do", icon: Circle, color: "text-stone-400" },
  { value: "in_progress", label: "In Progress", icon: PlayCircle, color: "text-blue-600" },
  { value: "in_review", label: "In Review", icon: PauseCircle, color: "text-purple-600" },
  { value: "completed", label: "Completed", icon: CheckCircle, color: "text-green-600" },
]

export function TaskDetailDialog({
  task,
  open,
  onOpenChange,
  onStatusChange,
  onEdit,
  onDelete,
  onSubmitForReview,
  onApprove,
  onReject,
  currentUserId,
  isProjectLeadOrAdmin = false,
  canEdit = true,
  canDelete = true,
  canChangeStatus = true,
}: TaskDetailDialogProps) {
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectReason, setRejectReason] = useState("")
  const [rejections, setRejections] = useState<TaskRejectionDto[]>([])
  const [rejectionsLoading, setRejectionsLoading] = useState(false)
  const [historyEntries, setHistoryEntries] = useState<TaskHistoryEntryDto[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyPage, setHistoryPage] = useState(1)
  const [historyExpanded, setHistoryExpanded] = useState(false)
  const [rejectionsExpanded, setRejectionsExpanded] = useState(true)

  // Load rejections when dialog opens for review-required tasks
  const loadRejections = useCallback(async () => {
    if (!task?.id || !task.requiresReview) return
    setRejectionsLoading(true)
    try {
      const data = await bmsApi.tasks.getRejections(task.id)
      setRejections(Array.isArray(data) ? data as TaskRejectionDto[] : [])
    } catch {
      setRejections([])
    } finally {
      setRejectionsLoading(false)
    }
  }, [task?.id, task?.requiresReview])

  // Load history on demand
  const loadHistory = useCallback(async (page = 1) => {
    if (!task?.id) return
    setHistoryLoading(true)
    try {
      const result = await bmsApi.tasks.getHistory(task.id, { page, pageSize: 20 }) as {
        data: TaskHistoryEntryDto[]
        total: number
      }
      if (page === 1) {
        setHistoryEntries(result.data || [])
      } else {
        setHistoryEntries((prev) => [...prev, ...(result.data || [])])
      }
      setHistoryTotal(result.total || 0)
      setHistoryPage(page)
    } catch {
      if (page === 1) setHistoryEntries([])
    } finally {
      setHistoryLoading(false)
    }
  }, [task?.id])

  useEffect(() => {
    if (open && task?.requiresReview) {
      loadRejections()
    }
    if (open) {
      // Reset history when dialog opens with a new task
      setHistoryExpanded(false)
      setHistoryEntries([])
      setHistoryPage(1)
      setRejectDialogOpen(false)
      setRejectReason("")
    }
  }, [open, task?.id, task?.status, task?.requiresReview, loadRejections])

  if (!task) return null

  const overdue = isOverdue(task.dueDate, task.status)
  const dueRelative = getRelativeTime(task.dueDate)

  // Review flow permissions
  const isAssignee = (task.assignees || []).some((a) => a.userId === currentUserId)
  const canSubmitForReview = task.requiresReview && task.status === "in_progress" && isAssignee
  const canApproveReject = task.requiresReview && task.status === "in_review" && isProjectLeadOrAdmin

  const handleRejectConfirm = () => {
    if (!rejectReason.trim()) return
    onReject?.(task, rejectReason.trim())
    setRejectDialogOpen(false)
    setRejectReason("")
  }

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "in_progress":
        return <PlayCircle className="w-5 h-5 text-blue-600" />
      case "in_review":
        return <PauseCircle className="w-5 h-5 text-purple-600" />
      case "cancelled":
        return <XCircle className="w-5 h-5 text-red-600" />
      default:
        return <Circle className="w-5 h-5 text-stone-400 dark:text-stone-500" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start gap-3 pr-8">
            <div className="mt-0.5">{getStatusIcon(task.status)}</div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl leading-tight">
                {task.title}
              </DialogTitle>
              <DialogDescription className="sr-only">Task details and actions</DialogDescription>
              {task.taskType && (
                <p className="text-xs text-stone-400 dark:text-stone-500 mt-1 uppercase tracking-wide">
                  {task.taskType}
                </p>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Status & Priority badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge className={getTaskStatusColor(task.status)}>
            {getTaskStatusLabel(task.status)}
          </Badge>
          {task.priority && (
            <Badge className={getTaskPriorityColor(task.priority)}>
              {getTaskPriorityLabel(task.priority)}
            </Badge>
          )}
          {overdue && (
            <Badge className="bg-red-100 text-red-700">
              <AlertCircle className="w-3 h-3 mr-1" />
              Overdue
            </Badge>
          )}
          {task.requiresReview && (
            <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Requires Review
            </Badge>
          )}
        </div>

        {/* Status progress bar — Trello-style */}
        {canChangeStatus && task.status !== "cancelled" && (
          <div className="border border-stone-200 dark:border-stone-700 rounded-lg p-3">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wide">
              Progress
            </p>
            <div className="flex items-center gap-1">
              {STATUS_STEPS.map((step, i) => {
                const currentIndex = STATUS_STEPS.findIndex(
                  (s) => s.value === task.status
                )
                const isActive = step.value === task.status
                const isPast = i <= currentIndex
                const StepIcon = step.icon

                return (
                  <button
                    key={step.value}
                    onClick={() => {
                      if (step.value !== task.status) {
                        // For review-required tasks, block direct status changes to completed/in_review
                        if (task.requiresReview && step.value === "completed") return
                        if (task.requiresReview && step.value === "in_review" && isAssignee) return
                        onStatusChange?.(task, step.value)
                      }
                    }}
                    className={`flex-1 group ${
                      task.requiresReview && (step.value === "completed" || (step.value === "in_review" && isAssignee))
                        ? "cursor-not-allowed opacity-60"
                        : ""
                    }`}
                    title={
                      task.requiresReview && step.value === "completed"
                        ? "Review required before completion"
                        : task.requiresReview && step.value === "in_review" && isAssignee
                        ? "Use 'Submit for Review' button"
                        : `Set to ${step.label}`
                    }
                  >
                    <div
                      className={`h-2 rounded-full transition-colors ${
                        i === 0 ? "rounded-l-full" : ""
                      } ${i === STATUS_STEPS.length - 1 ? "rounded-r-full" : ""} ${
                        isPast
                          ? "bg-accent-cyan"
                          : "bg-stone-200 dark:bg-stone-700 group-hover:bg-accent-cyan/40"
                      }`}
                    />
                    <div className="flex items-center justify-center gap-1 mt-1.5">
                      <StepIcon
                        className={`w-3 h-3 ${
                          isActive
                            ? step.color
                            : "text-stone-300 dark:text-stone-600 group-hover:text-stone-500"
                        }`}
                      />
                      <span
                        className={`text-[10px] ${
                          isActive
                            ? "font-semibold text-stone-900 dark:text-stone-50"
                            : "text-stone-400 dark:text-stone-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Description */}
        {task.description && (
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wide">
              Description
            </p>
            <p className="text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-3">
          {(task.assignees || []).length > 0 && (
            <DetailItem
              icon={User}
              label="Assigned To"
              value={(task.assignees || []).map((a) => a.userName || "Unknown").join(", ")}
            />
          )}
          {task.createdByUserName && (
            <DetailItem
              icon={User}
              label="Created By"
              value={task.createdByUserName}
            />
          )}
          {task.dueDate && (
            <DetailItem
              icon={overdue ? AlertCircle : Calendar}
              label="Due Date"
              value={`${formatDate(task.dueDate)}${dueRelative ? ` (${dueRelative})` : ""}`}
              className={overdue ? "text-red-600" : undefined}
            />
          )}
          {task.startDate && (
            <DetailItem
              icon={CalendarClock}
              label="Start Date"
              value={formatDate(task.startDate)}
            />
          )}
          {task.estimatedHours != null && (
            <DetailItem
              icon={Hourglass}
              label="Estimated"
              value={`${task.estimatedHours}h`}
            />
          )}
          {task.actualHours != null && (
            <DetailItem
              icon={Clock}
              label="Actual"
              value={`${task.actualHours}h`}
            />
          )}
          {task.projectName && (
            <DetailItem
              icon={FolderOpen}
              label="Project"
              value={task.projectName}
            />
          )}
          {task.departmentName && (
            <DetailItem
              icon={Users}
              label="Department"
              value={task.departmentName}
            />
          )}
          {task.propertyName && (
            <DetailItem
              icon={FileText}
              label="Property"
              value={task.propertyName}
            />
          )}
          {task.tags && (
            <DetailItem
              icon={Tag}
              label="Tags"
              value={task.tags}
            />
          )}
          {task.approvedByUserName && (
            <DetailItem
              icon={ShieldCheck}
              label="Approved By"
              value={`${task.approvedByUserName}${task.approvedAt ? ` on ${formatDate(task.approvedAt)}` : ""}`}
            />
          )}
        </div>

        {/* Notes */}
        {task.notes && (
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wide">
              Notes
            </p>
            <div className="bg-stone-50 dark:bg-stone-800/50 rounded-lg p-3 text-sm text-stone-700 dark:text-stone-300 whitespace-pre-wrap">
              {task.notes}
            </div>
          </div>
        )}

        {/* Subtasks info */}
        {(task.subTasksCount ?? 0) > 0 && (
          <div>
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-1.5 uppercase tracking-wide">
              Subtasks
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent-cyan rounded-full transition-all"
                  style={{
                    width: `${
                      task.subTasksCount
                        ? Math.round(
                            ((task.completedSubTasksCount ?? 0) /
                              task.subTasksCount) *
                              100
                          )
                        : 0
                    }%`,
                  }}
                />
              </div>
              <span className="text-xs text-stone-500 dark:text-stone-400">
                {task.completedSubTasksCount ?? 0}/{task.subTasksCount}
              </span>
            </div>
          </div>
        )}

        {/* Timestamps */}
        <div className="border-t border-stone-200 dark:border-stone-700 pt-3 flex flex-wrap gap-x-6 gap-y-1 text-[11px] text-stone-400 dark:text-stone-500">
          {task.createdAt && <span>Created {formatDate(task.createdAt)}</span>}
          {task.updatedAt && <span>Updated {formatDate(task.updatedAt)}</span>}
          {task.completedAt && (
            <span>Completed {formatDate(task.completedAt)}</span>
          )}
        </div>

        {/* Attachments */}
        {task.id && (
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
            <TaskAttachmentSection taskId={task.id} />
          </div>
        )}

        {/* Comments */}
        {task.id && (
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
            <TaskCommentSection taskId={task.id} />
          </div>
        )}

        {/* Review action buttons */}
        {(canSubmitForReview || canApproveReject) && (
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400 mb-2 uppercase tracking-wide">
              Review Actions
            </p>
            <div className="flex items-center gap-2">
              {canSubmitForReview && onSubmitForReview && (
                <Button
                  size="sm"
                  onClick={() => onSubmitForReview(task)}
                  className="bg-accent-cyan hover:bg-accent-cyan/90 text-white text-xs"
                >
                  <Send className="w-3 h-3 mr-1" />
                  Submit for Review
                </Button>
              )}
              {canApproveReject && onApprove && (
                <Button
                  size="sm"
                  onClick={() => onApprove(task)}
                  className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900 text-xs"
                >
                  <ThumbsUp className="w-3 h-3 mr-1" />
                  Approve
                </Button>
              )}
              {canApproveReject && onReject && (
                <Button
                  size="sm"
                  onClick={() => setRejectDialogOpen(true)}
                  className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 text-xs"
                >
                  <ThumbsDown className="w-3 h-3 mr-1" />
                  Reject
                </Button>
              )}
            </div>

            {/* Reject reason dialog (inline) */}
            {rejectDialogOpen && (
              <div className="mt-3 p-3 border border-red-200 dark:border-red-800 rounded-lg bg-red-50/50 dark:bg-red-950/20">
                <p className="text-sm font-medium text-red-700 dark:text-red-400 mb-2">
                  Rejection Reason
                </p>
                <Textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Explain why this task is being rejected..."
                  rows={3}
                  className="mb-2"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={handleRejectConfirm}
                    disabled={!rejectReason.trim()}
                    className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 text-xs"
                  >
                    Confirm Rejection
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setRejectDialogOpen(false)
                      setRejectReason("")
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Rejection History */}
        {task.requiresReview && rejections.length > 0 && (
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
            <button
              onClick={() => setRejectionsExpanded(!rejectionsExpanded)}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide hover:text-stone-700 dark:hover:text-stone-300 w-full"
            >
              <ThumbsDown className="w-3.5 h-3.5" />
              Rejection History ({rejections.length})
              {rejectionsExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 ml-auto" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>
            {rejectionsExpanded && (
              <div className="mt-2 space-y-2">
                {rejectionsLoading ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                  </div>
                ) : (
                  rejections.map((r) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                          {r.rejectedByUserName || "Unknown"}
                        </span>
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">
                          {r.rejectedAt ? formatDate(r.rejectedAt) : ""}
                        </span>
                      </div>
                      <p className="text-sm text-stone-600 dark:text-stone-400">
                        {r.reason}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Task History */}
        {task.id && (
          <div className="border-t border-stone-200 dark:border-stone-700 pt-4">
            <button
              onClick={() => {
                const newExpanded = !historyExpanded
                setHistoryExpanded(newExpanded)
                if (newExpanded && historyEntries.length === 0) {
                  loadHistory(1)
                }
              }}
              className="flex items-center gap-1.5 text-xs font-medium text-stone-500 dark:text-stone-400 uppercase tracking-wide hover:text-stone-700 dark:hover:text-stone-300 w-full"
            >
              <History className="w-3.5 h-3.5" />
              Task History
              {historyExpanded ? (
                <ChevronUp className="w-3.5 h-3.5 ml-auto" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>
            {historyExpanded && (
              <div className="mt-2 space-y-1.5">
                {historyLoading && historyEntries.length === 0 ? (
                  <div className="flex justify-center py-2">
                    <Loader2 className="w-4 h-4 animate-spin text-stone-400" />
                  </div>
                ) : historyEntries.length === 0 ? (
                  <p className="text-xs text-stone-400 dark:text-stone-500 py-1">
                    No history available
                  </p>
                ) : (
                  <>
                    {historyEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-2 py-1.5 text-xs"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 mt-1.5 shrink-0" />
                        <div className="min-w-0">
                          <span className="font-medium text-stone-700 dark:text-stone-300">
                            {entry.changedByUserName || "System"}
                          </span>{" "}
                          <span className="text-stone-500 dark:text-stone-400">
                            changed{" "}
                            <span className="font-medium">{entry.fieldName}</span>
                            {entry.oldValue && (
                              <>
                                {" "}from{" "}
                                <span className="text-stone-600 dark:text-stone-400">
                                  &quot;{entry.oldValue}&quot;
                                </span>
                              </>
                            )}
                            {" "}to{" "}
                            <span className="text-stone-600 dark:text-stone-400">
                              &quot;{entry.newValue}&quot;
                            </span>
                          </span>
                          {entry.changedAt && (
                            <span className="text-stone-400 dark:text-stone-500 ml-1">
                              {formatDate(entry.changedAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                    {historyEntries.length < historyTotal && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadHistory(historyPage + 1)}
                        disabled={historyLoading}
                        className="w-full text-xs"
                      >
                        {historyLoading ? (
                          <Loader2 className="w-3 h-3 animate-spin mr-1" />
                        ) : null}
                        Load More
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action buttons */}
        {(canEdit || canDelete) && (
          <div className="flex items-center gap-2 pt-1">
            {canEdit && onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onEdit(task)
                }}
                className="border-stone-300 dark:border-stone-600"
              >
                <Edit className="w-4 h-4 mr-1.5" />
                Edit Task
              </Button>
            )}
            {canDelete && onDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false)
                  onDelete(task)
                }}
                className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950"
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  className?: string
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-4 h-4 text-stone-400 dark:text-stone-500 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <p className="text-[11px] text-stone-400 dark:text-stone-500">{label}</p>
        <p className={`text-sm text-stone-700 dark:text-stone-300 truncate ${className ?? ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}
