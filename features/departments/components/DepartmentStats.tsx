"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Department } from "@/types/bms";
import { Users, DollarSign, TrendingUp, Calendar } from "lucide-react";
import { formatCurrency } from "../utils/departmentHelpers";

interface DepartmentStatsProps {
  departments: Department[];
}

export function DepartmentStats({ departments }: DepartmentStatsProps) {
  const totalBudget = departments.reduce(
    (sum, dept) => sum + (dept.budgetAllocated || 0),
    0
  );

  const totalSpent = departments.reduce(
    (sum, dept) => sum + (dept.budgetSpent || 0),
    0
  );

  const avgUtilization =
    departments.length > 0
      ? Math.round(
          departments.reduce((sum, dept) => {
            const allocated = dept.budgetAllocated || 0;
            const spent = dept.budgetSpent || 0;
            return sum + (allocated > 0 ? (spent / allocated) * 100 : 0);
          }, 0) / departments.length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={<Users className="w-5 h-5 text-purple-600" />}
        iconBg="bg-purple-100"
        value={departments.length.toString()}
        label="Total Departments"
      />
      <StatCard
        icon={<DollarSign className="w-5 h-5 text-green-600" />}
        iconBg="bg-green-100"
        value={formatCurrency(totalBudget)}
        label="Total Budget"
      />
      <StatCard
        icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
        iconBg="bg-blue-100"
        value={formatCurrency(totalSpent)}
        label="Total Spent"
      />
      <StatCard
        icon={<Calendar className="w-5 h-5 text-orange-600" />}
        iconBg="bg-orange-100"
        value={`${avgUtilization}%`}
        label="Avg Utilization"
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
