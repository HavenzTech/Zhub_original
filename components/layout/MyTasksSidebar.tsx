"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  CheckSquare,
  Calendar,
  PanelRightClose,
  PanelRightOpen,
  Building2,
  FolderOpen,
  Users,
  Home,
  AlertCircle,
  Eye,
  Loader2,
  RefreshCw,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { bmsApi } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { extractArray } from "@/lib/utils/api"
import type { TaskDto } from "@/types/bms"
import {
  getTaskStatusColor,
  getTaskStatusLabel,
  getTaskPriorityColor,
  formatDate,
  isOverdue,
  getRelativeTime,
} from "@/features/tasks/utils/taskHelpers"

export function MyTasksSidebar() {
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(true)
  const [tasks, setTasks] = useState<TaskDto[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadMyTasks = useCallback(async () => {
    const token = authService.getToken()
    const companyId = authService.getCurrentCompanyId()

    if (!token || !companyId) return

    setLoading(true)
    setError(null)

    try {
      bmsApi.setToken(token)
      bmsApi.setCompanyId(companyId)
      const data = await bmsApi.tasks.getMyTasks()
      setTasks(extractArray<TaskDto>(data))
    } catch (err) {
      console.error("Error loading tasks:", err)
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only load when panel is expanded
    if (!collapsed) {
      loadMyTasks()
    }
  }, [collapsed, loadMyTasks])

  // Get linked entity icon
  const getLinkedIcon = (task: TaskDto) => {
    if (task.projectName) return <FolderOpen className="w-3 h-3 text-green-600" />
    if (task.departmentName) return <Users className="w-3 h-3 text-purple-600" />
    if (task.propertyName) return <Home className="w-3 h-3 text-orange-600" />
    return <Building2 className="w-3 h-3 text-blue-600" />
  }

  // Get linked entity text
  const getLinkedText = (task: TaskDto) => {
    if (task.projectName) return `Project: ${task.projectName}`
    if (task.departmentName) return `Dept: ${task.departmentName}`
    if (task.propertyName) return `Property: ${task.propertyName}`
    return null
  }

  // Filter to show only active tasks (not completed/cancelled)
  const activeTasks = tasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  )

  return (
    <div
      className={`${
        collapsed ? "w-12" : "w-80"
      } bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className={`${collapsed ? "hidden" : "block"}`}>
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <CheckSquare className="w-5 h-5" />
              My Tasks
              {activeTasks.length > 0 && (
                <Badge variant="secondary" className="ml-1">
                  {activeTasks.length}
                </Badge>
              )}
            </h3>
            <p className="text-xs text-gray-500 mt-1">
              Tasks assigned to you
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            {collapsed ? (
              <PanelRightOpen className="w-4 h-4" />
            ) : (
              <PanelRightClose className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Tasks List */}
      <div
        className={`flex-1 overflow-auto ${collapsed ? "hidden" : "p-4"}`}
      >
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-2">{error}</p>
            <Button variant="ghost" size="sm" onClick={loadMyTasks}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Retry
            </Button>
          </div>
        ) : activeTasks.length === 0 ? (
          <div className="text-center py-8">
            <CheckSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No tasks assigned to you</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeTasks.map((task) => {
              const overdue = isOverdue(task.dueDate, task.status)
              const dueRelative = getRelativeTime(task.dueDate)
              const linkedText = getLinkedText(task)

              return (
                <div
                  key={task.id}
                  className={`p-3 bg-gray-50 rounded-lg border ${
                    overdue ? "border-red-200 bg-red-50/50" : "border-gray-200"
                  }`}
                >
                  {/* Title and Priority */}
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {task.title}
                    </h4>
                    <Badge
                      className={`${getTaskPriorityColor(task.priority)} text-xs ml-2 flex-shrink-0`}
                    >
                      {task.priority}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="mb-2">
                    <Badge className={`${getTaskStatusColor(task.status)} text-xs`}>
                      {getTaskStatusLabel(task.status)}
                    </Badge>
                  </div>

                  {/* Linked Entity */}
                  {linkedText && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                        {getLinkedIcon(task)}
                      </div>
                      <span className="text-xs text-gray-600 truncate">
                        {linkedText}
                      </span>
                    </div>
                  )}

                  {/* Due Date */}
                  {task.dueDate && (
                    <div
                      className={`flex items-center gap-2 text-xs ${
                        overdue ? "text-red-600 font-medium" : "text-gray-500"
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
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div
        className={`${collapsed ? "hidden" : "p-4"} border-t border-gray-200`}
      >
        <Button
          variant="outline"
          className="w-full"
          size="sm"
          onClick={() => router.push("/projects")}
        >
          <Eye className="w-4 h-4 mr-2" />
          View All in Projects
        </Button>
      </div>
    </div>
  )
}
