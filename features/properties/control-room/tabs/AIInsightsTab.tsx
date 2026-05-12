"use client";

import { useMemo } from "react";
import { Box, CheckCircle2, Sparkles, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AIModelConfig, Equipment, AIInsight } from "../../types";
import { SeverityPill } from "../shared/SeverityPill";
import { EmptyState } from "../shared/EmptyState";
import { useAIInsights } from "../../hooks/useAIInsights";

interface Props {
  propertyId: string;
  models: AIModelConfig[];
  equipment: Equipment[];
  onFocusIn3D: (equipmentId: string) => void;
  onCreateWorkOrder: (opts: { equipmentId?: string; insightId?: string; title?: string }) => void;
}

export function AIInsightsTab({ propertyId, models, equipment, onFocusIn3D, onCreateWorkOrder }: Props) {
  const { data: insights = [], acknowledge } = useAIInsights(propertyId);

  const grouped = useMemo(() => {
    const g: Record<"critical" | "warn" | "info", AIInsight[]> = { critical: [], warn: [], info: [] };
    for (const i of insights) g[i.severity].push(i);
    return g;
  }, [insights]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-accent-cyan" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Active Models · {models.filter((m) => m.enabled).length}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {models.map((m) => (
            <div key={m.id} className="text-xs rounded-md border border-stone-200 dark:border-stone-800 px-2 py-1 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${m.enabled ? "bg-emerald-500" : "bg-stone-400"}`} />
              <span className="font-medium text-stone-700 dark:text-stone-300">{m.displayName}</span>
              <span className="text-[10px] text-stone-500 dark:text-stone-400">v{m.version}</span>
            </div>
          ))}
          {models.length === 0 && <span className="text-xs text-stone-500 dark:text-stone-400">No AI models configured.</span>}
        </div>
      </div>

      {(["critical", "warn", "info"] as const).map((sev) => (
        grouped[sev].length > 0 && (
          <section key={sev} className="space-y-2">
            <h4 className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 dark:text-stone-400">
              <SeverityPill severity={sev} />
              {grouped[sev].length} insight{grouped[sev].length !== 1 ? "s" : ""}
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {grouped[sev].map((i) => {
                const eq = equipment.find((e) => e.id === i.equipmentId);
                return (
                  <div key={i.id} className="rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h5 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{i.title}</h5>
                        <div className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-2 mt-0.5">
                          {eq && <span>{eq.name}</span>}
                          <span>conf {(i.confidence * 100).toFixed(0)}%</span>
                          {i.etaDays !== undefined && <span>ETA ~{i.etaDays}d</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {i.status !== "acknowledged" && i.status !== "resolved" && (
                          <Button variant="ghost" size="sm" onClick={() => acknowledge(i.id)} title="Acknowledge">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400">{i.summary}</p>
                    <div className="text-xs rounded-md bg-stone-100 dark:bg-stone-900 p-2">
                      <div className="text-[10px] uppercase tracking-wider text-stone-500 dark:text-stone-400 mb-0.5">Recommendation</div>
                      {i.recommendation}
                    </div>
                    <div className="flex items-center gap-2">
                      {eq && (
                        <Button size="sm" variant="outline" onClick={() => onFocusIn3D(eq.id)}>
                          <Box className="w-3.5 h-3.5 mr-1.5" />
                          Focus in 3D
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => onCreateWorkOrder({ equipmentId: i.equipmentId, insightId: i.id, title: i.title })}>
                        <Wrench className="w-3.5 h-3.5 mr-1.5" />
                        Create WO
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )
      ))}

      {insights.length === 0 && (
        models.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="w-5 h-5" />}
            title="No AI models configured"
            description="Enable predictive-maintenance, anomaly-detection, or energy-forecast models to start generating insights against this property's telemetry."
            actionLabel="Configure AI Model"
            onAction={() => {}}
          />
        ) : (
          <EmptyState
            icon={<Sparkles className="w-5 h-5" />}
            title="No insights yet"
            description="Models are active — new predictions will appear here as data streams in."
          />
        )
      )}
    </div>
  );
}
