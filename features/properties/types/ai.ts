export type AIModelType =
  | "predictive_maintenance"
  | "anomaly_detection"
  | "energy_forecast"
  | "occupancy";

export interface AIModelConfig {
  id: string;
  propertyId: string;
  equipmentId?: string;
  modelType: AIModelType;
  provider: string;
  version: string;
  params?: Record<string, unknown>;
  enabled: boolean;
  displayName: string;
}

export type InsightSeverity = "info" | "warn" | "critical";
export type InsightStatus = "open" | "acknowledged" | "resolved";

export interface AIInsight {
  id: string;
  propertyId: string;
  equipmentId?: string;
  modelId: string;
  modelType: AIModelType;
  severity: InsightSeverity;
  confidence: number;
  title: string;
  summary: string;
  recommendation: string;
  predictedAt: string;
  etaDays?: number;
  relatedSensorIds: string[];
  status: InsightStatus;
}
