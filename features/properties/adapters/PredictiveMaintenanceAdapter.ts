import type { AIInsight } from "../types";
import { MockAIAdapter } from "./MockAIAdapter";
import { getInsightsByProperty } from "../mock/aiInsights";
import type { Subscription } from "./contracts";

export class PredictiveMaintenanceAdapter extends MockAIAdapter {
  constructor() {
    super("predictive_maintenance");
  }

  override async listInsights(propertyId: string): Promise<AIInsight[]> {
    return getInsightsByProperty(propertyId).filter(
      (i) => i.modelType === "predictive_maintenance"
    );
  }

  override streamInsights(
    propertyId: string,
    onInsight: (i: AIInsight) => void
  ): Subscription {
    return super.streamInsights(propertyId, onInsight);
  }
}
