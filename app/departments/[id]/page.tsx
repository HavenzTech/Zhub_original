"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { DepartmentDetails } from "@/features/departments/components/DepartmentDetails";
import { MembersAssignment } from "@/components/common/MembersAssignment";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Department } from "@/types/bms";
import { toast } from "sonner";

const DepartmentFormModal = dynamic(
  () =>
    import("@/features/departments/components/DepartmentFormModal").then(
      (mod) => ({ default: mod.DepartmentFormModal })
    ),
  { ssr: false }
);

const initialFormData = {
  name: "",
  description: "",
  headName: "",
  headEmail: "",
  headPhone: "",
  budgetAllocated: "",
  budgetSpent: "",
};

export default function DepartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const departmentId = params.id as string;

  const [department, setDepartment] = useState<Department | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(
    () => (department?.name ? [{ label: department.name }] : []),
    [department?.name]
  );

  const loadDepartment = useCallback(async () => {
    if (!departmentId) return;

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

      const data = await bmsApi.departments.getById(departmentId);
      setDepartment(data as Department);
    } catch (err) {
      console.error("Error loading department:", err);
      setError(err instanceof Error ? err : new Error("Failed to load department"));
    } finally {
      setLoading(false);
    }
  }, [departmentId, router]);

  useEffect(() => {
    loadDepartment();
  }, [loadDepartment]);

  const handleBack = () => {
    router.push("/departments");
  };

  const handleEdit = (department: Department) => {
    setFormData({
      name: department.name ?? "",
      description: department.description ?? "",
      headName: department.headName ?? "",
      headEmail: department.headEmail ?? "",
      headPhone: department.headPhone ?? "",
      budgetAllocated: department.budgetAllocated?.toString() ?? "",
      budgetSpent: department.budgetSpent?.toString() ?? "",
    });
    setShowEditForm(true);
  };

  const buildPayload = (departmentId: string) => {
    const payload: Record<string, unknown> = {
      id: departmentId,
      name: formData.name.trim(),
    };

    payload.description = formData.description?.trim() || null;
    payload.headName = formData.headName?.trim() || null;
    payload.headEmail = formData.headEmail?.trim() || null;
    payload.headPhone = formData.headPhone?.trim() || null;
    payload.budgetAllocated = null;
    payload.budgetSpent = null;

    const budgetAllocated = formData.budgetAllocated?.trim();
    if (budgetAllocated && !isNaN(parseFloat(budgetAllocated))) {
      payload.budgetAllocated = parseFloat(budgetAllocated);
    }

    const budgetSpent = formData.budgetSpent?.trim();
    if (budgetSpent && !isNaN(parseFloat(budgetSpent))) {
      payload.budgetSpent = parseFloat(budgetSpent);
    }

    return payload;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!department?.id || !formData.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(department.id);
      await bmsApi.departments.update(department.id, payload);
      toast.success("Department updated successfully!");
      setDepartment({ ...department, ...payload } as Department);
      setShowEditForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update department";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinnerCentered text="Loading department..." />
      </AppLayout>
    );
  }

  if (error || !department) {
    return (
      <AppLayout>
        <ErrorDisplayCentered
          title="Error loading department"
          message={error?.message || "Department not found"}
          onRetry={loadDepartment}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* Set breadcrumb inside AppLayout where provider exists */}
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-6">
        {/* Department Details */}
        <DepartmentDetails department={department} onBack={handleBack} onEdit={handleEdit} />

        {/* Members Assignment */}
        <MembersAssignment
          entityType="department"
          entityId={department.id!}
          entityName={department.name || "this department"}
        />

        {/* Edit Modal */}
        <DepartmentFormModal
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
