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
import { CurrencyInput } from "@/components/ui/currency-input"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Edit } from "lucide-react"
import dynamic from "next/dynamic"

const MarkdownEditor = dynamic(
  () =>
    import("@/components/ui/markdown-editor").then((m) => m.MarkdownEditor),
  { ssr: false }
)

interface ProjectFormData {
  name: string
  description: string
  status: string
  priority: string
  startDate: string
  endDate: string
  budgetAllocated: string
  budgetSpent: string
  teamLead: string
  projectedDeadline: string
}

interface TeamMember {
  id: string
  name: string
}

interface ProjectFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  formData: ProjectFormData
  setFormData: (data: ProjectFormData) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
  users?: TeamMember[]
}

export function ProjectFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  users = [],
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

            {/* Description - Rich Text Editor */}
            <div className="grid gap-2">
              <Label>Description</Label>
              <MarkdownEditor
                value={formData.description}
                onChange={(md) =>
                  setFormData({ ...formData, description: md })
                }
                placeholder="Write your project description..."
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
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="under-construction">Under Construction</SelectItem>
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
                      priority: value,
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

            {/* Projected Deadline */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-projectedDeadline" : "projectedDeadline"}>
                Projected Deadline
              </Label>
              <Input
                id={isEditMode ? "edit-projectedDeadline" : "projectedDeadline"}
                type="date"
                value={formData.projectedDeadline}
                onChange={(e) =>
                  setFormData({ ...formData, projectedDeadline: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Initial deadline for schedule tracking. Progress is auto-calculated from tasks.
              </p>
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
                <CurrencyInput
                  id={isEditMode ? "edit-budgetAllocated" : "budgetAllocated"}
                  value={formData.budgetAllocated}
                  onChange={(value) =>
                    setFormData({
                      ...formData,
                      budgetAllocated: value.toString(),
                    })
                  }
                  placeholder="0"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor={isEditMode ? "edit-budgetSpent" : "budgetSpent"}
                >
                  Budget Spent (CAD)
                </Label>
                <CurrencyInput
                  id={isEditMode ? "edit-budgetSpent" : "budgetSpent"}
                  value={formData.budgetSpent}
                  onChange={(value) =>
                    setFormData({ ...formData, budgetSpent: value.toString() })
                  }
                  placeholder="0"
                />
              </div>
            </div>

            {/* Team Lead */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-teamLead" : "teamLead"}>
                Team Lead
              </Label>
              {users.length > 0 ? (
                <Select
                  value={formData.teamLead}
                  onValueChange={(value) =>
                    setFormData({ ...formData, teamLead: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team lead" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.name}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={isEditMode ? "edit-teamLead" : "teamLead"}
                  value={formData.teamLead}
                  onChange={(e) =>
                    setFormData({ ...formData, teamLead: e.target.value })
                  }
                  placeholder="Team lead name"
                />
              )}
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
