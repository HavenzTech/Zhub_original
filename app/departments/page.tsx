"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Department, UserResponse } from "@/types/bms";
import { toast } from "sonner";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useDepartments } from "@/lib/hooks/useDepartments";
import { DepartmentCard } from "@/features/departments/components/DepartmentCard";
import { DepartmentStats } from "@/features/departments/components/DepartmentStats";
import { Users, Plus, Search, RefreshCw } from "lucide-react";
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
  const [deleteDepartment, setDeleteDepartment] = useState<Department | null>(null);
  const [users, setUsers] = useState<{ id: string; name: string; email: string }[]>([]);

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
    loadUsers();
  }, [router, loadDepartments, loadUsers]);

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

  const handleDeleteClick = (department: Department) => {
    setDeleteDepartment(department);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDepartment) return;

    try {
      await bmsApi.departments.delete(deleteDepartment.id!);
      setDepartments((prev: Department[]) => prev.filter((d) => d.id !== deleteDepartment.id));
      toast.success(`Department "${deleteDepartment.name}" deleted successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to delete department";
      toast.error(errorMessage);
      console.error("Error deleting department:", err);
    } finally {
      setDeleteDepartment(null);
    }
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

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
              Departments
            </h1>
            <p className="text-stone-500 dark:text-stone-400">
              Cross-organizational department management and analytics
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadDepartments} className="border-stone-300 dark:border-stone-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {authService.hasPermission("create", "department") && (
              <Button onClick={() => setShowAddForm(true)} className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan mx-auto mb-4"></div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Loading departments...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 dark:text-red-400 text-xl">!</span>
              </div>
              <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
                Unable to load departments
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-md">
                {error.message === "Failed to fetch"
                  ? "Could not connect to the server. Please check your connection and try again."
                  : error.message}
              </p>
              <Button variant="outline" onClick={loadDepartments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <DepartmentStats departments={departments} />

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400 dark:text-stone-500" />
                <Input
                  placeholder="Search departments..."
                  className="pl-10 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 rounded-xl"
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

            {/* Departments Table */}
            {filteredDepartments.length > 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Department</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Head</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Members</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Budget</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDepartments.map((dept) => {
                        const budget = dept.budgetAllocated
                          ? `$${(dept.budgetAllocated / 1000).toFixed(0)}K`
                          : "-";

                        return (
                          <tr
                            key={dept.id}
                            onClick={() => handleViewDetails(dept)}
                            className="border-b border-stone-100 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-stone-500 dark:text-stone-400">
                                  <Users className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-medium text-stone-900 dark:text-stone-50">{dept.name}</div>
                                  {dept.description && (
                                    <div className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[200px]">{dept.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-sm text-stone-700 dark:text-stone-300">{dept.headName || "-"}</td>
                            <td className="px-4 py-4 text-sm text-stone-700 dark:text-stone-300">{(dept as any).memberCount ?? "-"}</td>
                            <td className="px-4 py-4 text-sm text-stone-700 dark:text-stone-300">{budget}</td>
                            <td className="px-4 py-4 text-right">
                              {authService.isSuperAdmin() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(dept);
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
                  No departments found
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first department"}
                </p>
                {authService.hasPermission("create", "department") && (
                  <Button onClick={() => setShowAddForm(true)} className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Department
                  </Button>
                )}
              </div>
            )}
          </>
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
          users={users}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteDepartment}
          onOpenChange={(open) => !open && setDeleteDepartment(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteDepartment?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteDepartment(null)}>
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
