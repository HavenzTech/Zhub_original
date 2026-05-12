import type { AccessEvent, SecurityCamera } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

export const mockCameras: SecurityCamera[] = [
  { id: "cam-brahms-main-gate", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-switchyard", name: "Main Gate", location: "Site Entrance", status: "live", resolution: "4K", fps: 30, ptz: true, tags: ["perimeter", "anpr"] },
  { id: "cam-brahms-perimeter-n", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-switchyard", name: "Perimeter North", location: "North Fence", status: "live", resolution: "1080p", fps: 25, ptz: false, tags: ["perimeter"] },
  { id: "cam-brahms-perimeter-s", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-switchyard", name: "Perimeter South", location: "South Fence", status: "live", resolution: "1080p", fps: 25, ptz: false, tags: ["perimeter"] },
  { id: "cam-brahms-engine-hall", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-engine-hall", name: "Engine Hall Overview", location: "Engine Hall · Catwalk", status: "recording", resolution: "4K", fps: 30, ptz: true, tags: ["internal"] },
  { id: "cam-brahms-control-room", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-control-room", name: "Control Room", location: "Control Room", status: "live", resolution: "1080p", fps: 30, ptz: false, tags: ["internal"] },
  { id: "cam-brahms-switchyard", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-switchyard", name: "Switchyard", location: "HV Switchyard", status: "live", resolution: "4K", fps: 30, ptz: true, tags: ["perimeter", "thermal"] },
  { id: "cam-brahms-fuel-yard", propertyId: FLAGSHIP_PROPERTY_ID, zoneId: "zone-brahms-fuel-yard", name: "Fuel Yard", location: "Gas Manifold", status: "degraded", resolution: "1080p", fps: 15, ptz: false, tags: ["perimeter", "hazard"] },

  { id: "cam-northfield-mdf", propertyId: "prop-northfield-dc", zoneId: "zone-northfield-dh1", name: "Data Hall 1 — MDF", location: "Data Hall 1", status: "live", resolution: "4K", fps: 30, ptz: false, tags: ["internal"] },
  { id: "cam-northfield-dock", propertyId: "prop-northfield-dc", name: "Loading Dock", location: "Loading Dock", status: "live", resolution: "1080p", fps: 30, ptz: true, tags: ["perimeter"] },

  { id: "cam-meridian-lobby", propertyId: "prop-meridian-tower", name: "Main Lobby", location: "Ground Floor", status: "live", resolution: "4K", fps: 30, ptz: true, tags: ["internal"] },
  { id: "cam-glacier-bay", propertyId: "prop-glacier-cold", zoneId: "zone-glacier-main", name: "Receiving Bay", location: "Dock Door 1", status: "live", resolution: "1080p", fps: 25, ptz: false, tags: ["perimeter"] },
  { id: "cam-harbor-parking", propertyId: "prop-harbor-mixed", name: "Parking P1", location: "Parkade Level 1", status: "live", resolution: "1080p", fps: 25, ptz: true, tags: ["internal"] },
];

const seedEvents: AccessEvent[] = [
  { id: "ae-1", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-main-gate", zoneId: "zone-brahms-switchyard", type: "badge_in", severity: "info", ts: "2026-04-22T08:02:11Z", subject: "Priya Raman", detail: "Badge #HVZ-0042 · granted" },
  { id: "ae-2", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-main-gate", zoneId: "zone-brahms-switchyard", type: "badge_in", severity: "info", ts: "2026-04-22T08:08:33Z", subject: "Rosa Lopez", detail: "Badge #HVZ-0117 · granted" },
  { id: "ae-3", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-fuel-yard", zoneId: "zone-brahms-fuel-yard", type: "motion", severity: "warn", ts: "2026-04-22T08:14:05Z", detail: "Motion detected outside manned hours window" },
  { id: "ae-4", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-perimeter-n", zoneId: "zone-brahms-switchyard", type: "motion", severity: "info", ts: "2026-04-22T08:22:41Z", detail: "Wildlife tag — low confidence" },
  { id: "ae-5", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-main-gate", zoneId: "zone-brahms-switchyard", type: "badge_denied", severity: "critical", ts: "2026-04-22T08:37:19Z", subject: "Unknown", detail: "Badge #HVZ-9981 · out of schedule · escalated" },
  { id: "ae-6", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-control-room", zoneId: "zone-brahms-control-room", type: "badge_in", severity: "info", ts: "2026-04-22T08:41:00Z", subject: "Dmitri Volkov", detail: "Badge #HVZ-0076 · granted" },
  { id: "ae-7", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-engine-hall", zoneId: "zone-brahms-engine-hall", type: "door_held", severity: "warn", ts: "2026-04-22T08:52:27Z", detail: "Engine hall door held open >45 s" },
  { id: "ae-8", propertyId: FLAGSHIP_PROPERTY_ID, cameraId: "cam-brahms-fuel-yard", zoneId: "zone-brahms-fuel-yard", type: "tamper", severity: "critical", ts: "2026-04-22T08:58:02Z", detail: "Camera tamper detected — contrast anomaly" },
];

export function getCamerasByProperty(propertyId: string): SecurityCamera[] {
  return mockCameras.filter((c) => c.propertyId === propertyId);
}

export function getAccessEventsByProperty(propertyId: string): AccessEvent[] {
  return seedEvents
    .filter((e) => e.propertyId === propertyId)
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}

export function getAccessEventsByCamera(cameraId: string): AccessEvent[] {
  return seedEvents
    .filter((e) => e.cameraId === cameraId)
    .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime());
}
