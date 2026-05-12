import type { AIInsight } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

const NOW = new Date("2026-04-22T09:00:00Z").toISOString();

const seed: AIInsight[] = [
  {
    id: "ins-1",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-engine-2",
    modelId: "ai-pm-engine-2",
    modelType: "predictive_maintenance",
    severity: "critical",
    confidence: 0.87,
    title: "Engine 2 — bearing failure predicted in ~14 days",
    summary:
      "Vibration amplitude on Engine 2 has trended +12% over 7 days with a shift into the 3–5 kHz band characteristic of early bearing race defects. Bearing temperature is co-trending.",
    recommendation:
      "Schedule inspection within 10 days. Order replacement bearing set. Reduce load to 80% until serviced.",
    predictedAt: NOW,
    etaDays: 14,
    relatedSensorIds: ["sen-eng2-vib-x", "sen-eng2-vib-y", "sen-eng2-bearing-t"],
    status: "open",
  },
  {
    id: "ins-2",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-engine-1",
    modelId: "ai-pm-engine-1",
    modelType: "predictive_maintenance",
    severity: "info",
    confidence: 0.92,
    title: "Engine 1 — within nominal envelope",
    summary: "All monitored channels within 1σ of baseline.",
    recommendation: "No action. Next full inspection due 2026-07-01.",
    predictedAt: NOW,
    relatedSensorIds: ["sen-eng1-vib-x"],
    status: "open",
  },
  {
    id: "ins-3",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-switchgear-a",
    modelId: "ai-anomaly-electrical",
    modelType: "anomaly_detection",
    severity: "warn",
    confidence: 0.71,
    title: "Switchgear A — intermittent harmonic distortion",
    summary:
      "THD exceeds 5% during peak load windows (~16:00–19:00). Pattern correlates with Engine 3 loading.",
    recommendation: "Review power-factor correction bank; re-balance loads.",
    predictedAt: NOW,
    relatedSensorIds: ["sen-switchgear-temp"],
    status: "open",
  },
  {
    id: "ins-4",
    propertyId: FLAGSHIP_PROPERTY_ID,
    modelId: "ai-energy-plant",
    modelType: "energy_forecast",
    severity: "info",
    confidence: 0.94,
    title: "Plant output forecast +3.1% next week",
    summary: "Cold-snap forecast raises CHP demand; generation to rise 3.1%.",
    recommendation: "Confirm fuel supply buffer ≥ 5 days.",
    predictedAt: NOW,
    relatedSensorIds: [],
    status: "open",
  },
];

const store: AIInsight[] = [...seed];

export function getInsightsByProperty(propertyId: string): AIInsight[] {
  return store.filter((i) => i.propertyId === propertyId);
}

export function getInsightById(id: string): AIInsight | undefined {
  return store.find((i) => i.id === id);
}

export function updateInsightStatus(id: string, status: AIInsight["status"]): void {
  const i = store.find((x) => x.id === id);
  if (i) i.status = status;
}

export function addInsight(i: AIInsight): void {
  store.unshift(i);
}

export function allInsights(): AIInsight[] {
  return store;
}
