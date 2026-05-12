"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import { getHealthForProperty } from "../mock/health";
import type { PropertyHealthScore } from "../types";

export function usePropertyHealth(propertyId: string | undefined) {
  return useQuery<PropertyHealthScore | null>({
    queryKey: propertyId ? propertyKeys.health(propertyId) : ["health", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.DYNAMIC,
    queryFn: async () =>
      propertyId ? getHealthForProperty(propertyId) : null,
  });
}
