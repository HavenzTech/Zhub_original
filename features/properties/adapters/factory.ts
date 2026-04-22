import { getDataMode } from "../mock/mode";
import type { AIModelType } from "../types";
import type { AIModelAdapter, SensorStream } from "./contracts";
import { getMockSensorAdapter } from "./MockSensorAdapter";
import { SignalRSensorAdapter } from "./SignalRSensorAdapter";
import { AnomalyDetectionAdapter } from "./AnomalyDetectionAdapter";
import { EnergyForecastAdapter } from "./EnergyForecastAdapter";
import { MockAIAdapter } from "./MockAIAdapter";
import { PredictiveMaintenanceAdapter } from "./PredictiveMaintenanceAdapter";

let sensorSingleton: SensorStream | null = null;
export function getSensorAdapter(): SensorStream {
  if (sensorSingleton) return sensorSingleton;
  sensorSingleton =
    getDataMode() === "live" ? new SignalRSensorAdapter() : getMockSensorAdapter();
  return sensorSingleton;
}

const aiRegistry: Record<AIModelType, () => AIModelAdapter> = {
  predictive_maintenance: () => new PredictiveMaintenanceAdapter(),
  anomaly_detection: () => new AnomalyDetectionAdapter(),
  energy_forecast: () => new EnergyForecastAdapter(),
  occupancy: () => new MockAIAdapter("occupancy"),
};

const aiCache = new Map<AIModelType, AIModelAdapter>();
export function getAIAdapter(modelType: AIModelType): AIModelAdapter {
  const cached = aiCache.get(modelType);
  if (cached) return cached;
  const a = aiRegistry[modelType]();
  aiCache.set(modelType, a);
  return a;
}

export function resetAdapterSingletons(): void {
  sensorSingleton = null;
  aiCache.clear();
}
