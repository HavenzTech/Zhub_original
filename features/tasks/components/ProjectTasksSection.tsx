"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
// Card replaced with plain divs for consistent styling
import { Button } from "@/components/ui/button"
// Badge removed — using plain text for counts
import { TaskList } from "./TaskList"
import { initialTaskFormData, type TaskFormData } from "./TaskFormModal"
import { bmsApi } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { useProjectTasksQuery, useTasksQueryCompat } from "@/lib/hooks/queries/useTasksQuery"
import { useDepartmentsQuery } from "@/lib/hooks/queries/useDepartmentsQuery"
import { useUsersQuery } from "@/lib/hooks/queries/useUsersQuery"
import { useProjectMembersQuery } from "@/lib/hooks/queries/useProjectsQuery"
import { extractArray } from "@/lib/utils/api"
import type { TaskDto, Department, UserResponse, ProjectMemberDto } from "@/types/bms"
import { toast } from "sonner"
import { Plus, RefreshCw, CheckSquare, Loader2 } from "lucide-react"
import { TaskDetailDialog } from "./TaskDetailDialog"
import { formatDateForInput } from "../utils/taskHelpers"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const TaskFormModal = dynamic(
  () =>
    import("./TaskFormModal").then((mod) => ({
      default: mod.TaskFormModal,
    })),
  { ssr: false }
)

interface ProjectTasksSectionProps {
  projectId: string
  projectName: string
}

