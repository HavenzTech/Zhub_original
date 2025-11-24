// app/departments/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Department } from "@/types/bms";
import { toast } from "sonner";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useDepartments } from "@/lib/hooks/useDepartments";
import {
  formatCurrency,
  formatDate,
  getTimeAgo,
  getBudgetUtilization,
} from "@/features/departments/utils/departmentHelpers";
import { DepartmentCard } from "@/features/departments/components/DepartmentCard";

// Dynamic import for modal - only loaded when needed
const DepartmentFormModal = dynamic(
  () =>
    import("@/features/departments/components/DepartmentFormModal").then(
      (mod) => ({ default: mod.DepartmentFormModal })
    ),
  { ssr: false }
);
import {
  Users,
  Plus,
  Search,
  Eye,
  Edit,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Loader2,
  RefreshCw,
  Building2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function DepartmentsPage() {
  const router = useRouter();
  const { departments, loading, error, loadDepartments, setDepartments } =
    useDepartments();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] =
    useState<Department | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    headName: "",
    headEmail: "",
    headPhone: "",
    budgetAllocated: "",
    budgetSpent: "",
  });

  // Initialize auth on mount
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
      };

      // Only add optional fields if they have values
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

      console.log("Creating department with payload:", payload);
      const newDepartment = await bmsApi.departments.create(payload);

      setDepartments((prev: Department[]) => [
        ...prev,
        newDepartment as Department,
      ]);
      toast.success("Department created successfully!");
      setShowAddForm(false);
      setFormData({
        name: "",
        description: "",
        headName: "",
        headEmail: "",
        headPhone: "",
        budgetAllocated: "",
        budgetSpent: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to create department";
      toast.error(errorMessage);
      console.error("Error creating department:", err);
      if (err instanceof BmsApiError) {
        console.error("Error details:", {
          status: err.status,
          code: err.code,
          details: err.details,
          message: err.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartment || !formData.name.trim()) {
      toast.error("Department name is required");
      return;
    }

    setIsSubmitting(true);
    let payload: any = null;
    try {
      // Build payload using UpdateDepartmentRequest DTO (no timestamps, no companyId)
      payload = {
        id: selectedDepartment.id,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        headName: formData.headName?.trim() || null,
        headEmail: formData.headEmail?.trim() || null,
        headPhone: formData.headPhone?.trim() || null,
        budgetAllocated: null,
        budgetSpent: null,
      };

      // Only set budget fields if they have valid values
      const budgetAllocated = formData.budgetAllocated?.trim();
      if (budgetAllocated && !isNaN(parseFloat(budgetAllocated))) {
        payload.budgetAllocated = parseFloat(budgetAllocated);
      }

      const budgetSpent = formData.budgetSpent?.trim();
      if (budgetSpent && !isNaN(parseFloat(budgetSpent))) {
        payload.budgetSpent = parseFloat(budgetSpent);
      }

      console.log(
        "Updating department with payload:",
        JSON.stringify(payload, null, 2)
      );
      await bmsApi.departments.update(selectedDepartment.id, payload);

      // Update local state with the changed data (backend returns NoContent)
      const updatedDepartment = {
        ...selectedDepartment,
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      setDepartments((prev: Department[]) =>
        prev.map((d: Department) =>
          d.id === selectedDepartment.id ? updatedDepartment : d
        )
      );
      setSelectedDepartment(updatedDepartment);
      toast.success("Department updated successfully!");
      setShowEditForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError
          ? err.message
          : "Failed to update department";
      toast.error(errorMessage);
      console.error("Error updating department:", err);
      if (payload) {
        console.error("Payload that failed:", JSON.stringify(payload, null, 2));
      }
      if (err instanceof BmsApiError) {
        console.error("Error details:", {
          status: err.status,
          code: err.code,
          details: err.details,
          message: err.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (department: Department) => {
    console.log(
      "Opening edit form for department:",
      JSON.stringify(department, null, 2)
    );
    setFormData({
      name: department.name,
      description: department.description || "",
      headName: department.headName || "",
      headEmail: department.headEmail || "",
      headPhone: department.headPhone || "",
      budgetAllocated: department.budgetAllocated?.toString() || "",
      budgetSpent: department.budgetSpent?.toString() || "",
    });
    setShowEditForm(true);
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dept.headName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const DepartmentDetails = ({ department }: { department: Department }) => {
    const utilization = getBudgetUtilization(
      department.budgetAllocated,
      department.budgetSpent
    );

    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => setSelectedDepartment(null)}>
          ← Back to Departments
        </Button>

        {/* Department Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-10 h-10 text-purple-600" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {department.name}
                </h1>
                {department.description && (
                  <p className="text-gray-600 mb-4">{department.description}</p>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {department.headName && (
                    <div>
                      <span className="text-gray-600">Department Head:</span>
                      <div className="font-medium">{department.headName}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Department ID:</span>
                    <div className="font-medium font-mono text-xs">
                      {department.id.slice(0, 8)}...
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600">Company ID:</span>
                    <div className="font-medium font-mono text-xs">
                      {department.companyId.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => openEditForm(department)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(department.budgetAllocated)}
                  </div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(
                      (department.budgetAllocated || 0) -
                        (department.budgetSpent || 0)
                    )}{" "}
                    remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(department.budgetSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Budget Spent</div>
                  <div className="text-xs text-gray-500">
                    {utilization}% utilized
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDate(department.createdAt)}
                  </div>
                  <div className="text-sm text-gray-600">Created</div>
                  <div className="text-xs text-gray-500">
                    Updated {getTimeAgo(department.updatedAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Department Head Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {department.headName && (
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="font-medium">{department.headName}</span>
                </div>
              )}
              {department.headEmail && (
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-blue-600">
                    {department.headEmail}
                  </span>
                </div>
              )}
              {department.headPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{department.headPhone}</span>
                </div>
              )}
              {!department.headEmail && !department.headPhone && (
                <p className="text-sm text-gray-500">
                  No contact information available
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Department Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Department ID</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {department.id.slice(0, 8)}...
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company ID</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {department.companyId.slice(0, 8)}...
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created At</span>
                <span className="text-sm font-medium">
                  {formatDate(department.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">
                  {formatDate(department.updatedAt)}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

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
        {!selectedDepartment ? (
          <>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {departments.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Departments
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          departments.reduce(
                            (sum, dept) => sum + (dept.budgetAllocated || 0),
                            0
                          )
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Total Budget</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(
                          departments.reduce(
                            (sum, dept) => sum + (dept.budgetSpent || 0),
                            0
                          )
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Total Spent</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(
                          departments.reduce((sum, dept) => {
                            const allocated = dept.budgetAllocated || 0;
                            const spent = dept.budgetSpent || 0;
                            return (
                              sum +
                              (allocated > 0 ? (spent / allocated) * 100 : 0)
                            );
                          }, 0) / departments.length
                        ) || 0}
                        %
                      </div>
                      <div className="text-sm text-gray-600">
                        Avg Utilization
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    onViewDetails={setSelectedDepartment}
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
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Department
                </Button>
              </div>
            )}
          </>
        ) : (
          <DepartmentDetails department={selectedDepartment} />
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

        {/* Edit Department Modal */}
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
