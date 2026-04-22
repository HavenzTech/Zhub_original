import type { FinancialsMonthly } from "../types";
import { mockProperties } from "./properties";

function genSeries(baseValue: number, baseCost: number, baseRevenue: number): FinancialsMonthly[] {
  const now = new Date("2026-04-01T00:00:00Z");
  const out: FinancialsMonthly[] = [];
  for (let i = 23; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCMonth(d.getUTCMonth() - i);
    const drift = 1 + (23 - i) * 0.004;
    const season = 1 + 0.08 * Math.sin(((23 - i) / 12) * Math.PI * 2);
    const noise = 0.97 + ((i * 37) % 60) / 1000;
    const cost = Math.round(baseCost * season * noise);
    out.push({
      month: d.toISOString().slice(0, 7),
      value: Math.round(baseValue * drift),
      operatingCost: cost,
      revenue: Math.round(baseRevenue * season * noise),
      forecastCost: Math.round(baseCost * season * 0.98),
    });
  }
  return out;
}

const cache = new Map<string, FinancialsMonthly[]>();

export function getFinancialsByProperty(propertyId: string): FinancialsMonthly[] {
  if (cache.has(propertyId)) return cache.get(propertyId)!;
  const p = mockProperties.find((x) => x.id === propertyId);
  if (!p) return [];
  const value = (p.currentValue as number) || 1_000_000;
  const cost = (p.monthlyOperatingCosts as number) || 10_000;
  const revenue = cost * 1.35;
  const series = genSeries(value, cost, revenue);
  cache.set(propertyId, series);
  return series;
}
