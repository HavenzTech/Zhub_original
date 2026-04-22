"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import { getAIAdapter } from "../adapters/factory";
import { getInsightsByProperty, updateInsightStatus } from "../mock/aiInsights";
import type { AIInsight, AIModelType } from "../types";

const MODEL_TYPES: AIModelType[] = [
  "predictive_maintenance",
  "anomaly_detection",
  "energy_forecast",
];

export function useAIInsights(propertyId: string | undefined) {
  const qc = useQueryClient();

  const q = useQuery<AIInsight[]>({
    queryKey: propertyId ? propertyKeys.insights(propertyId) : ["insights", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.DYNAMIC,
    queryFn: async () => {
      if (!propertyId) return [];
      return getInsightsByProperty(propertyId);
    },
  });

  useEffect(() => {
    if (!propertyId) return;
    const subs = MODEL_TYPES.map((t) =>
      getAIAdapter(t).streamInsights(propertyId, () => {
        qc.invalidateQueries({ queryKey: propertyKeys.insights(propertyId) });
      })
    );
    return () => subs.forEach((s) => s.unsubscribe());
  }, [propertyId, qc]);

  return {
    ...q,
    acknowledge: (id: string) => {
      updateInsightStatus(id, "acknowledged");
      if (propertyId) qc.invalidateQueries({ queryKey: propertyKeys.insights(propertyId) });
    },
    resolve: (id: string) => {
      updateInsightStatus(id, "resolved");
      if (propertyId) qc.invalidateQueries({ queryKey: propertyKeys.insights(propertyId) });
    },
  };
}
