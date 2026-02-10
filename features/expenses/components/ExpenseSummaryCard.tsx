"use client";

// Card replaced with plain divs for consistent styling
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import type { ProjectExpenseSummary } from "@/types/bms";

interface ExpenseSummaryCardProps {
  summary: ProjectExpenseSummary | null;
  loading?: boolean;
}

export function ExpenseSummaryCard({ summary, loading }: ExpenseSummaryCardProps) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
            <DollarSign className="w-5 h-5" />
            Expense Summary
          </h3>
        </div>
        <div className="p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-3/4"></div>
            <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
        <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
          <DollarSign className="w-5 h-5" />
          Expense Summary
        </h3>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Approved */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {summary.totalApprovedFormatted || "$0.00"}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">
                {summary.approvedCount || 0} Approved
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {summary.totalPendingFormatted || "$0.00"}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">
                {summary.pendingCount || 0} Pending
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-950/30 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                ${(summary.totalRejectedAmount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">
                {summary.rejectedCount || 0} Rejected
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-cyan/10 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {summary.totalExpenses || 0}
              </div>
              <div className="text-xs text-stone-600 dark:text-stone-400">Total Expenses</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
