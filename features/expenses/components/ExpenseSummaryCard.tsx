"use client";

import type { ProjectExpenseSummary } from "@/types/bms";

interface ExpenseSummaryCardProps {
  summary: ProjectExpenseSummary | null;
  loading?: boolean;
}

export function ExpenseSummaryCard({ summary, loading }: ExpenseSummaryCardProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="animate-pulse space-y-3">
              <div className="h-3 bg-stone-200 dark:bg-stone-700 rounded w-1/2"></div>
              <div className="h-7 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[
        {
          label: "Approved",
          value: `$${(summary.totalApprovedAmount || 0).toLocaleString()}`,
          sub: `${summary.approvedCount || 0} expenses`,
        },
        {
          label: "Pending",
          value: `$${(summary.totalPendingAmount || 0).toLocaleString()}`,
          sub: `${summary.pendingCount || 0} expenses`,
        },
        {
          label: "Rejected",
          value: `$${(summary.totalRejectedAmount || 0).toLocaleString()}`,
          sub: `${summary.rejectedCount || 0} expenses`,
        },
        {
          label: "Total Expenses",
          value: `${summary.totalExpenses || 0}`,
        },
      ].map((stat) => (
        <div key={stat.label} className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">{stat.label}</div>
          <div className="text-3xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
          {stat.sub && (
            <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">{stat.sub}</div>
          )}
        </div>
      ))}
    </div>
  );
}
