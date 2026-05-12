/**
 * liveAdapters.ts
 *
 * Maps backend API DTOs to the frontend domain types used by the
 * properties control-room UI.  All DTO inputs are typed `any` because
 * we don't have generated SDK types for every endpoint.
 */

import type {
  Equipment,
  PropertySystem,
  PropertyZone,
  SystemKind,
  SystemStatus,
} from "../types/domain";
import type { MaintenanceWorkOrder } from "../types/ops";
import type { PropertyAlert, Sensor } from "../types/telemetry";
import type { PropertyHealthScore } from "../types/domain";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function humanizeMetricType(metricType: string): string {
  return metricType
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Derive a SystemKind from a BmsDevice type string.
 * "camera" | "access-control" → "security"
 * "sensor"                    → "hvac"  (default – no sub-type on the DTO)
 * "controller"                → "electrical"
 * anything else               → "comms"
 */
function deviceTypeToSystemKind(deviceType: string): SystemKind {
  switch (deviceType?.toLowerCase()) {
    case "camera":
    case "access-control":
      return "security";
    case "sensor":
      return "hvac";
    case "controller":
      return "electrical";
    default:
      return "comms";
  }
}

// ---------------------------------------------------------------------------
// Device → Equipment
// ---------------------------------------------------------------------------

export function deviceToEquipment(device: any, propertyId: string): Equipment {
  return {
    id: String(device.id ?? ""),
    propertyId,
    systemId: `sys-${deviceTypeToSystemKind(device.type)}`,
    name: device.name ?? "Unknown Device",
    manufacturer: device.manufacturer ?? undefined,
    model: device.model ?? undefined,
    serial: device.serialNumber ?? undefined,
    installDate: device.installationDate ?? undefined,
    warrantyEnd: device.warrantyExpiryDate ?? null,
    aiModelIds: [],
    tags: device.locationZone ? [device.locationZone] : undefined,
  };
}

// ---------------------------------------------------------------------------
// Devices → PropertySystem[]
// ---------------------------------------------------------------------------

export function devicesToSystems(
  devices: any[],
  propertyId: string
): PropertySystem[] {
  // Group devices by derived SystemKind
  const groups = new Map<SystemKind, any[]>();

  for (const device of devices) {
    const kind = deviceTypeToSystemKind(device.type);
    if (!groups.has(kind)) groups.set(kind, []);
    groups.get(kind)!.push(device);
  }

  const systems: PropertySystem[] = [];

  for (const [kind, devs] of groups.entries()) {
    const total = devs.length;
    const onlineCount = devs.filter(
      (d) => d.status?.toLowerCase() === "online"
    ).length;
    const hasError = devs.some((d) => d.status?.toLowerCase() === "error");
    const hasOfflineOrMaint = devs.some((d) =>
      ["offline", "maintenance"].includes(d.status?.toLowerCase())
    );

    const healthScore = total > 0 ? Math.round((onlineCount / total) * 100) : 100;

    let status: SystemStatus = "nominal";
    if (hasError) {
      status = "critical";
    } else if (hasOfflineOrMaint) {
      status = "degraded";
    }

    systems.push({
      id: `sys-${kind}-${propertyId}`,
      propertyId,
      kind,
      name: kind.charAt(0).toUpperCase() + kind.slice(1).replace(/_/g, " "),
      healthScore,
      status,
      equipmentIds: devs.map((d) => String(d.id ?? "")),
    });
  }

  return systems;
}

// ---------------------------------------------------------------------------
// IotMetric → Sensor
// ---------------------------------------------------------------------------

export function metricToSensor(metric: any): Sensor {
  return {
    id: String(metric.id),
    propertyId: String(metric.propertyId ?? ""),
    equipmentId: metric.deviceId ? String(metric.deviceId) : undefined,
    key: metric.metricType ?? "unknown",
    label: humanizeMetricType(metric.metricType ?? "unknown"),
    unit: metric.unit ?? "",
    min: metric.thresholdMin ?? undefined,
    max: metric.thresholdMax ?? undefined,
    critical:
      !!metric.alertTriggered &&
      metric.alertSeverity?.toLowerCase() === "critical",
    sampleHz: 0.016, // ~1 reading per minute
  };
}

// ---------------------------------------------------------------------------
// IotMetric → PropertyAlert (null if no alert triggered)
// ---------------------------------------------------------------------------

export function metricToAlert(metric: any): PropertyAlert | null {
  if (!metric.alertTriggered) return null;

  const rawSeverity = metric.alertSeverity?.toLowerCase();
  let severity: PropertyAlert["severity"] = "info";
  if (rawSeverity === "warning") severity = "warn";
  else if (rawSeverity === "critical") severity = "critical";

  return {
    id: `alert-metric-${metric.id}`,
    propertyId: String(metric.propertyId ?? ""),
    source: "threshold",
    severity,
    sensorId: String(metric.id),
    message: `${humanizeMetricType(metric.metricType ?? "metric")} threshold exceeded (value: ${metric.value} ${metric.unit ?? ""})`.trim(),
    ts: metric.timestamp ?? new Date().toISOString(),
    ack: false,
  };
}

// ---------------------------------------------------------------------------
// PropertyArea → PropertyZone
// ---------------------------------------------------------------------------

export function areaToZone(area: any): PropertyZone {
  // The actual PropertyArea shape from the API:
  //   id, propertyId, propertyName, name, description, floor, createdAt, updatedAt
  // The user-supplied "AreaDto" shape includes areaType / floorLevel but those
  // fields may not be present in the real API response.  We handle both.
  const rawKind = area.areaType?.toLowerCase();
  let kind: PropertyZone["kind"] = "area";
  if (rawKind === "floor") kind = "floor";
  else if (rawKind === "room") kind = "room";
  // The real PropertyArea uses `floor` (string) rather than `floorLevel` (number)
  const level =
    area.floorLevel != null
      ? Number(area.floorLevel)
      : area.floor != null
      ? parseInt(String(area.floor), 10) || undefined
      : undefined;

  return {
    id: String(area.id ?? ""),
    propertyId: String(area.propertyId ?? ""),
    name: area.name ?? "Unknown Area",
    kind,
    level: isNaN(level as number) ? undefined : level,
  };
}

// ---------------------------------------------------------------------------
// TaskDto → MaintenanceWorkOrder
// ---------------------------------------------------------------------------

export function taskToWorkOrder(task: any): MaintenanceWorkOrder {
  const rawStatus = task.status?.toLowerCase();
  let status: MaintenanceWorkOrder["status"] = "open";
  if (rawStatus === "in_progress") status = "in_progress";
  else if (rawStatus === "in_review") status = "assigned";
  else if (rawStatus === "completed" || rawStatus === "cancelled") status = "closed";

  const rawPriority = task.priority?.toLowerCase();
  let priority: MaintenanceWorkOrder["priority"] = "medium";
  if (rawPriority === "low") priority = "low";
  else if (rawPriority === "high") priority = "high";
  else if (rawPriority === "critical") priority = "urgent";

  return {
    id: String(task.id ?? ""),
    propertyId: String(task.propertyId ?? ""),
    title: task.title ?? "Untitled Task",
    description: task.description ?? "",
    priority,
    status,
    assigneeId: task.assignees?.[0]?.userId ?? undefined,
    assigneeName: task.assignees?.[0]?.userName ?? undefined,
    createdAt: task.createdAt ?? new Date().toISOString(),
    updatedAt: task.updatedAt ?? new Date().toISOString(),
    closedAt: task.completedAt ?? null,
  };
}

// ---------------------------------------------------------------------------
// Compute overall PropertyHealthScore
// ---------------------------------------------------------------------------

export function computeHealthScore(
  propertyId: string,
  devices: any[],
  alerts: PropertyAlert[]
): PropertyHealthScore {
  let score = 100;

  // Deductions for alerts
  const criticalAlerts = alerts.filter((a) => a.severity === "critical");
  const warnAlerts = alerts.filter((a) => a.severity === "warn");
  score -= Math.min(criticalAlerts.length * 10, 40);
  score -= Math.min(warnAlerts.length * 5, 20);

  // Deductions for device status
  const offlineDevices = devices.filter(
    (d) => d.status?.toLowerCase() === "offline"
  );
  const errorDevices = devices.filter(
    (d) => d.status?.toLowerCase() === "error"
  );
  score -= Math.min(offlineDevices.length * 10, 30);
  score -= Math.min(errorDevices.length * 5, 10);

  score = Math.max(0, score);

  // Component breakdown
  const totalDevices = devices.length;
  const onlineCount = devices.filter(
    (d) => d.status?.toLowerCase() === "online"
  ).length;
  const systemsScore =
    totalDevices > 0 ? Math.round((onlineCount / totalDevices) * 100) : 100;

  const sensorScore = Math.max(
    0,
    100 - criticalAlerts.length * 20 - warnAlerts.length * 10
  );

  return {
    propertyId,
    score,
    components: {
      systems: systemsScore,
      sensors: Math.min(100, sensorScore),
      ai: 100, // placeholder — no AI health data from the backend yet
      maintenance: 100, // placeholder — degraded by caller if work orders are open
    },
    computedAt: new Date().toISOString(),
  };
}
