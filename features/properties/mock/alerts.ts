import type { PropertyAlert } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

export const mockAlerts: PropertyAlert[] = [
  { id: "al-1", propertyId: FLAGSHIP_PROPERTY_ID, source: "ai", severity: "critical", insightId: "ins-1", equipmentId: "eq-engine-2", message: "Engine 2 — predicted bearing failure in ~14 days", ts: "2026-04-22T08:30:00Z", ack: false },
  { id: "al-2", propertyId: FLAGSHIP_PROPERTY_ID, source: "threshold", severity: "warn", sensorId: "sen-eng2-vib-x", equipmentId: "eq-engine-2", message: "Engine 2 vibration X above warn threshold", ts: "2026-04-22T08:12:00Z", ack: false },
  { id: "al-3", propertyId: FLAGSHIP_PROPERTY_ID, source: "ai", severity: "warn", insightId: "ins-3", equipmentId: "eq-switchgear-a", message: "Switchgear A — intermittent harmonics", ts: "2026-04-21T17:22:00Z", ack: false },
  { id: "al-4", propertyId: "prop-northfield-dc", source: "threshold", severity: "warn", sensorId: "sen-crac-n1-return-t", message: "CRAC-1 return temp above warn threshold", ts: "2026-04-22T06:00:00Z", ack: false },
];

export function getAlertsByProperty(id: string): PropertyAlert[] {
  return mockAlerts.filter((a) => a.propertyId === id);
}
