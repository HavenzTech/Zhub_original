import { useState, useRef } from "react"
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
import { Plus, Loader2, Edit, Upload, X, ImageIcon } from "lucide-react"

export interface CompanyFormData {
  name: string
  industry: string
  status: string
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
  companyId?: string
  logoFile: File | null
  setLogoFile: (file: File | null) => void
  currentLogoUrl?: string
}

export function CompanyFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
  companyId,
  logoFile,
  setLogoFile,
  currentLogoUrl,
}: CompanyFormModalProps) {
  const isEditMode = mode === "edit"
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file")
        return
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB")
        return
      }
      setLogoFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
    }
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const displayLogoUrl = logoPreview || currentLogoUrl

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
                      status: value,
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

            {/* Logo Upload */}
            <div className="grid gap-2">
              <Label>Company Logo</Label>
              <div className="flex items-start gap-4">
                {/* Logo Preview */}
                <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                  {displayLogoUrl ? (
                    <img
                      src={displayLogoUrl}
                      alt="Company logo"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id={isEditMode ? "edit-logo" : "logo"}
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {displayLogoUrl ? "Change Logo" : "Upload Logo"}
                    </Button>
                    {(logoFile || logoPreview) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {logoFile && (
                    <p className="text-xs text-gray-500">
                      Selected: {logoFile.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB. {!isEditMode && "Logo can be uploaded after company is created."}
                  </p>
                </div>
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
