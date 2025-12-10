"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { PropertyDetails } from "@/features/properties/components/PropertyDetails";
import {
  PropertyFormModal,
  PropertyFormData,
} from "@/features/properties/components/PropertyFormModal";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Property, PropertyType, PropertyStatus } from "@/types/bms";
import { toast } from "sonner";

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

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<PropertyFormData>(initialFormData);

  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(
    () => (property?.name ? [{ label: property.name }] : []),
    [property?.name]
  );

  const loadProperty = useCallback(async () => {
    if (!propertyId) return;

    try {
      setLoading(true);
      setError(null);

      const auth = authService.getAuth();
      if (!auth) {
        router.push("/login");
        return;
      }

      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();

      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      const data = await bmsApi.properties.getById(propertyId);
      setProperty(data as Property);
    } catch (err) {
      console.error("Error loading property:", err);
      setError(err instanceof Error ? err : new Error("Failed to load property"));
    } finally {
      setLoading(false);
    }
  }, [propertyId, router]);

  useEffect(() => {
    loadProperty();
  }, [loadProperty]);

  const handleBack = () => {
    router.push("/properties");
  };

  const handleEdit = (property: Property) => {
    setFormData({
      name: property.name ?? "",
      description: property.description ?? "",
      type: property.type ?? "",
      status: property.status ?? "active",
      locationAddress: property.locationAddress ?? "",
      locationCity: property.locationCity ?? "",
      locationProvince: property.locationProvince ?? "",
      locationCountry: property.locationCountry ?? "",
      locationPostalCode: property.locationPostalCode ?? "",
      locationLatitude: property.locationLatitude?.toString() ?? "",
      locationLongitude: property.locationLongitude?.toString() ?? "",
      sizeTotalArea: property.sizeTotalArea?.toString() ?? "",
      sizeUsableArea: property.sizeUsableArea?.toString() ?? "",
      sizeFloors: property.sizeFloors?.toString() ?? "",
      currentValue: property.currentValue?.toString() ?? "",
      monthlyOperatingCosts: property.monthlyOperatingCosts?.toString() ?? "",
    });
    setShowEditForm(true);
  };

  const buildPayload = (propertyId: string) => {
    const payload: Record<string, unknown> = {
      id: propertyId,
      name: formData.name.trim(),
      status: formData.status,
    };

    payload.description = formData.description?.trim() || null;
    payload.type = formData.type?.trim() || null;
    payload.locationAddress = formData.locationAddress?.trim() || null;
    payload.locationCity = formData.locationCity?.trim() || null;
    payload.locationProvince = formData.locationProvince?.trim() || null;
    payload.locationCountry = formData.locationCountry?.trim() || null;
    payload.locationPostalCode = formData.locationPostalCode?.trim() || null;
    payload.locationLatitude = null;
    payload.locationLongitude = null;
    payload.sizeTotalArea = null;
    payload.sizeUsableArea = null;
    payload.sizeFloors = null;
    payload.currentValue = null;
    payload.monthlyOperatingCosts = null;

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

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property?.id || !formData.name.trim()) {
      toast.error("Property name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(property.id);
      await bmsApi.properties.update(property.id, payload);
      toast.success("Property updated successfully!");
      setProperty({ ...property, ...payload } as Property);
      setShowEditForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update property";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinnerCentered text="Loading property..." />
      </AppLayout>
    );
  }

  if (error || !property) {
    return (
      <AppLayout>
        <ErrorDisplayCentered
          title="Error loading property"
          message={error?.message || "Property not found"}
          onRetry={loadProperty}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Set breadcrumb inside AppLayout where provider exists */}
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-6">
        {/* Property Details */}
        <PropertyDetails property={property} onBack={handleBack} onEdit={handleEdit} />

        {/* Edit Modal */}
        <PropertyFormModal
          open={showEditForm}
          onOpenChange={setShowEditForm}
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleEditSubmit}
        />
      </div>
    </AppLayout>
  );
}
