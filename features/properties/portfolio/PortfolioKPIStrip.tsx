"use client";

import type { PortfolioSummary } from "../hooks/useMyProperties";
import { formatCurrency } from "../utils/propertyHelpers";
import { AlertTriangle, Building2, DollarSign, Gauge, Wrench, Zap } from "lucide-react";

export function PortfolioKPIStrip({ summary }: { summary: PortfolioSummary["totals"] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
      <KPI icon={<Building2 className="w-4 h-4" />} label="Properties" value={String(summary.count)} tone="cyan" />
      <KPI icon={<DollarSign className="w-4 h-4" />} label="Total Value" value={formatCurrency(summary.totalValue)} tone="emerald" />
      <KPI icon={<DollarSign className="w-4 h-4" />} label="Op-Cost / mo" value={formatCurrency(summary.totalOperatingCost)} tone="violet" />
      <KPI icon={<Gauge className="w-4 h-4" />} label="Avg Health" value={`${summary.avgHealth}`} tone={summary.avgHealth >= 85 ? "emerald" : summary.avgHealth >= 70 ? "amber" : "red"} />
      <KPI icon={<AlertTriangle className="w-4 h-4" />} label="Open Alerts" value={`${summary.openAlerts}${summary.criticalAlerts > 0 ? ` · ${summary.criticalAlerts} crit` : ""}`} tone={summary.criticalAlerts > 0 ? "red" : summary.openAlerts > 0 ? "amber" : "stone"} />
      <KPI icon={<Wrench className="w-4 h-4" />} label="Open WOs" value={String(summary.openWorkOrders)} tone="amber" />
    </div>
  );
}

const tones: Record<string, string> = {
  cyan: "text-accent-cyan bg-accent-cyan/10",
  emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
  amber: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  red: "text-red-600 dark:text-red-400 bg-red-500/10",
  violet: "text-violet-600 dark:text-violet-400 bg-violet-500/10",
  stone: "text-stone-600 dark:text-stone-400 bg-stone-500/10",
};

function KPI({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: string }) {
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-3">
      <div className={`inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 text-[10px] uppercase tracking-wider ${tones[tone]}`}>
        {icon} {label}
      </div>
      <div className="mt-1.5 text-lg font-bold tabular-nums text-stone-900 dark:text-stone-50">{value}</div>
    </div>
  );
}
