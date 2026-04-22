import type { AIModelConfig } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

export const mockAIModels: AIModelConfig[] = [
  ...[1, 2, 3, 4].map<AIModelConfig>((n) => ({
    id: `ai-pm-engine-${n}`,
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: `eq-engine-${n}`,
    modelType: "predictive_maintenance",
    provider: "havenz-ml",
    version: "1.4.2",
    enabled: true,
    displayName: `Predictive Maintenance — Engine ${n}`,
    params: { lookbackHours: 168, horizonDays: 30 },
  })),
  {
    id: "ai-anomaly-electrical",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-switchgear-a",
    modelType: "anomaly_detection",
    provider: "havenz-ml",
    version: "0.9.1",
    enabled: true,
    displayName: "Anomaly Detection — Electrical",
  },
  {
    id: "ai-energy-plant",
    propertyId: FLAGSHIP_PROPERTY_ID,
    modelType: "energy_forecast",
    provider: "havenz-ml",
    version: "2.1.0",
    enabled: true,
    displayName: "Plant Energy Forecast",
  },
];

export function getAIModelsByProperty(propertyId: string): AIModelConfig[] {
  return mockAIModels.filter((m) => m.propertyId === propertyId);
}
