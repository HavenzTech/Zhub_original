import type { PropertyHealthScore } from "../types";
import { mockProperties } from "./properties";
import { getSystemsByProperty } from "./systems";
import { getAlertsByProperty } from "./alerts";
import { getInsightsByProperty } from "./aiInsights";
import { getWorkOrdersByProperty } from "./workOrders";

export function getHealthForProperty(propertyId: string): PropertyHealthScore {
  const systems = getSystemsByProperty(propertyId);
  const alerts = getAlertsByProperty(propertyId);
  const insights = getInsightsByProperty(propertyId);
  const openWOs = getWorkOrdersByProperty(propertyId).filter((w) => w.status !== "closed");

  const systemsAvg =
    systems.length > 0
      ? systems.reduce((s, x) => s + x.healthScore, 0) / systems.length
      : 95;
  const criticalAlerts = alerts.filter((a) => a.severity === "critical" && !a.ack).length;
  const warnAlerts = alerts.filter((a) => a.severity === "warn" && !a.ack).length;
  const sensorsScore = Math.max(0, 100 - criticalAlerts * 18 - warnAlerts * 6);
  const criticalInsights = insights.filter((i) => i.severity === "critical" && i.status === "open").length;
  const aiScore = Math.max(0, 100 - criticalInsights * 15);
  const maintenanceScore = Math.max(0, 100 - openWOs.length * 4);

  const composite = Math.round(
    systemsAvg * 0.35 + sensorsScore * 0.3 + aiScore * 0.2 + maintenanceScore * 0.15
  );

  return {
    propertyId,
    score: composite,
    components: {
      systems: Math.round(systemsAvg),
      sensors: sensorsScore,
      ai: aiScore,
      maintenance: maintenanceScore,
    },
    computedAt: new Date().toISOString(),
  };
}

export function getHealthForAll(): PropertyHealthScore[] {
  return mockProperties.map((p) => getHealthForProperty(p.id as string));
}
