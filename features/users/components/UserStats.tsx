"use client";

import type { UserResponse } from "@/types/bms";

interface UserStatsProps {
  users: UserResponse[];
}

export function UserStats({ users }: UserStatsProps) {
  const adminCount = users.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  ).length;

  const deptManagerCount = users.filter((u) => u.role === "dept_manager").length;

  const projectLeadCount = users.filter((u) => u.role === "project_lead").length;

  const employeeCount = users.filter((u) => u.role === "employee").length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
      {[
        { label: "Total Users", value: users.length.toString(), color: "text-blue-500" },
        { label: "Admins", value: adminCount.toString(), color: "text-violet-500" },
        { label: "Dept Managers", value: deptManagerCount.toString(), color: "text-cyan-500" },
        { label: "Project Leads", value: projectLeadCount.toString(), color: "text-emerald-500" },
        { label: "Employees", value: employeeCount.toString(), color: "text-amber-500" },
      ].map((stat) => (
        <div
          key={stat.label}
          className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700"
        >
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">{stat.label}</div>
          <div className={`text-3xl font-semibold ${stat.color}`}>{stat.value}</div>
        </div>
      ))}
    </div>
  );
}
