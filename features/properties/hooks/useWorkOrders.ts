"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import {
  addWorkOrder,
  getWorkOrdersByProperty,
  updateWorkOrder,
} from "../mock/workOrders";
import type { MaintenanceWorkOrder } from "../types";

export function useWorkOrders(propertyId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery<MaintenanceWorkOrder[]>({
    queryKey: propertyId ? propertyKeys.workOrders(propertyId) : ["wo", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.DYNAMIC,
    queryFn: async () => (propertyId ? getWorkOrdersByProperty(propertyId) : []),
  });

  return {
    ...q,
    create: (wo: Omit<MaintenanceWorkOrder, "id" | "createdAt" | "updatedAt" | "status"> & {
      status?: MaintenanceWorkOrder["status"];
    }) => {
      const now = new Date().toISOString();
      const full: MaintenanceWorkOrder = {
        ...wo,
        id: `wo-${Date.now()}`,
        status: wo.status ?? "open",
        createdAt: now,
        updatedAt: now,
      };
      addWorkOrder(full);
      if (propertyId) qc.invalidateQueries({ queryKey: propertyKeys.workOrders(propertyId) });
      return full;
    },
    patch: (id: string, patch: Partial<MaintenanceWorkOrder>) => {
      updateWorkOrder(id, patch);
      if (propertyId) qc.invalidateQueries({ queryKey: propertyKeys.workOrders(propertyId) });
    },
  };
}
