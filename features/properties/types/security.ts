export type CameraStatus = "live" | "recording" | "offline" | "degraded";

export interface SecurityCamera {
  id: string;
  propertyId: string;
  zoneId?: string;
  name: string;
  location: string;
  status: CameraStatus;
  resolution: string;
  fps: number;
  ptz: boolean;
  streamUrl?: string;
  snapshotUrl?: string;
  tags?: string[];
}

export type AccessEventType = "badge_in" | "badge_out" | "badge_denied" | "motion" | "door_held" | "tamper";
export type AccessEventSeverity = "info" | "warn" | "critical";

export interface AccessEvent {
  id: string;
  propertyId: string;
  cameraId?: string;
  zoneId?: string;
  type: AccessEventType;
  severity: AccessEventSeverity;
  ts: string;
  subject?: string;
  detail: string;
}
