"use client";

import { Project } from "@/types/bms";
import { formatCurrency } from "../utils/projectHelpers";

interface ProjectStatsProps {
  projects: Project[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.budgetAllocated || 0),
    0
  );

  const activeCount = projects.filter((p) => p.status === "active").length;

  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projects.length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        { label: "Total Projects", value: projects.length.toString() },
        { label: "Active", value: activeCount.toString() },
        { label: "Total Budget", value: formatCurrency(totalBudget) },
        { label: "Avg Progress", value: `${avgProgress}%` },
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
