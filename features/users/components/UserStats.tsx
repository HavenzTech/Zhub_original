"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { UserResponse } from "@/types/bms";
import { Users, Shield, Building2, FolderOpen, UserCheck } from "lucide-react";

interface UserStatsProps {
  users: UserResponse[];
}

export function UserStats({ users }: UserStatsProps) {
  // Count by new role hierarchy
  const adminCount = users.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  ).length;

  const deptManagerCount = users.filter((u) => u.role === "dept_manager").length;

  const projectLeadCount = users.filter((u) => u.role === "project_lead").length;

  const employeeCount = users.filter((u) => u.role === "employee").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <StatCard
        icon={<Users className="w-5 h-5 text-blue-600" />}
        iconBg="bg-blue-100"
        value={users.length.toString()}
        label="Total Users"
      />
      <StatCard
        icon={<Shield className="w-5 h-5 text-purple-600" />}
        iconBg="bg-purple-100"
        value={adminCount.toString()}
        label="Admins"
      />
      <StatCard
        icon={<Building2 className="w-5 h-5 text-teal-600" />}
        iconBg="bg-teal-100"
        value={deptManagerCount.toString()}
        label="Dept Managers"
      />
      <StatCard
        icon={<FolderOpen className="w-5 h-5 text-green-600" />}
        iconBg="bg-green-100"
        value={projectLeadCount.toString()}
        label="Project Leads"
      />
      <StatCard
        icon={<UserCheck className="w-5 h-5 text-gray-600" />}
        iconBg="bg-gray-100"
        value={employeeCount.toString()}
        label="Employees"
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
