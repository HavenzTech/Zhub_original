import type { PropertyZone } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

export const mockZones: PropertyZone[] = [
  { id: "zone-brahms-engine-hall", propertyId: FLAGSHIP_PROPERTY_ID, name: "Engine Hall", kind: "area", level: 1 },
  { id: "zone-brahms-control-room", propertyId: FLAGSHIP_PROPERTY_ID, name: "Control Room", kind: "room", level: 2 },
  { id: "zone-brahms-switchyard", propertyId: FLAGSHIP_PROPERTY_ID, name: "Switchyard", kind: "outdoor" },
  { id: "zone-brahms-fuel-yard", propertyId: FLAGSHIP_PROPERTY_ID, name: "Fuel Yard", kind: "outdoor" },
  { id: "zone-brahms-cooling", propertyId: FLAGSHIP_PROPERTY_ID, name: "Cooling Plant", kind: "area", level: 1 },

  { id: "zone-meridian-mech", propertyId: "prop-meridian-tower", name: "Mechanical Penthouse", kind: "floor", level: 42 },
  { id: "zone-northfield-dh1", propertyId: "prop-northfield-dc", name: "Data Hall 1", kind: "area", level: 1 },
  { id: "zone-glacier-main", propertyId: "prop-glacier-cold", name: "Main Storage", kind: "area", level: 1 },
  { id: "zone-harbor-lobby", propertyId: "prop-harbor-mixed", name: "Lobby & Retail", kind: "floor", level: 1 },
];

export function getZonesByProperty(propertyId: string): PropertyZone[] {
  return mockZones.filter((z) => z.propertyId === propertyId);
}
