import type { Equipment } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

const engines: Equipment[] = [1, 2, 3, 4].map((n) => ({
  id: `eq-engine-${n}`,
  propertyId: FLAGSHIP_PROPERTY_ID,
  systemId: "sys-brahms-power",
  zoneId: "zone-brahms-engine-hall",
  name: `Engine ${n}`,
  manufacturer: "Caterpillar",
  model: "G3520H",
  serial: `CAT-G3520-${2200 + n}`,
  installDate: "2022-09-15",
  warrantyEnd: "2027-09-15",
  aiModelIds: [`ai-pm-engine-${n}`],
  tags: ["rotating", "2MW"],
}));

export const mockEquipment: Equipment[] = [
  ...engines,
  { id: "eq-switchgear-a", propertyId: FLAGSHIP_PROPERTY_ID, systemId: "sys-brahms-electrical", zoneId: "zone-brahms-switchyard", name: "Main Switchgear A", manufacturer: "ABB", model: "UniGear ZS1", installDate: "2022-08-01", aiModelIds: ["ai-anomaly-electrical"] },
  { id: "eq-switchgear-b", propertyId: FLAGSHIP_PROPERTY_ID, systemId: "sys-brahms-electrical", zoneId: "zone-brahms-switchyard", name: "Main Switchgear B", manufacturer: "ABB", model: "UniGear ZS1", installDate: "2022-08-01", aiModelIds: [] },
  { id: "eq-hx-1", propertyId: FLAGSHIP_PROPERTY_ID, systemId: "sys-brahms-water", zoneId: "zone-brahms-cooling", name: "Heat Exchanger 1", manufacturer: "Alfa Laval", model: "M10-BFM", installDate: "2022-09-01", aiModelIds: [] },
  { id: "eq-hx-2", propertyId: FLAGSHIP_PROPERTY_ID, systemId: "sys-brahms-water", zoneId: "zone-brahms-cooling", name: "Heat Exchanger 2", manufacturer: "Alfa Laval", model: "M10-BFM", installDate: "2022-09-01", aiModelIds: [] },
  { id: "eq-cooling-tower", propertyId: FLAGSHIP_PROPERTY_ID, systemId: "sys-brahms-water", zoneId: "zone-brahms-cooling", name: "Cooling Tower", manufacturer: "BAC", model: "S3E-1212", installDate: "2022-09-01", aiModelIds: [] },
  { id: "eq-fire-panel", propertyId: FLAGSHIP_PROPERTY_ID, systemId: "sys-brahms-fire", zoneId: "zone-brahms-control-room", name: "Fire Alarm Panel", manufacturer: "Honeywell", model: "NOTIFIER NFS2-3030", installDate: "2022-07-10", aiModelIds: [] },

  { id: "eq-chiller-m1", propertyId: "prop-meridian-tower", systemId: "sys-meridian-hvac", zoneId: "zone-meridian-mech", name: "Chiller #1", manufacturer: "Trane", model: "CVHE 500T", installDate: "2019-09-01", aiModelIds: [] },
  { id: "eq-ahu-m1", propertyId: "prop-meridian-tower", systemId: "sys-meridian-hvac", zoneId: "zone-meridian-mech", name: "AHU-M1", manufacturer: "Daikin", installDate: "2019-09-01", aiModelIds: [] },

  { id: "eq-crac-n1", propertyId: "prop-northfield-dc", systemId: "sys-northfield-hvac", zoneId: "zone-northfield-dh1", name: "CRAC Unit 1", manufacturer: "Vertiv", model: "Liebert DSE", installDate: "2021-01-10", aiModelIds: [] },
  { id: "eq-ups-n1", propertyId: "prop-northfield-dc", systemId: "sys-northfield-electrical", zoneId: "zone-northfield-dh1", name: "UPS Module A", manufacturer: "Schneider", model: "Galaxy VX", installDate: "2021-01-10", aiModelIds: [] },

  { id: "eq-compressor-g1", propertyId: "prop-glacier-cold", systemId: "sys-glacier-hvac", zoneId: "zone-glacier-main", name: "Ammonia Compressor 1", manufacturer: "Mycom", installDate: "2021-03-10", aiModelIds: [] },
];

export function getEquipmentByProperty(propertyId: string): Equipment[] {
  return mockEquipment.filter((e) => e.propertyId === propertyId);
}

export function getEquipmentById(id: string): Equipment | undefined {
  return mockEquipment.find((e) => e.id === id);
}
