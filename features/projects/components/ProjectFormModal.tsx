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
import { Plus, Loader2, Edit } from "lucide-react"
import type { ProjectStatus, ProjectPriority } from "@/types/bms"

interface ProjectFormData {
  name: string
  description: string
  status: ProjectStatus
  priority: ProjectPriority
  progress: number
  startDate: string
  endDate: string
  budgetAllocated: string
  budgetSpent: string
  teamLead: string
}

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  formData: ProjectFormData
  setFormData: (data: ProjectFormData) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function ProjectFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
}: ProjectFormModalProps) {
  const isEditMode = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Project" : "Add New Project"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update project information. Fields marked with * are required."
              : "Create a new project in the system. Fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Project Name */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-name" : "name"}>
                Project Name *
              </Label>
              <Input
                id={isEditMode ? "edit-name" : "name"}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter project name"
                required
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-description" : "description"}>
                Description
              </Label>
              <Textarea
                id={isEditMode ? "edit-description" : "description"}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Project description"
                rows={3}
              />
            </div>

            {/* Status and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-status" : "status"}>
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as ProjectStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-priority" : "priority"}>
                  Priority
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      priority: value as ProjectPriority,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Progress */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-progress" : "progress"}>
                Progress (%)
              </Label>
              <Input
                id={isEditMode ? "edit-progress" : "progress"}
                type="number"
                value={formData.progress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    progress: parseInt(e.target.value) || 0,
                  })
                }
                placeholder="0"
                min="0"
                max="100"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-startDate" : "startDate"}>
                  Start Date
                </Label>
                <Input
                  id={isEditMode ? "edit-startDate" : "startDate"}
                  type="date"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-endDate" : "endDate"}>
                  End Date
                </Label>
                <Input
                  id={isEditMode ? "edit-endDate" : "endDate"}
                  type="date"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor={
                    isEditMode ? "edit-budgetAllocated" : "budgetAllocated"
                  }
                >
                  Budget Allocated (CAD)
                </Label>
                <Input
                  id={isEditMode ? "edit-budgetAllocated" : "budgetAllocated"}
                  type="number"
                  value={formData.budgetAllocated}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      budgetAllocated: e.target.value,
                    })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor={isEditMode ? "edit-budgetSpent" : "budgetSpent"}
                >
                  Budget Spent (CAD)
                </Label>
                <Input
                  id={isEditMode ? "edit-budgetSpent" : "budgetSpent"}
                  type="number"
                  value={formData.budgetSpent}
                  onChange={(e) =>
                    setFormData({ ...formData, budgetSpent: e.target.value })
                  }
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Team Lead */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-teamLead" : "teamLead"}>
                Team Lead
              </Label>
              <Input
                id={isEditMode ? "edit-teamLead" : "teamLead"}
                value={formData.teamLead}
                onChange={(e) =>
                  setFormData({ ...formData, teamLead: e.target.value })
                }
                placeholder="Team lead name"
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
                  {isEditMode ? "Update Project" : "Create Project"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
