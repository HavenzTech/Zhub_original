"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import { getFinancialsByProperty } from "../mock/financials";
import type { FinancialsMonthly } from "../types";

export function usePropertyFinancials(propertyId: string | undefined) {
  return useQuery<FinancialsMonthly[]>({
    queryKey: propertyId ? propertyKeys.financials(propertyId) : ["fin", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.STATIC,
    queryFn: async () => (propertyId ? getFinancialsByProperty(propertyId) : []),
  });
}
