"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { getSensorAdapter } from "../adapters/factory";
import type { HistoryRange } from "../types";

export function useSensorHistory(sensorId: string | undefined, range: HistoryRange) {
  return useQuery({
    queryKey: sensorId
      ? propertyKeys.sensorHistory(sensorId, range)
      : ["sensor", "none", "history", range],
    enabled: !!sensorId,
    staleTime: 60_000,
    queryFn: async () => {
      if (!sensorId) return [];
      return getSensorAdapter().history(sensorId, range);
    },
  });
}
