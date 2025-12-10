"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Property, PropertyType, PropertyStatus } from "@/types/bms";
import { toast } from "sonner";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useProperties } from "@/lib/hooks/useProperties";
import { PropertyCard } from "@/features/properties/components/PropertyCard";
import { PropertyStats } from "@/features/properties/components/PropertyStats";
import {
  PropertyFormModal,
  PropertyFormData,
} from "@/features/properties/components/PropertyFormModal";
import { Home, Plus, Search, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialFormData: PropertyFormData = {
  name: "",
  description: "",
  type: "" as PropertyType | "",
  status: "active" as PropertyStatus,
  locationAddress: "",
  locationCity: "",
  locationProvince: "",
  locationCountry: "",
  locationPostalCode: "",
  locationLatitude: "",
  locationLongitude: "",
  sizeTotalArea: "",
  sizeUsableArea: "",
  sizeFloors: "",
  currentValue: "",
  monthlyOperatingCosts: "",
};

export default function PropertiesPage() {
  const router = useRouter();
  const {
    properties,
    loading,
    error,
    loadProperties,
    createProperty,
    setProperties,
  } = useProperties();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);
  const [deleteProperty, setDeleteProperty] = useState<Property | null>(null);

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();

    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);

    loadProperties();
  }, [router, loadProperties]);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      status: formData.status,
    };

    if (formData.description?.trim())
      payload.description = formData.description;
    if (formData.type) payload.type = formData.type;
    if (formData.locationAddress?.trim())
      payload.locationAddress = formData.locationAddress;
    if (formData.locationCity?.trim())
      payload.locationCity = formData.locationCity;
    if (formData.locationProvince?.trim())
      payload.locationProvince = formData.locationProvince;
    if (formData.locationCountry?.trim())
      payload.locationCountry = formData.locationCountry;
    if (formData.locationPostalCode?.trim())
      payload.locationPostalCode = formData.locationPostalCode;

    // Parse numeric fields
    const numericFields = [
      { key: "locationLatitude", value: formData.locationLatitude },
      { key: "locationLongitude", value: formData.locationLongitude },
      { key: "sizeTotalArea", value: formData.sizeTotalArea },
      { key: "sizeUsableArea", value: formData.sizeUsableArea },
      { key: "currentValue", value: formData.currentValue },
      { key: "monthlyOperatingCosts", value: formData.monthlyOperatingCosts },
    ];

    numericFields.forEach(({ key, value }) => {
      const trimmed = value?.trim();
      if (trimmed && !isNaN(parseFloat(trimmed))) {
        payload[key] = parseFloat(trimmed);
      }
    });

    const sizeFloors = formData.sizeFloors?.trim();
    if (sizeFloors && !isNaN(parseInt(sizeFloors))) {
      payload.sizeFloors = parseInt(sizeFloors);
    }

    return payload;
  };

  const handleViewDetails = (property: Property) => {
    router.push(`/properties/${property.id}`);
  };

  const handleDeleteClick = (property: Property) => {
    setDeleteProperty(property);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProperty) return;

    try {
      await bmsApi.properties.delete(deleteProperty.id!);
      setProperties((prev: Property[]) => prev.filter((p) => p.id !== deleteProperty.id));
      toast.success(`Property "${deleteProperty.name}" deleted successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to delete property";
      toast.error(errorMessage);
      console.error("Error deleting property:", err);
    } finally {
      setDeleteProperty(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Property name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const newProperty = await createProperty(payload);

      if (newProperty) {
        setShowAddForm(false);
        setFormData(initialFormData);
      }
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create property";
      toast.error(errorMessage);
      console.error("Error creating property:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProperties = properties.filter(
    (property) =>
      property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.locationCity?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
            <p className="text-gray-600">
              Manage all organizational properties and facilities
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadProperties}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {authService.hasPermission("create", "property") && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading properties...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to load properties
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                {typeof error === "string" && error === "Failed to fetch"
                  ? "Could not connect to the server. Please check your connection and try again."
                  : error}
              </p>
              <Button variant="outline" onClick={loadProperties}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <PropertyStats properties={properties} />

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search properties..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="secondary">
                {filteredProperties.length}{" "}
                {filteredProperties.length === 1 ? "property" : "properties"}
              </Badge>
            </div>

            {/* Properties Grid */}
            {filteredProperties.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProperties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                    onClick={handleViewDetails}
                    onDelete={handleDeleteClick}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No properties found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first property"}
                </p>
                {authService.hasPermission("create", "property") && (
                  <Button onClick={() => setShowAddForm(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Property
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Add Property Modal */}
        <PropertyFormModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteProperty}
          onOpenChange={(open) => !open && setDeleteProperty(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Property</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteProperty?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteProperty(null)}>
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
    </AppLayout>
  );
}
