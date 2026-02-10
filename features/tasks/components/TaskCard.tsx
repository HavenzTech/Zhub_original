// Card replaced with plain divs for consistent styling
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CheckCircle,
  Circle,
  Clock,
  MoreVertical,
  User,
  Calendar,
  AlertCircle,
  Trash2,
  Edit,
  PlayCircle,
  PauseCircle,
  XCircle,
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

interface TaskCardProps {
  task: TaskDto
  onStatusChange?: (task: TaskDto, status: string) => void
  onEdit?: (task: TaskDto) => void
  onDelete?: (task: TaskDto) => void
  onClick?: (task: TaskDto) => void
  showProject?: boolean
  canEdit?: boolean
  canDelete?: boolean
  canChangeStatus?: boolean
}

export function TaskCard({
  task,
  onStatusChange,
  onEdit,
  onDelete,
  onClick,
  showProject = true,
  canEdit = true,
  canDelete = true,
  canChangeStatus = true,
}: TaskCardProps) {
  const overdue = isOverdue(task.dueDate, task.status)
  const dueRelative = getRelativeTime(task.dueDate)

  const getStatusIcon = (status?: string | null) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "in_progress":
        return <PlayCircle className="w-4 h-4 text-blue-600" />
      case "in_review":
        return <PauseCircle className="w-4 h-4 text-purple-600" />
      case "cancelled":
        return <XCircle className="w-4 h-4 text-red-600" />
      default:
        return <Circle className="w-4 h-4 text-stone-400 dark:text-stone-500" />
    }
  }

  return (
    <div
      className={`bg-white dark:bg-stone-900 rounded-xl border hover:shadow-md transition-shadow ${onClick ? "cursor-pointer" : ""} ${
        overdue ? "border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20" : "border-stone-200 dark:border-stone-700"
      }`}
      onClick={() => onClick?.(task)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="mt-0.5">{getStatusIcon(task.status)}</div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-stone-900 dark:text-stone-50 truncate">{task.title}</h3>
              {task.description && (
                <p className="text-sm text-stone-600 dark:text-stone-400 line-clamp-2 mt-1">
                  {task.description}
                </p>
              )}

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <Badge className={getTaskStatusColor(task.status)}>
                  {getTaskStatusLabel(task.status)}
                </Badge>
                {task.priority && (
                  <Badge className={getTaskPriorityColor(task.priority)}>
                    {getTaskPriorityLabel(task.priority)}
                  </Badge>
                )}
              </div>

              {/* Additional details */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-stone-500 dark:text-stone-400">
                {task.assignedToUserName && (
                  <div className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    <span>{task.assignedToUserName}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div
                    className={`flex items-center gap-1 ${
                      overdue ? "text-red-600 font-medium" : ""
                    }`}
                  >
                    {overdue ? (
                      <AlertCircle className="w-3 h-3" />
                    ) : (
                      <Calendar className="w-3 h-3" />
                    )}
                    <span>
                      {formatDate(task.dueDate)}
                      {dueRelative && ` (${dueRelative})`}
                    </span>
                  </div>
                )}
                {task.estimatedHours && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{task.estimatedHours}h est.</span>
                  </div>
                )}
              </div>

              {/* Project/Department info */}
              {(showProject && task.projectName) || task.departmentName ? (
                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-stone-400 dark:text-stone-500">
                  {showProject && task.projectName && (
                    <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-400">
                      {task.projectName}
                    </span>
                  )}
                  {task.departmentName && (
                    <span className="bg-stone-100 dark:bg-stone-800 px-2 py-0.5 rounded text-stone-600 dark:text-stone-400">
                      {task.departmentName}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Actions dropdown */}
          {(canChangeStatus || canEdit || canDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                {canChangeStatus && (
                  <>
                    <DropdownMenuItem
                      onClick={() => onStatusChange?.(task, "todo")}
                      disabled={task.status === "todo"}
                    >
                      <Circle className="w-4 h-4 mr-2" />
                      Mark as To Do
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange?.(task, "in_progress")}
                      disabled={task.status === "in_progress"}
                    >
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Mark In Progress
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange?.(task, "in_review")}
                      disabled={task.status === "in_review"}
                    >
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Mark In Review
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onStatusChange?.(task, "completed")}
                      disabled={task.status === "completed"}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Completed
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {canEdit && (
                  <DropdownMenuItem onClick={() => onEdit?.(task)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Task
                  </DropdownMenuItem>
                )}
                {canDelete && (
                  <DropdownMenuItem
                    onClick={() => onDelete?.(task)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Task
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  )
}
