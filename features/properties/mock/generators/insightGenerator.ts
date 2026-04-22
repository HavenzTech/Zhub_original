import type { AIInsight } from "../../types";
import { addInsight } from "../aiInsights";

const templates: Array<Omit<AIInsight, "id" | "predictedAt">> = [
  {
    propertyId: "prop-brahms-hpp",
    equipmentId: "eq-engine-3",
    modelId: "ai-pm-engine-3",
    modelType: "predictive_maintenance",
    severity: "warn",
    confidence: 0.74,
    title: "Engine 3 — oil viscosity trending low",
    summary: "Oil pressure sagging 4% over 96 h; sample recommended.",
    recommendation: "Collect oil sample within 72 h.",
    relatedSensorIds: ["sen-eng3-oil-p"],
    etaDays: 21,
    status: "open",
  },
  {
    propertyId: "prop-brahms-hpp",
    equipmentId: "eq-hx-2",
    modelId: "ai-anomaly-electrical",
    modelType: "anomaly_detection",
    severity: "info",
    confidence: 0.66,
    title: "HX-2 — mild approach temperature rise",
    summary: "Slow fouling pattern, within seasonal envelope.",
    recommendation: "Trend and reassess in 30 days.",
    relatedSensorIds: [],
    status: "open",
  },
];

export function generateFreshInsight(): AIInsight {
  const t = templates[Math.floor(Math.random() * templates.length)];
  const insight: AIInsight = {
    ...t,
    id: `ins-gen-${Date.now()}`,
    predictedAt: new Date().toISOString(),
  };
  addInsight(insight);
  return insight;
}
