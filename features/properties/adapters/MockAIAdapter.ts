import type { AIInsight, AIModelType } from "../types";
import { getInsightsByProperty } from "../mock/aiInsights";
import { generateFreshInsight } from "../mock/generators/insightGenerator";
import type { AIModelAdapter, Subscription } from "./contracts";

export class MockAIAdapter implements AIModelAdapter {
  constructor(public readonly modelType: AIModelType) {}

  async listInsights(propertyId: string): Promise<AIInsight[]> {
    return getInsightsByProperty(propertyId).filter(
      (i) => i.modelType === this.modelType
    );
  }

  streamInsights(
    propertyId: string,
    onInsight: (i: AIInsight) => void
  ): Subscription {
    if (typeof window === "undefined") {
      return { unsubscribe: () => {} };
    }
    const timer = setInterval(() => {
      if (Math.random() < 0.25) {
        const fresh = generateFreshInsight();
        if (
          fresh.propertyId === propertyId &&
          fresh.modelType === this.modelType
        ) {
          onInsight(fresh);
        }
      }
    }, 45_000);
    return { unsubscribe: () => clearInterval(timer) };
  }

  async runInference(
    modelId: string,
    _payload?: Record<string, unknown>
  ): Promise<AIInsight[]> {
    return [
      {
        id: `ins-adhoc-${Date.now()}`,
        propertyId: "",
        modelId,
        modelType: this.modelType,
        severity: "info",
        confidence: 0.6,
        title: "Ad-hoc inference (mock)",
        summary: "Mock adapter returned a synthetic result.",
        recommendation: "—",
        predictedAt: new Date().toISOString(),
        relatedSensorIds: [],
        status: "open",
      },
    ];
  }
}
