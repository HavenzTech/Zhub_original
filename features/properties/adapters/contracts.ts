import type {
  AIInsight,
  AIModelType,
  HistoryRange,
  SensorReading,
} from "../types";

export interface Subscription {
  unsubscribe(): void;
}

export interface SensorStream {
  subscribe(
    propertyId: string,
    sensorIds: string[],
    onReading: (reading: SensorReading) => void
  ): Subscription;
  latest(sensorIds: string[]): Promise<Record<string, SensorReading>>;
  history(sensorId: string, range: HistoryRange): Promise<SensorReading[]>;
}

export interface AIModelAdapter {
  readonly modelType: AIModelType;
  listInsights(propertyId: string): Promise<AIInsight[]>;
  streamInsights(
    propertyId: string,
    onInsight: (insight: AIInsight) => void
  ): Subscription;
  runInference(
    modelId: string,
    payload?: Record<string, unknown>
  ): Promise<AIInsight[]>;
}

export class NotImplementedError extends Error {
  constructor(what: string) {
    super(`${what} not implemented (live mode is not wired yet)`);
    this.name = "NotImplementedError";
  }
}
