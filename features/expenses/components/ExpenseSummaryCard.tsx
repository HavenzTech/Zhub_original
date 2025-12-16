"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import type { ProjectExpenseSummary } from "@/types/bms";

interface ExpenseSummaryCardProps {
  summary: ProjectExpenseSummary | null;
  loading?: boolean;
}

export function ExpenseSummaryCard({ summary, loading }: ExpenseSummaryCardProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Expense Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <DollarSign className="w-5 h-5" />
          Expense Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Approved */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {summary.totalApprovedFormatted || "$0.00"}
              </div>
              <div className="text-xs text-gray-600">
                {summary.approvedCount || 0} Approved
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {summary.totalPendingFormatted || "$0.00"}
              </div>
              <div className="text-xs text-gray-600">
                {summary.pendingCount || 0} Pending
              </div>
            </div>
          </div>

          {/* Rejected */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                ${(summary.totalRejectedAmount || 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">
                {summary.rejectedCount || 0} Rejected
              </div>
            </div>
          </div>

          {/* Total Expenses */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                {summary.totalExpenses || 0}
              </div>
              <div className="text-xs text-gray-600">Total Expenses</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
