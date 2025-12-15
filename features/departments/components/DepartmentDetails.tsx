"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Department } from "@/types/bms";
import {
  Users,
  Edit,
  DollarSign,
  TrendingUp,
  Calendar,
  Phone,
  Mail,
  Building2,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getTimeAgo,
  getBudgetUtilization,
} from "../utils/departmentHelpers";

interface DepartmentDetailsProps {
  department: Department;
  companyName?: string;
  onBack: () => void;
  onEdit: (department: Department) => void;
}

export function DepartmentDetails({
  department,
  companyName,
  onBack,
  onEdit,
}: DepartmentDetailsProps) {
  const utilization = getBudgetUtilization(
    department.budgetAllocated ?? undefined,
    department.budgetSpent ?? undefined
  );

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={onBack}>
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
                  <span className="text-gray-600">Department:</span>
                  <div className="font-medium">
                    {department.name || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Company:</span>
                  <div className="font-medium">
                    {companyName || "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(department)}>
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
                  {formatCurrency(department.budgetAllocated ?? undefined)}
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
                  {formatCurrency(department.budgetSpent ?? undefined)}
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
                  {department.createdAt ? formatDate(department.createdAt) : "N/A"}
                </div>
                <div className="text-sm text-gray-600">Created</div>
                <div className="text-xs text-gray-500">
                  Updated {department.updatedAt ? getTimeAgo(department.updatedAt) : "N/A"}
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
              <span className="text-sm text-gray-600">Department</span>
              <span className="text-sm font-medium">
                {department.name || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company</span>
              <span className="text-sm font-medium">
                {companyName || "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created At</span>
              <span className="text-sm font-medium">
                {department.createdAt ? formatDate(department.createdAt) : "N/A"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">
                {department.updatedAt ? formatDate(department.updatedAt) : "N/A"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
