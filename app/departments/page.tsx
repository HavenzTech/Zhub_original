"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Department } from "@/types/bms";
import { toast } from "sonner";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useDepartments } from "@/lib/hooks/useDepartments";
import { DepartmentCard } from "@/features/departments/components/DepartmentCard";
import { DepartmentStats } from "@/features/departments/components/DepartmentStats";
import { Users, Plus, Search, RefreshCw } from "lucide-react";

const DepartmentFormModal = dynamic(
  () =>
    import("@/features/departments/components/DepartmentFormModal").then(
      (mod) => ({ default: mod.DepartmentFormModal })
    ),
  { ssr: false, loading: () => <LoadingSpinnerCentered /> }
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

export default function DepartmentsPage() {
  const router = useRouter();
  const { departments, loading, error, loadDepartments, setDepartments } =
    useDepartments();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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

    loadDepartments();
  }, [router, loadDepartments]);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
    };

    if (formData.description?.trim())
      payload.description = formData.description;
    if (formData.headName?.trim()) payload.headName = formData.headName;
    if (formData.headEmail?.trim()) payload.headEmail = formData.headEmail;
    if (formData.headPhone?.trim()) payload.headPhone = formData.headPhone;
    if (
      formData.budgetAllocated &&
      !isNaN(parseFloat(formData.budgetAllocated))
    ) {
      payload.budgetAllocated = parseFloat(formData.budgetAllocated);
    }
    if (formData.budgetSpent && !isNaN(parseFloat(formData.budgetSpent))) {
      payload.budgetSpent = parseFloat(formData.budgetSpent);
    }

    return payload;
  };

  const handleViewDetails = (department: Department) => {
    router.push(`/departments/${department.id}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const newDepartment = await bmsApi.departments.create(payload);

      setDepartments((prev: Department[]) => [
        ...prev,
        newDepartment as Department,
      ]);
      toast.success("Department created successfully!");
      setShowAddForm(false);
      setFormData(initialFormData);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to create department";
      toast.error(errorMessage);
      console.error("Error creating department:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.headName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <LoadingSpinnerCentered text="Loading departments..." />;
  }

  if (error) {
    return (
      <ErrorDisplayCentered
        title="Error loading departments"
        message={error.message}
        onRetry={loadDepartments}
      />
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Departments
            </h1>
            <p className="text-gray-600">
              Cross-organizational department management and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDepartments}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {authService.hasPermission("create", "department") && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <DepartmentStats departments={departments} />

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <Input
              placeholder="Search departments..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Badge variant="secondary">
            {filteredDepartments.length}{" "}
            {filteredDepartments.length === 1
              ? "department"
              : "departments"}
          </Badge>
        </div>

        {/* Departments Grid */}
        {filteredDepartments.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredDepartments.map((department) => (
              <DepartmentCard
                key={department.id}
                department={department}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No departments found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by adding your first department"}
            </p>
            {authService.hasPermission("create", "department") && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Department
              </Button>
            )}
          </div>
        )}

        {/* Add Department Modal */}
        <DepartmentFormModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  );
}
