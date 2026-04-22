"use client";

import type { Property } from "@/types/bms";
import type {
  AIInsight,
  MaintenanceWorkOrder,
  PropertyAlert,
  PropertyHealthScore,
} from "../../types";
import { PropertyDetails } from "../../components/PropertyDetails";
import { SeverityPill } from "../shared/SeverityPill";
import { Timestamp } from "../shared/Timestamp";
import { formatCurrency } from "../../utils/propertyHelpers";
import { AlertTriangle, Sparkles, Wrench } from "lucide-react";

interface OverviewTabProps {
  property: Property;
  health: PropertyHealthScore;
  alerts: PropertyAlert[];
  insights: AIInsight[];
  workOrders: MaintenanceWorkOrder[];
  onEdit: () => void;
}

export function OverviewTab({ property, health, alerts, insights, workOrders, onEdit }: OverviewTabProps) {
  const openAlerts = alerts.filter((a) => !a.ack);
  const openInsights = insights.filter((i) => i.status === "open");
  const openWOs = workOrders.filter((w) => w.status !== "closed");

  const activity = [
    ...openAlerts.slice(0, 6).map((a) => ({
      ts: a.ts,
      icon: "alert" as const,
      severity: a.severity,
      label: a.message,
    })),
    ...openInsights.slice(0, 4).map((i) => ({
      ts: i.predictedAt,
      icon: "insight" as const,
      severity: i.severity,
      label: i.title,
    })),
    ...openWOs.slice(0, 4).map((w) => ({
      ts: w.updatedAt,
      icon: "wo" as const,
      severity: (w.priority === "urgent" ? "critical" : w.priority === "high" ? "warn" : "info") as "info" | "warn" | "critical",
      label: w.title,
    })),
  ]
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Stat label="Current Value" value={formatCurrency(property.currentValue)} accent="emerald" />
        <Stat label="Monthly Op-Cost" value={formatCurrency(property.monthlyOperatingCosts)} accent="cyan" />
        <Stat label="Open Alerts" value={String(openAlerts.length)} accent={openAlerts.some((a) => a.severity === "critical") ? "red" : "amber"} />
        <Stat label="Open WOs" value={String(openWOs.length)} accent="violet" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <PropertyDetails
            property={property}
            onEdit={onEdit}
          />
        </div>
        <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-4">Recent Activity</h3>
          <ul className="space-y-2.5">
            {activity.length === 0 && (
              <li className="text-xs text-stone-500 dark:text-stone-400">Nothing to report.</li>
            )}
            {activity.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-xs">
                <span className="mt-0.5">
                  {a.icon === "alert" ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  ) : a.icon === "insight" ? (
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                  ) : (
                    <Wrench className="w-3.5 h-3.5 text-violet-500" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <SeverityPill severity={a.severity} />
                    <span className="text-[10px] text-stone-500 dark:text-stone-400">
                      <Timestamp ts={a.ts} property={property} mode="datetime" />
                    </span>
                  </div>
                  <p className="text-stone-700 dark:text-stone-300 mt-0.5">{a.label}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Health Breakdown</h3>
          <span className="text-xs text-stone-500 dark:text-stone-400">computed {new Date(health.computedAt).toLocaleTimeString()}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {(["systems", "sensors", "ai", "maintenance"] as const).map((k) => (
            <HealthBar key={k} label={k} value={health.components[k]} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: "emerald" | "cyan" | "amber" | "red" | "violet" }) {
  const toneMap: Record<string, string> = {
    emerald: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/30",
    cyan: "text-accent-cyan bg-accent-cyan/10",
    amber: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/30",
    red: "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-950/30",
    violet: "text-violet-600 dark:text-violet-400 bg-violet-100 dark:bg-violet-950/30",
  };
  return (
    <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
      <div className={`inline-block text-[10px] uppercase tracking-wider rounded-md px-1.5 py-0.5 ${toneMap[accent]}`}>{label}</div>
      <div className="mt-2 text-2xl font-bold text-stone-900 dark:text-stone-50 tabular-nums">{value}</div>
    </div>
  );
}

function HealthBar({ label, value }: { label: string; value: number }) {
  const tone = value >= 85 ? "bg-emerald-500" : value >= 70 ? "bg-amber-500" : "bg-red-500";
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1.5">
        <span className="uppercase tracking-wide text-stone-500 dark:text-stone-400">{label}</span>
        <span className="tabular-nums font-semibold text-stone-900 dark:text-stone-50">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-stone-200 dark:bg-stone-800 overflow-hidden">
        <div className={`h-full ${tone} transition-all`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
      </div>
    </div>
  );
}
