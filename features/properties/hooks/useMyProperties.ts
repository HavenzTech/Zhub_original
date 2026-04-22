"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import {
  getAlertsByProperty,
  getHealthForAll,
  getWorkOrdersByProperty,
  isMockMode,
  mockProperties,
} from "../mock";
import type { Property } from "@/types/bms";
import type { PropertyHealthScore } from "../types";

export interface PortfolioEntry {
  property: Property;
  health: PropertyHealthScore;
  openAlerts: number;
  criticalAlerts: number;
  openWorkOrders: number;
}

export interface PortfolioSummary {
  entries: PortfolioEntry[];
  totals: {
    count: number;
    totalValue: number;
    totalOperatingCost: number;
    avgHealth: number;
    openAlerts: number;
    criticalAlerts: number;
    openWorkOrders: number;
    atRisk: number;
  };
}

function buildPortfolio(): PortfolioSummary {
  const healths = getHealthForAll();

  const entries: PortfolioEntry[] = mockProperties.map((property) => {
    const pid = property.id as string;
    const health = healths.find((h) => h.propertyId === pid)!;
    const alerts = getAlertsByProperty(pid);
    const wos = getWorkOrdersByProperty(pid).filter((w) => w.status !== "closed");
    return {
      property,
      health,
      openAlerts: alerts.filter((a) => !a.ack).length,
      criticalAlerts: alerts.filter((a) => !a.ack && a.severity === "critical").length,
      openWorkOrders: wos.length,
    };
  });

  const totals = entries.reduce(
    (acc, e) => {
      acc.count += 1;
      acc.totalValue += (e.property.currentValue as number) || 0;
      acc.totalOperatingCost += (e.property.monthlyOperatingCosts as number) || 0;
      acc.avgHealth += e.health.score;
      acc.openAlerts += e.openAlerts;
      acc.criticalAlerts += e.criticalAlerts;
      acc.openWorkOrders += e.openWorkOrders;
      if (e.health.score < 75 || e.criticalAlerts > 0) acc.atRisk += 1;
      return acc;
    },
    {
      count: 0,
      totalValue: 0,
      totalOperatingCost: 0,
      avgHealth: 0,
      openAlerts: 0,
      criticalAlerts: 0,
      openWorkOrders: 0,
      atRisk: 0,
    }
  );
  if (totals.count > 0) totals.avgHealth = Math.round(totals.avgHealth / totals.count);

  return { entries, totals };
}

export function useMyProperties() {
  return useQuery<PortfolioSummary>({
    queryKey: propertyKeys.mine,
    staleTime: STALE_TIMES.STANDARD,
    queryFn: async () => {
      if (!isMockMode()) {
        throw new Error(
          "Live portfolio fetch is not wired. Set NEXT_PUBLIC_PROPERTIES_DATA_MODE=mock."
        );
      }
      return buildPortfolio();
    },
  });
}
