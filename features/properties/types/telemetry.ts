export type SensorQuality = "good" | "stale" | "bad";

export type SensorStatus = "nominal" | "warning" | "critical" | "offline";

export interface Sensor {
  id: string;
  propertyId: string;
  equipmentId?: string;
  zoneId?: string;
  key: string;
  label: string;
  unit: string;
  min?: number;
  max?: number;
  warnMin?: number;
  warnMax?: number;
  critMin?: number;
  critMax?: number;
  critical: boolean;
  sampleHz: number;
  tags?: string[];
}

export interface SensorReading {
  sensorId: string;
  ts: number;
  value: number;
  quality: SensorQuality;
}

export interface SensorSnapshot {
  sensor: Sensor;
  latest?: SensorReading;
  status: SensorStatus;
  sparkline: number[];
}

export type AlertSource = "threshold" | "ai" | "manual";
export type AlertSeverity = "info" | "warn" | "critical";

export interface PropertyAlert {
  id: string;
  propertyId: string;
  source: AlertSource;
  severity: AlertSeverity;
  sensorId?: string;
  insightId?: string;
  equipmentId?: string;
  message: string;
  ts: string;
  ack: boolean;
}

export type HistoryRange = "1h" | "24h" | "7d" | "30d";
