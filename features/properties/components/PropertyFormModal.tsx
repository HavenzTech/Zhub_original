"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Edit, Loader2 } from "lucide-react";

export interface PropertyFormData {
  name: string;
  description: string;
  type: string;
  status: string;
  locationAddress: string;
  locationCity: string;
  locationProvince: string;
  locationCountry: string;
  locationPostalCode: string;
  locationLatitude: string;
  locationLongitude: string;
  sizeTotalArea: string;
  sizeUsableArea: string;
  sizeFloors: string;
  currentValue: string;
  monthlyOperatingCosts: string;
}

interface PropertyFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formData: PropertyFormData;
  setFormData: (data: PropertyFormData) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function PropertyFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  isSubmitting,
  onSubmit,
}: PropertyFormModalProps) {
  const isEdit = mode === "edit";
  const idPrefix = isEdit ? "edit-" : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Property" : "Add New Property"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update property information. Fields marked with * are required."
              : "Create a new property in the system. Fields marked with * are required."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            {/* Basic Information */}
            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}name`}>Property Name *</Label>
              <Input
                id={`${idPrefix}name`}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Enter property name"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor={`${idPrefix}description`}>Description</Label>
              <Textarea
                id={`${idPrefix}description`}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Property description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}type`}>Property Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="office">Office</SelectItem>
                    <SelectItem value="warehouse">Warehouse</SelectItem>
                    <SelectItem value="datacenter">Data Center</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor={`${idPrefix}status`}>Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="under-construction">
                      Under Construction
                    </SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Location Information */}
            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium text-sm mb-3">Location Information</h3>

              <div className="grid gap-2 mb-4">
                <Label htmlFor={`${idPrefix}locationAddress`}>Address</Label>
                <Input
                  id={`${idPrefix}locationAddress`}
                  value={formData.locationAddress}
                  onChange={(e) =>
                    setFormData({ ...formData, locationAddress: e.target.value })
                  }
                  placeholder="Street address"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}locationCity`}>City</Label>
                  <Input
                    id={`${idPrefix}locationCity`}
                    value={formData.locationCity}
                    onChange={(e) =>
                      setFormData({ ...formData, locationCity: e.target.value })
                    }
                    placeholder="City"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}locationProvince`}>
                    Province/State
                  </Label>
                  <Input
                    id={`${idPrefix}locationProvince`}
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

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}locationCountry`}>Country</Label>
                  <Input
                    id={`${idPrefix}locationCountry`}
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
                  <Label htmlFor={`${idPrefix}locationPostalCode`}>
                    Postal Code
                  </Label>
                  <Input
                    id={`${idPrefix}locationPostalCode`}
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

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}locationLatitude`}>Latitude</Label>
                  <Input
                    id={`${idPrefix}locationLatitude`}
                    type="number"
                    step="any"
                    value={formData.locationLatitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locationLatitude: e.target.value,
                      })
                    }
                    placeholder="e.g., 43.6532"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}locationLongitude`}>
                    Longitude
                  </Label>
                  <Input
                    id={`${idPrefix}locationLongitude`}
                    type="number"
                    step="any"
                    value={formData.locationLongitude}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        locationLongitude: e.target.value,
                      })
                    }
                    placeholder="e.g., -79.3832"
                  />
                </div>
              </div>
            </div>

            {/* Size Information */}
            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium text-sm mb-3">Size Information</h3>

              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}sizeTotalArea`}>
                    Total Area (sq ft)
                  </Label>
                  <Input
                    id={`${idPrefix}sizeTotalArea`}
                    type="number"
                    value={formData.sizeTotalArea}
                    onChange={(e) =>
                      setFormData({ ...formData, sizeTotalArea: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}sizeUsableArea`}>
                    Usable Area (sq ft)
                  </Label>
                  <Input
                    id={`${idPrefix}sizeUsableArea`}
                    type="number"
                    value={formData.sizeUsableArea}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        sizeUsableArea: e.target.value,
                      })
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}sizeFloors`}>
                    Number of Floors
                  </Label>
                  <Input
                    id={`${idPrefix}sizeFloors`}
                    type="number"
                    value={formData.sizeFloors}
                    onChange={(e) =>
                      setFormData({ ...formData, sizeFloors: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className="border-t pt-4 mt-2">
              <h3 className="font-medium text-sm mb-3">Financial Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}currentValue`}>
                    Current Value (CAD)
                  </Label>
                  <Input
                    id={`${idPrefix}currentValue`}
                    type="number"
                    value={formData.currentValue}
                    onChange={(e) =>
                      setFormData({ ...formData, currentValue: e.target.value })
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor={`${idPrefix}monthlyOperatingCosts`}>
                    Monthly Operating Costs (CAD)
                  </Label>
                  <Input
                    id={`${idPrefix}monthlyOperatingCosts`}
                    type="number"
                    value={formData.monthlyOperatingCosts}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthlyOperatingCosts: e.target.value,
                      })
                    }
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
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
                  {isEdit ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <Edit className="w-4 h-4 mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {isEdit ? "Update Property" : "Create Property"}
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
