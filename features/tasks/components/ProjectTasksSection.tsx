"use client"

import { useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TaskList } from "./TaskList"
import { initialTaskFormData, type TaskFormData } from "./TaskFormModal"
import { bmsApi } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { useTasks } from "@/lib/hooks/useTasks"
import { extractArray } from "@/lib/utils/api"
import type { TaskDto, Department, UserResponse } from "@/types/bms"
import { toast } from "sonner"
import { Plus, RefreshCw, CheckSquare, Loader2 } from "lucide-react"
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
  const {
    tasks,
    loading,
    loadProjectTasks,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
  } = useTasks()

  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<TaskFormData>({
    ...initialTaskFormData,
    projectId,
  })
  const [editingTask, setEditingTask] = useState<TaskDto | null>(null)
  const [deleteTaskItem, setDeleteTaskItem] = useState<TaskDto | null>(null)

  // Data for dropdowns
  const [departments, setDepartments] = useState<Department[]>([])
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Check user permissions based on new role hierarchy
  // Employees can only view tasks and update status on assigned tasks
  // dept_manager, project_lead, admin, super_admin can create/edit/delete
  const canCreate = authService.canCreateTasks()
  const canEdit = authService.hasManagementRole() // Full edit requires management role
  const canDelete = authService.canDeleteTasks()
  // All users can change status (employees limited to assigned tasks at API level)
  const canChangeStatus = true

  // Load data
  const loadData = useCallback(async () => {
    setLoadingData(true)
    try {
      await loadProjectTasks(projectId)
      const [departmentsData, usersData] = await Promise.all([
        bmsApi.departments.getAll(),
        bmsApi.users.getAll(),
      ])
      setDepartments(extractArray<Department>(departmentsData))
      setUsers(extractArray<UserResponse>(usersData))
    } catch (err) {
      console.error("Error loading data:", err)
    } finally {
      setLoadingData(false)
    }
  }, [projectId, loadProjectTasks])

  useEffect(() => {
    loadData()
  }, [loadData])

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
    if (formData.assignedToUserId?.trim()) payload.assignedToUserId = formData.assignedToUserId
    if (formData.dueDate?.trim()) payload.dueDate = formData.dueDate
    if (formData.startDate?.trim()) payload.startDate = formData.startDate
    if (formData.estimatedHours && !isNaN(parseFloat(formData.estimatedHours))) {
      payload.estimatedHours = parseFloat(formData.estimatedHours)
    }
    if (formData.taskType?.trim()) payload.taskType = formData.taskType.trim()
    if (formData.tags?.trim()) payload.tags = formData.tags.trim()
    if (formData.notes?.trim()) payload.notes = formData.notes.trim()

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
      assignedToUserId: task.assignedToUserId || "",
      dueDate: formatDateForInput(task.dueDate),
      startDate: formatDateForInput(task.startDate),
      estimatedHours: task.estimatedHours?.toString() || "",
      taskType: task.taskType || "",
      tags: task.tags || "",
      notes: task.notes || "",
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
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-3">
          <CheckSquare className="w-5 h-5 text-gray-500" />
          <CardTitle className="text-lg font-medium">Tasks</CardTitle>
          {totalCount > 0 && (
            <Badge variant="secondary">
              {completedCount}/{totalCount} ({progressPercent}%)
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={loadData} disabled={loadingData}>
            <RefreshCw className={`w-4 h-4 ${loadingData ? "animate-spin" : ""}`} />
          </Button>
          {canCreate && (
            <Button size="sm" onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-1" />
              Add Task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loadingData && tasks.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <TaskList
            tasks={tasks}
            loading={loading}
            onStatusChange={handleStatusChange}
            onEdit={canEdit ? handleEdit : undefined}
            onDelete={canDelete ? handleDeleteClick : undefined}
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
      </CardContent>
    </Card>
  )
}
