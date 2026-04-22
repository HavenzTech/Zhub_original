export type SystemKind =
  | "hvac"
  | "electrical"
  | "plumbing"
  | "power_gen"
  | "fire"
  | "security"
  | "water"
  | "comms";

export type SystemStatus = "nominal" | "degraded" | "critical" | "offline";

export interface PropertySystem {
  id: string;
  propertyId: string;
  kind: SystemKind;
  name: string;
  healthScore: number;
  status: SystemStatus;
  equipmentIds: string[];
}

export type ZoneKind = "floor" | "area" | "room" | "outdoor";

export interface PropertyZone {
  id: string;
  propertyId: string;
  parentZoneId?: string | null;
  name: string;
  kind: ZoneKind;
  level?: number;
  polygon?: Array<[number, number]>;
}

export interface Equipment {
  id: string;
  propertyId: string;
  systemId: string;
  zoneId?: string;
  name: string;
  manufacturer?: string;
  model?: string;
  serial?: string;
  installDate?: string;
  warrantyEnd?: string | null;
  aiModelIds: string[];
  tags?: string[];
}

export type StakeholderRole =
  | "ceo"
  | "facility_manager"
  | "operations_lead"
  | "technician"
  | "viewer";

export interface PropertyStakeholder {
  id: string;
  propertyId: string;
  userId: string;
  displayName: string;
  email: string;
  role: StakeholderRole;
  addedAt: string;
  addedBy?: string;
}

export interface PropertyHealthScore {
  propertyId: string;
  score: number;
  components: {
    systems: number;
    sensors: number;
    ai: number;
    maintenance: number;
  };
  computedAt: string;
}
