import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Loader2, Edit } from "lucide-react"

interface DepartmentFormData {
  name: string
  description: string
  headName: string
  headEmail: string
  headPhone: string
  budgetAllocated: string
  budgetSpent: string
}

interface DepartmentFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  formData: DepartmentFormData
  setFormData: (data: DepartmentFormData) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function DepartmentFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
}: DepartmentFormModalProps) {
  const isEditMode = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Department" : "Add New Department"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update department information. Fields marked with * are required."
              : "Create a new department. Fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Department Name */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-name" : "name"}>
                Department Name *
              </Label>
              <Input
                id={isEditMode ? "edit-name" : "name"}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter department name"
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
                placeholder="Department description"
                rows={3}
              />
            </div>

            {/* Department Head Name */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-headName" : "headName"}>
                Department Head Name
              </Label>
              <Input
                id={isEditMode ? "edit-headName" : "headName"}
                value={formData.headName}
                onChange={(e) =>
                  setFormData({ ...formData, headName: e.target.value })
                }
                placeholder="Full name"
              />
            </div>

            {/* Head Email and Phone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-headEmail" : "headEmail"}>
                  Head Email
                </Label>
                <Input
                  id={isEditMode ? "edit-headEmail" : "headEmail"}
                  type="email"
                  value={formData.headEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, headEmail: e.target.value })
                  }
                  placeholder="email@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-headPhone" : "headPhone"}>
                  Head Phone
                </Label>
                <Input
                  id={isEditMode ? "edit-headPhone" : "headPhone"}
                  value={formData.headPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, headPhone: e.target.value })
                  }
                  placeholder="+1 (555) 123-4567"
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
                  {isEditMode ? "Update Department" : "Create Department"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
