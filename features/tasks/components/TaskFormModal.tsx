import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Loader2, Edit } from "lucide-react"
import { TASK_STATUS_OPTIONS, TASK_PRIORITY_OPTIONS } from "../utils/taskHelpers"

export interface TaskFormData {
  title: string
  description: string
  status: string
  priority: string
  projectId: string
  departmentId: string
  propertyId: string
  assigneeUserIds: string[]
  dueDate: string
  startDate: string
  estimatedHours: string
  taskType: string
  tags: string
  notes: string
  requiresReview: string
}

interface TaskFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  formData: TaskFormData
  setFormData: (data: TaskFormData) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  projects?: Array<{ id: string; name: string }>
  departments?: Array<{ id: string; name: string }>
  users?: Array<{ id: string; name: string }>
}

export function TaskFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  projects = [],
  departments = [],
  users = [],
}: TaskFormModalProps) {
  const isEditMode = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Task" : "Add New Task"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update task information. Fields marked with * are required."
              : "Create a new task. Fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Title */}
            <div className="grid gap-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="Enter task title"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Task description"
                rows={3}
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TASK_PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Project and Department */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="projectId">Project *</Label>
                <Select
                  value={formData.projectId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, projectId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select a project</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!formData.projectId && (
                  <p className="text-xs text-red-500">Project is required</p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="departmentId">Department</Label>
                <Select
                  value={formData.departmentId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, departmentId: value === "none" ? "" : value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No department</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Requires Review (create mode only) */}
            {!isEditMode && (
              <div className="flex items-center gap-2">
                <Checkbox
                  id="requiresReview"
                  checked={formData.requiresReview === "true"}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, requiresReview: checked ? "true" : "false" })
                  }
                />
                <Label htmlFor="requiresReview" className="text-sm font-normal cursor-pointer">
                  Requires review before completion
                </Label>
              </div>
            )}

            {/* Assignees (multi-select) */}
            <div className="grid gap-2">
              <Label>Assign To</Label>
              <div className="border border-stone-200 dark:border-stone-700 rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                {users.length === 0 ? (
                  <p className="text-xs text-stone-400 px-1">No users available</p>
                ) : (
                  users.map((user) => {
                    const isSelected = formData.assigneeUserIds.includes(user.id)
                    return (
                      <label
                        key={user.id}
                        className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer"
                      >
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            const newIds = checked
                              ? [...formData.assigneeUserIds, user.id]
                              : formData.assigneeUserIds.filter((id) => id !== user.id)
                            setFormData({ ...formData, assigneeUserIds: newIds })
                          }}
                        />
                        <span className="text-sm text-stone-700 dark:text-stone-300">{user.name}</span>
                      </label>
                    )
                  })
                )}
              </div>
              {formData.assigneeUserIds.length > 0 && (
                <p className="text-xs text-stone-500">{formData.assigneeUserIds.length} selected</p>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) =>
                    setFormData({ ...formData, dueDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Estimated Hours and Task Type */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  value={formData.estimatedHours}
                  onChange={(e) =>
                    setFormData({ ...formData, estimatedHours: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.5"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="taskType">Task Type</Label>
                <Input
                  id="taskType"
                  value={formData.taskType}
                  onChange={(e) =>
                    setFormData({ ...formData, taskType: e.target.value })
                  }
                  placeholder="e.g., Bug, Feature, Research"
                />
              </div>
            </div>

            {/* Tags */}
            <div className="grid gap-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                value={formData.tags}
                onChange={(e) =>
                  setFormData({ ...formData, tags: e.target.value })
                }
                placeholder="Comma-separated tags"
              />
            </div>

            {/* Notes */}
            <div className="grid gap-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                placeholder="Additional notes"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEditMode ? (
                    <Edit className="w-4 h-4 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isEditMode ? "Update Task" : "Create Task"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export const initialTaskFormData: TaskFormData = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  projectId: "",
  departmentId: "",
  propertyId: "",
  assigneeUserIds: [],
  dueDate: "",
  startDate: "",
  estimatedHours: "",
  taskType: "",
  tags: "",
  notes: "",
  requiresReview: "false",
}
