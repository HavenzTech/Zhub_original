"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
} from "lucide-react"
import type { TaskDto } from "@/types/bms"
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
  canEdit = true,
  canDelete = true,
  canChangeStatus = true,
}: TaskDetailDialogProps) {
  if (!task) return null

  const overdue = isOverdue(task.dueDate, task.status)
  const dueRelative = getRelativeTime(task.dueDate)

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
                        onStatusChange?.(task, step.value)
                      }
                    }}
                    className="flex-1 group"
                    title={`Set to ${step.label}`}
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
          {task.assignedToUserName && (
            <DetailItem
              icon={User}
              label="Assigned To"
              value={task.assignedToUserName}
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
