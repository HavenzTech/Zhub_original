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
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

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

  const loadUsers = useCallback(async () => {
    try {
      const response = await bmsApi.users.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setUsers(
        data.map((u: UserResponse) => ({
          id: u.id || "",
          name: u.name || "",
          email: u.email || "",
        }))
      );
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, []);

  useEffect(() => {
    loadDepartment();
    loadUsers();
  }, [loadDepartment, loadUsers]);

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

  const formatBudget = (value?: number | null) => {
    if (!value) return "-";
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  return (
    <AppLayout>
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-0">
        {/* Header */}
        <div className="pb-4 border-b border-stone-200 dark:border-stone-700 mb-0">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </button>
            <Users className="w-5 h-5 text-stone-500 dark:text-stone-400" />
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              {department.name}
            </h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {["overview", "team"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pt-6 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Head</div>
                  <div className="text-lg font-semibold text-stone-900 dark:text-stone-50">{department.headName || "-"}</div>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Company</div>
                  <div className="text-lg font-semibold text-stone-900 dark:text-stone-50">{company?.name || "-"}</div>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Budget Allocated</div>
                  <div className="text-lg font-semibold text-stone-900 dark:text-stone-50">{formatBudget(department.budgetAllocated)}</div>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Budget Spent</div>
                  <div className="text-lg font-semibold text-stone-900 dark:text-stone-50">{formatBudget(department.budgetSpent)}</div>
                </div>
              </div>

              {/* Description */}
              {department.description && (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3">Description</h3>
                  <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                    {department.description}
                  </p>
                </div>
              )}

              {/* Edit button */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(department)} className="border-stone-300 dark:border-stone-600">
                  Edit Department
                </Button>
              </div>
            </>
          )}

          {activeTab === "team" && (
            <MembersAssignment
              entityType="department"
              entityId={department.id!}
              entityName={department.name || "this department"}
            />
          )}
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
        />
      </div>
    </AppLayout>
  );
}
