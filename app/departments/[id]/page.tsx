"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { DepartmentDetails } from "@/features/departments/components/DepartmentDetails";
import { MembersAssignment } from "@/components/common/MembersAssignment";
import { Button } from "@/components/ui/button";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Department, Company, UserResponse } from "@/types/bms";
import { toast } from "sonner";
import { ArrowLeft, Users } from "lucide-react";
import { useUsersQuery } from "@/lib/hooks/queries/useUsersQuery";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getDepartmentDetailSteps } from "@/lib/tour/steps";

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
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("overview");
  const { data: usersQueryData } = useUsersQuery();
  const users = (usersQueryData ?? []).map((u) => ({ id: u.id || "", name: u.name || "", email: u.email || "" }));
  const [selectedHeadUserId, setSelectedHeadUserId] = useState<string | null>(null);

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

      // Fetch company name if companyId exists
      if ((data as Department).companyId) {
        try {
          const companyData = await bmsApi.companies.getById((data as Department).companyId);
          setCompany(companyData as Company);
        } catch {
          // Silently fail - company name is optional
        }
      }
    } catch (err) {
      console.error("Error loading department:", err);
      setError(err instanceof Error ? err : new Error("Failed to load department"));
    } finally {
      setLoading(false);
    }
  }, [departmentId, router]);

  useEffect(() => {
    loadDepartment();
    // users auto-fetched by React Query
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

      // Auto-add new head as a team member
      if (selectedHeadUserId) {
        try {
          await bmsApi.departments.addMember(department.id, {
            userId: selectedHeadUserId,
            role: "manager",
          });
        } catch {
          // May fail if already a member — that's fine
        }
      }

      toast.success("Department updated successfully!");
      setDepartment({ ...department, ...payload } as Department);
      setShowEditForm(false);
      setSelectedHeadUserId(null);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update department";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatBudget = (value?: number | null) => {
    if (!value) return "-";
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.DEPARTMENT_DETAIL} options={{ steps: getDepartmentDetailSteps(), enabled: !loading && !!department }} />

      {loading ? (
        <LoadingSpinnerCentered text="Loading department..." />
      ) : error || !department ? (
        <ErrorDisplayCentered
          title="Error loading department"
          message={error?.message || "Department not found"}
          onRetry={loadDepartment}
        />
      ) : (
      <>
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                {department.name}
              </h1>
              <p className="text-stone-500 dark:text-stone-400">
                {department.headName ? `Led by ${department.headName}` : "Department"}
                {company?.name ? ` · ${company.name}` : ""}
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => handleEdit(department)} className="border-stone-300 dark:border-stone-600">
            Edit Department
          </Button>
        </div>

        {/* All content — single page, no tabs needed for just 2 sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column (2/3): Details card + Description */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details card */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700" data-tour="department-info">
              <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Department Details</h2>
              </div>
              <div className="divide-y divide-stone-100 dark:divide-stone-800">
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-sm text-stone-500 dark:text-stone-400">Head</span>
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{department.headName || "-"}</span>
                </div>
                {department.headEmail && (
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Email</span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{department.headEmail}</span>
                  </div>
                )}
                {department.headPhone && (
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Phone</span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{department.headPhone}</span>
                  </div>
                )}
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-sm text-stone-500 dark:text-stone-400">Budget Allocated</span>
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatBudget(department.budgetAllocated)}</span>
                </div>
                <div className="px-5 py-3 flex justify-between items-center">
                  <span className="text-sm text-stone-500 dark:text-stone-400">Budget Spent</span>
                  <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatBudget(department.budgetSpent)}</span>
                </div>
                {company && (
                  <div className="px-5 py-3 flex justify-between items-center">
                    <span className="text-sm text-stone-500 dark:text-stone-400">Company</span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{company.name}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700" data-tour="department-description">
              <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
                <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Description</h2>
              </div>
              <div className="p-5">
                {department.description ? (
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {department.description}
                  </p>
                ) : (
                  <p className="text-sm text-stone-400 dark:text-stone-500">
                    No description provided.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right column (1/3): Team Members */}
          <div data-tour="department-members">
            <MembersAssignment
              entityType="department"
              entityId={department.id!}
              entityName={department.name || "this department"}
            />
          </div>
        </div>

        {/* Edit Modal */}
        <DepartmentFormModal
          open={showEditForm}
          onOpenChange={setShowEditForm}
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleEditSubmit}
          users={users}
          onHeadUserSelect={setSelectedHeadUserId}
        />
      </div>
      </>
      )}
    </AppLayout>
  );
}