export function ProjectTasksSection({
  projectId,
  projectName,
}: ProjectTasksSectionProps) {
  const projectTasksQuery = useProjectTasksQuery(projectId)
  const tasks = projectTasksQuery.data ?? []
  const loading = projectTasksQuery.isLoading
  const loadProjectTasks = async (_projectId: string) => { await projectTasksQuery.refetch() }

  const {
    createTask,
    updateTask,
    updateTaskStatus,
    toggleComplete,
    deleteTask,
    submitForReview,
    approveTask,
    rejectTask,
  } = useTasksQueryCompat()

  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    ...initialTaskFormData,
    projectId,
  })
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null)
  const [deleteTaskItem, setDeleteTaskItem] = useState<TaskDto | null>(null)
  const [viewingTask, setViewingTask] = useState<TaskDto | null>(null)

  // Data for dropdowns — served by React Query
  const { data: departments = [] } = useDepartmentsQuery()
  const { data: usersData = [] } = useUsersQuery()
  const users = usersData as UserResponse[]
  const { data: membersData } = useProjectMembersQuery(projectId)
  const [loadingData, setLoadingData] = useState(false)

  // Current user info for review permissions
  const auth = authService.getAuth()
  const currentUserId = auth?.userId || ""
  const [isProjectLeadOrAdmin, setIsProjectLeadOrAdmin] = useState(false)

  // Check user permissions based on new role hierarchy
  // Employees can only view tasks and update status on assigned tasks
  // dept_manager, project_lead, admin, super_admin can create/edit/delete
  const canCreate = authService.canCreateTasks()
  const canEdit = authService.hasManagementRole() // Full edit requires management role
  const canDelete = authService.canDeleteTasks()
  // All users can change status (employees limited to assigned tasks at API level)
  const canChangeStatus = true

  // Check project lead status from cached members data
  useEffect(() => {
    if (authService.isAdmin()) {
      setIsProjectLeadOrAdmin(true)
    } else if (membersData) {
      const members = extractArray<ProjectMemberDto>(membersData)
      const currentMember = members.find((m) => m.userId === currentUserId)
      setIsProjectLeadOrAdmin(currentMember?.role === "lead")
    }
  }, [membersData, currentUserId])

  // All data auto-fetched by React Query

  // Build payload
  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
      status: formData.status,
      priority: formData.priority || null,
      projectId, // Always set to current project
    }

    if (formData.description?.trim()) payload.description = formData.description.trim()
    if (formData.departmentId?.trim()) payload.departmentId = formData.departmentId
    if (formData.assigneeUserIds?.length > 0) payload.assigneeUserIds = formData.assigneeUserIds
    if (formData.dueDate?.trim()) payload.dueDate = formData.dueDate
    if (formData.startDate?.trim()) payload.startDate = formData.startDate
    if (formData.estimatedHours && !isNaN(parseFloat(formData.estimatedHours))) {
      payload.estimatedHours = parseFloat(formData.estimatedHours)
    }
    if (formData.taskType?.trim()) payload.taskType = formData.taskType.trim()
    if (formData.tags?.trim()) payload.tags = formData.tags.trim()
    if (formData.notes?.trim()) payload.notes = formData.notes.trim()
    if (formData.requiresReview === "true") payload.requiresReview = true

    return payload
  }

  // Handlers
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = buildPayload()
      await createTask(payload as any)
      setShowAddForm(false)
      setFormData({ ...initialTaskFormData, projectId })
    } catch (err) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (task: TaskDto) => {
    setEditingTask(task)
    setFormData({
      title: task.title || "",
      description: task.description || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      projectId: task.projectId || projectId,
      departmentId: task.departmentId || "",
      propertyId: task.propertyId || "",
      assigneeUserIds: (task.assignees || []).map((a) => a.userId),
      dueDate: formatDateForInput(task.dueDate),
      startDate: formatDateForInput(task.startDate),
      estimatedHours: task.estimatedHours?.toString() || "",
      taskType: task.taskType || "",
      tags: task.tags || "",
      notes: task.notes || "",
      requiresReview: task.requiresReview ? "true" : "false",
    })
    setShowEditForm(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTask?.id || !formData.title.trim()) {
      toast.error("Task title is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        id: editingTask.id,
        ...buildPayload(),
      }
      await updateTask(editingTask.id, payload as any)
      setShowEditForm(false)
      setEditingTask(null)
      setFormData({ ...initialTaskFormData, projectId })
    } catch (err) {
      // Error handled in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStatusChange = async (task: TaskDto, status: string) => {
    if (!task.id) return
    await updateTaskStatus(task.id, status)
    // Update the viewing task so the detail dialog reflects the change immediately
    if (viewingTask?.id === task.id) {
      setViewingTask({ ...task, status })
    }
  }

  const handleToggleComplete = async (task: TaskDto) => {
    if (!task.id) return
    const updated = await toggleComplete(task.id)
    if (updated && viewingTask?.id === task.id) {
      setViewingTask({ ...task, ...updated })
    }
  }

  const handleSubmitForReview = async (task: TaskDto) => {
    if (!task.id) return
    const updated = await submitForReview(task.id)
    if (updated && viewingTask?.id === task.id) {
      setViewingTask({ ...task, ...updated })
    }
  }

  const handleApprove = async (task: TaskDto) => {
    if (!task.id) return
    const updated = await approveTask(task.id)
    if (updated && viewingTask?.id === task.id) {
      setViewingTask({ ...task, ...updated })
    }
  }

  const handleReject = async (task: TaskDto, reason: string) => {
    if (!task.id) return
    const updated = await rejectTask(task.id, reason)
    if (updated && viewingTask?.id === task.id) {
      setViewingTask({ ...task, ...updated })
    }
  }

  const handleDeleteClick = (task: TaskDto) => {
    setDeleteTaskItem(task)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTaskItem?.id) return
    await deleteTask(deleteTaskItem.id)
    setDeleteTaskItem(null)
  }

  // Task stats
  const completedCount = tasks.filter((t) => t.status === "completed").length
  const totalCount = tasks.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50">Tasks</h3>
          {totalCount > 0 && (
            <span className="text-xs text-stone-500 dark:text-stone-400">
              {completedCount}/{totalCount} ({progressPercent}%)
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => projectTasksQuery.refetch()} disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setShowAddForm(true)} className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          )}
        </div>
      </div>
      <div className="p-5">
        {loadingData && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-stone-400 dark:text-stone-500" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            loading={loading}
            onStatusChange={handleStatusChange}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? handleDeleteClick : undefined}
            onClick={(task) => setViewingTask(task)}
            onToggleComplete={handleToggleComplete}
            showProject={false}
            canEdit={canEdit}
            canDelete={canDelete}
            canChangeStatus={canChangeStatus}
            emptyMessage={`No tasks for ${projectName}`}
          />
        )}

        {/* Add Task Modal */}
        <TaskFormModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleCreate}
          projects={[{ id: projectId, name: projectName }]}
          departments={departments.map((d) => ({ id: d.id!, name: d.name }))}
          users={users.map((u) => ({ id: u.id!, name: u.name || u.email || "" }))}
        />

        {/* Edit Task Modal */}
        <TaskFormModal
          open={showEditForm}
          onOpenChange={(open) => {
            setShowEditForm(open)
            if (!open) {
              setEditingTask(null)
              setFormData({ ...initialTaskFormData, projectId })
            }
          }}
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleUpdate}
          projects={[{ id: projectId, name: projectName }]}
          departments={departments.map((d) => ({ id: d.id!, name: d.name }))}
          users={users.map((u) => ({ id: u.id!, name: u.name || u.email || "" }))}
        />

        {/* Task Detail Dialog */}
        <TaskDetailDialog
          task={viewingTask}
          open={!!viewingTask}
          onOpenChange={(open) => !open && setViewingTask(null)}
          onStatusChange={handleStatusChange}
          onEdit={canEdit ? handleEdit : undefined}
          onDelete={canDelete ? handleDeleteClick : undefined}
          canEdit={canEdit}
          canDelete={canDelete}
          canChangeStatus={canChangeStatus}
          onSubmitForReview={handleSubmitForReview}
          onApprove={handleApprove}
          onReject={handleReject}
          currentUserId={currentUserId}
          isProjectLeadOrAdmin={isProjectLeadOrAdmin}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteTaskItem}
          onOpenChange={(open) => !open && setDeleteTaskItem(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Task</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteTaskItem?.title}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteTaskItem(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="!bg-red-600 hover:!bg-red-700 !text-white focus:ring-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
