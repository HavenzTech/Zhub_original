"use client";

import { Department } from "@/types/bms";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Departments", value: departments.length.toString() },
        { label: "Total Budget", value: formatCurrency(totalBudget) },
        { label: "Total Spent", value: formatCurrency(totalSpent) },
        { label: "Avg Utilization", value: `${avgUtilization}%` },
      ].map((stat) => (
        <div
          key={stat.label}
          className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700"
        >
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">{stat.label}</div>
          <div className="text-3xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
