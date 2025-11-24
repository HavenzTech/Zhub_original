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
import { Plus, Loader2, Edit } from "lucide-react"
import type { CompanyStatus } from "@/types/bms"

interface CompanyFormData {
  name: string
  industry: string
  status: CompanyStatus
  locationAddress: string
  locationCity: string
  locationProvince: string
  locationCountry: string
  locationPostalCode: string
  contactEmail: string
  contactPhone: string
  annualRevenue: string
  logoUrl: string
}

interface CompanyFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "add" | "edit"
  formData: CompanyFormData
  setFormData: (data: CompanyFormData) => void
  isSubmitting: boolean
  onSubmit: (e: React.FormEvent) => void
}

export function CompanyFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
}: CompanyFormModalProps) {
  const isEditMode = mode === "edit"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Company" : "Add New Company"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update company information. Fields marked with * are required."
              : "Create a new company in the system. Fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-name" : "name"}>
                Company Name *
              </Label>
              <Input
                id={isEditMode ? "edit-name" : "name"}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter company name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-industry" : "industry"}>
                  Industry
                </Label>
                <Input
                  id={isEditMode ? "edit-industry" : "industry"}
                  value={formData.industry}
                  onChange={(e) =>
                    setFormData({ ...formData, industry: e.target.value })
                  }
                  placeholder="e.g., Technology, Healthcare"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor={isEditMode ? "edit-status" : "status"}>
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      status: value as CompanyStatus,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor={isEditMode ? "edit-contactEmail" : "contactEmail"}
                >
                  Contact Email
                </Label>
                <Input
                  id={isEditMode ? "edit-contactEmail" : "contactEmail"}
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactEmail: e.target.value,
                    })
                  }
                  placeholder="company@example.com"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor={isEditMode ? "edit-contactPhone" : "contactPhone"}
                >
                  Contact Phone
                </Label>
                <Input
                  id={isEditMode ? "edit-contactPhone" : "contactPhone"}
                  value={formData.contactPhone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      contactPhone: e.target.value,
                    })
                  }
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Location */}
            <div className="grid gap-2">
              <Label
                htmlFor={
                  isEditMode ? "edit-locationAddress" : "locationAddress"
                }
              >
                Address
              </Label>
              <Input
                id={isEditMode ? "edit-locationAddress" : "locationAddress"}
                value={formData.locationAddress}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    locationAddress: e.target.value,
                  })
                }
                placeholder="Street address"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor={isEditMode ? "edit-locationCity" : "locationCity"}
                >
                  City
                </Label>
                <Input
                  id={isEditMode ? "edit-locationCity" : "locationCity"}
                  value={formData.locationCity}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationCity: e.target.value,
                    })
                  }
                  placeholder="City"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor={
                    isEditMode ? "edit-locationProvince" : "locationProvince"
                  }
                >
                  Province/State
                </Label>
                <Input
                  id={isEditMode ? "edit-locationProvince" : "locationProvince"}
                  value={formData.locationProvince}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationProvince: e.target.value,
                    })
                  }
                  placeholder="Province or State"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label
                  htmlFor={
                    isEditMode ? "edit-locationCountry" : "locationCountry"
                  }
                >
                  Country
                </Label>
                <Input
                  id={isEditMode ? "edit-locationCountry" : "locationCountry"}
                  value={formData.locationCountry}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationCountry: e.target.value,
                    })
                  }
                  placeholder="Country"
                />
              </div>

              <div className="grid gap-2">
                <Label
                  htmlFor={
                    isEditMode
                      ? "edit-locationPostalCode"
                      : "locationPostalCode"
                  }
                >
                  Postal Code
                </Label>
                <Input
                  id={
                    isEditMode
                      ? "edit-locationPostalCode"
                      : "locationPostalCode"
                  }
                  value={formData.locationPostalCode}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      locationPostalCode: e.target.value,
                    })
                  }
                  placeholder="Postal Code"
                />
              </div>
            </div>

            {/* Financial */}
            <div className="grid gap-2">
              <Label
                htmlFor={isEditMode ? "edit-annualRevenue" : "annualRevenue"}
              >
                Annual Revenue (CAD)
              </Label>
              <Input
                id={isEditMode ? "edit-annualRevenue" : "annualRevenue"}
                type="number"
                value={formData.annualRevenue}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    annualRevenue: e.target.value,
                  })
                }
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={isEditMode ? "edit-logoUrl" : "logoUrl"}>
                Logo URL
              </Label>
              <Input
                id={isEditMode ? "edit-logoUrl" : "logoUrl"}
                type="url"
                value={formData.logoUrl}
                onChange={(e) =>
                  setFormData({ ...formData, logoUrl: e.target.value })
                }
                placeholder="https://example.com/logo.png"
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
                  {isEditMode ? "Update Company" : "Create Company"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
