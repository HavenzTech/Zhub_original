"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { toast } from "sonner";
import { Building2, Plus, X, Loader2 } from "lucide-react";

interface Department {
  id?: string;
  departmentId?: string;
  name?: string;
  departmentName?: string;
  description?: string;
}

interface DepartmentsAssignmentProps {
  projectId: string;
  projectName: string;
}

export function DepartmentsAssignment({
  projectId,
  projectName,
}: DepartmentsAssignmentProps) {
  const [assignedDepartments, setAssignedDepartments] = useState<Department[]>([]);
  const [availableDepartments, setAvailableDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>("");
  const [removingDepartment, setRemovingDepartment] = useState<Department | null>(null);

  const loadAssignedDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bmsApi.projects.getDepartments(projectId);
      const deptList = Array.isArray(data)
        ? data
        : (data as any)?.items || (data as any)?.data || [];
      setAssignedDepartments(deptList);
    } catch (err) {
      console.error("Error loading assigned departments:", err);
      toast.error("Failed to load assigned departments");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const loadAvailableDepartments = useCallback(async () => {
    try {
      const data = await bmsApi.departments.getAll();
      const deptList = Array.isArray(data)
        ? data
        : (data as any)?.items || (data as any)?.data || [];
      setAvailableDepartments(deptList);
    } catch (err) {
      console.error("Error loading departments:", err);
    }
  }, []);

  useEffect(() => {
    loadAssignedDepartments();
    loadAvailableDepartments();
  }, [loadAssignedDepartments, loadAvailableDepartments]);

  const handleAssignDepartment = async () => {
    if (!selectedDepartmentId) {
      toast.error("Please select a department");
      return;
    }

    setAdding(true);
    try {
      await bmsApi.projects.assignDepartment(projectId, selectedDepartmentId);
      toast.success("Department assigned successfully");
      setSelectedDepartmentId("");
      await loadAssignedDepartments();
    } catch (err) {
      const message =
        err instanceof BmsApiError ? err.message : "Failed to assign department";
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveDepartment = async () => {
    if (!removingDepartment) return;

    const deptId = removingDepartment.id || removingDepartment.departmentId;
    if (!deptId) return;

    try {
      await bmsApi.projects.removeDepartment(projectId, deptId);
      toast.success("Department removed from project");
      await loadAssignedDepartments();
    } catch (err) {
      const message =
        err instanceof BmsApiError ? err.message : "Failed to remove department";
      toast.error(message);
    } finally {
      setRemovingDepartment(null);
    }
  };

  // Helper to get the department ID (handles both formats)
  const getDeptId = (d: Department) => d.id || d.departmentId || "";
  const getDeptName = (d: Department) => d.name || d.departmentName || "";

  // Filter out departments that are already assigned
  const assignedIds = new Set(assignedDepartments.map((d) => getDeptId(d)));
  const departmentsToAdd = availableDepartments.filter((d) => !assignedIds.has(getDeptId(d)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="w-5 h-5" />
          Departments
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Department Form */}
        <div className="flex gap-2">
          <Select
            value={selectedDepartmentId}
            onValueChange={setSelectedDepartmentId}
          >
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a department to assign..." />
            </SelectTrigger>
            <SelectContent>
              {departmentsToAdd.length === 0 ? (
                <SelectItem value="_none" disabled>
                  No departments available
                </SelectItem>
              ) : (
                departmentsToAdd.map((dept) => (
                  <SelectItem key={getDeptId(dept)} value={getDeptId(dept)}>
                    {getDeptName(dept) || getDeptId(dept)}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Button
            onClick={handleAssignDepartment}
            disabled={adding || !selectedDepartmentId}
          >
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Assigned Departments List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : assignedDepartments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building2 className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No departments assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {assignedDepartments.map((dept) => (
              <div
                key={getDeptId(dept)}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {getDeptName(dept) || getDeptId(dept)}
                    </div>
                    {dept.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {dept.description}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setRemovingDepartment(dept)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Remove Confirmation Dialog */}
        <AlertDialog
          open={!!removingDepartment}
          onOpenChange={(open) => !open && setRemovingDepartment(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Department</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <strong>{removingDepartment?.name || removingDepartment?.departmentName || "this department"}</strong>{" "}
                from {projectName}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveDepartment}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
