import type { PropertySystem } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

export const mockSystems: PropertySystem[] = [
  // Brahms Heat & Power Plant
  { id: "sys-brahms-power", propertyId: FLAGSHIP_PROPERTY_ID, kind: "power_gen", name: "Generation", healthScore: 84, status: "degraded", equipmentIds: ["eq-engine-1", "eq-engine-2", "eq-engine-3", "eq-engine-4"] },
  { id: "sys-brahms-electrical", propertyId: FLAGSHIP_PROPERTY_ID, kind: "electrical", name: "Electrical Distribution", healthScore: 92, status: "nominal", equipmentIds: ["eq-switchgear-a", "eq-switchgear-b"] },
  { id: "sys-brahms-water", propertyId: FLAGSHIP_PROPERTY_ID, kind: "water", name: "Heat Recovery & Cooling", healthScore: 88, status: "nominal", equipmentIds: ["eq-hx-1", "eq-hx-2", "eq-cooling-tower"] },
  { id: "sys-brahms-fire", propertyId: FLAGSHIP_PROPERTY_ID, kind: "fire", name: "Fire Suppression", healthScore: 98, status: "nominal", equipmentIds: ["eq-fire-panel"] },
  { id: "sys-brahms-security", propertyId: FLAGSHIP_PROPERTY_ID, kind: "security", name: "Access & Perimeter", healthScore: 95, status: "nominal", equipmentIds: [] },

  // Meridian Tower
  { id: "sys-meridian-hvac", propertyId: "prop-meridian-tower", kind: "hvac", name: "HVAC", healthScore: 91, status: "nominal", equipmentIds: ["eq-chiller-m1", "eq-ahu-m1"] },
  { id: "sys-meridian-electrical", propertyId: "prop-meridian-tower", kind: "electrical", name: "Electrical", healthScore: 96, status: "nominal", equipmentIds: [] },
  { id: "sys-meridian-fire", propertyId: "prop-meridian-tower", kind: "fire", name: "Fire", healthScore: 99, status: "nominal", equipmentIds: [] },

  // Northfield DC
  { id: "sys-northfield-hvac", propertyId: "prop-northfield-dc", kind: "hvac", name: "Precision Cooling", healthScore: 89, status: "nominal", equipmentIds: ["eq-crac-n1"] },
  { id: "sys-northfield-electrical", propertyId: "prop-northfield-dc", kind: "electrical", name: "UPS & Power", healthScore: 94, status: "nominal", equipmentIds: ["eq-ups-n1"] },

  // Glacier Cold Storage
  { id: "sys-glacier-hvac", propertyId: "prop-glacier-cold", kind: "hvac", name: "Refrigeration", healthScore: 86, status: "nominal", equipmentIds: ["eq-compressor-g1"] },

  // Harbor Mixed-Use
  { id: "sys-harbor-hvac", propertyId: "prop-harbor-mixed", kind: "hvac", name: "HVAC", healthScore: 90, status: "nominal", equipmentIds: [] },
];

export function getSystemsByProperty(propertyId: string): PropertySystem[] {
  return mockSystems.filter((s) => s.propertyId === propertyId);
}
