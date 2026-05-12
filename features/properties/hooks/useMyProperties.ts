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
import { bmsApi } from "@/lib/services/bmsApi";
import { computeHealthScore, metricToAlert } from "../adapters/liveAdapters";
import type { Property } from "@/types/bms";
import type { PropertyAlert, PropertyHealthScore } from "../types";

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
      if (isMockMode()) return buildPortfolio();

      // Fetch all three in parallel; each call degrades gracefully on failure
      const [propertiesRaw, metricsRaw, tasksRaw] = await Promise.all([
        bmsApi.properties.getAll().catch(() => []),
        bmsApi.iotMetrics.getAlerts().catch(() => []),
        bmsApi.tasks.getAll({}).catch(() => []),
      ]);

      const properties: Property[] = (
        Array.isArray(propertiesRaw) ? propertiesRaw : (propertiesRaw as any)?.data ?? []
      );
      const allAlerts: PropertyAlert[] = (
        Array.isArray(metricsRaw) ? metricsRaw : (metricsRaw as any)?.data ?? []
      ).map(metricToAlert).filter((a: PropertyAlert | null): a is PropertyAlert => a !== null);
      const allTasks: any[] = (
        Array.isArray(tasksRaw) ? tasksRaw : (tasksRaw as any)?.data ?? []
      );

      const entries: PortfolioEntry[] = properties.map((property) => {
        const pid = property.id as string;
        const alerts = allAlerts.filter((a) => a.propertyId === pid);
        const openWOs = allTasks.filter(
          (t) => t.propertyId === pid && t.status !== "completed" && t.status !== "cancelled"
        );
        const health = computeHealthScore(pid, [], alerts);
        health.components.maintenance = Math.max(0, 100 - openWOs.length * 5);

        return {
          property,
          health,
          openAlerts: alerts.filter((a) => !a.ack).length,
          criticalAlerts: alerts.filter((a) => !a.ack && a.severity === "critical").length,
          openWorkOrders: openWOs.length,
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
        { count: 0, totalValue: 0, totalOperatingCost: 0, avgHealth: 0, openAlerts: 0, criticalAlerts: 0, openWorkOrders: 0, atRisk: 0 }
      );
      if (totals.count > 0) totals.avgHealth = Math.round(totals.avgHealth / totals.count);

      return { entries, totals };
    },
  });
}
