import type { HistoryRange } from "@/features/properties/types";

export const propertyKeys = {
  all: ["property"] as const,
  mine: ["property", "mine"] as const,
  portfolio: ["property", "portfolio"] as const,
  detail: (id: string) => ["property", id] as const,
  systems: (id: string) => ["property", id, "systems"] as const,
  zones: (id: string) => ["property", id, "zones"] as const,
  equipment: (id: string) => ["property", id, "equipment"] as const,
  sensors: (id: string) => ["property", id, "sensors"] as const,
  stakeholders: (id: string) => ["property", id, "stakeholders"] as const,
  aiModels: (id: string) => ["property", id, "aiModels"] as const,
  insights: (id: string) => ["property", id, "insights"] as const,
  workOrders: (id: string) => ["property", id, "workOrders"] as const,
  alerts: (id: string) => ["property", id, "alerts"] as const,
  health: (id: string) => ["property", id, "health"] as const,
  financials: (id: string) => ["property", id, "financials"] as const,
  sensorLatest: (sensorId: string) => ["sensor", sensorId, "latest"] as const,
  sensorHistory: (sensorId: string, range: HistoryRange) =>
    ["sensor", sensorId, "history", range] as const,
} as const;
