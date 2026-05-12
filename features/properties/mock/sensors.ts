import type { Sensor } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

function engineSensors(engineNum: number): Sensor[] {
  const eqId = `eq-engine-${engineNum}`;
  const base = { propertyId: FLAGSHIP_PROPERTY_ID, equipmentId: eqId, zoneId: "zone-brahms-engine-hall", sampleHz: 1, critical: false };
  return [
    { ...base, id: `sen-eng${engineNum}-vib-x`, key: "vibration_x", label: `Engine ${engineNum} Vibration X`, unit: "mm/s", warnMax: 7.1, critMax: 11.2, critical: true },
    { ...base, id: `sen-eng${engineNum}-vib-y`, key: "vibration_y", label: `Engine ${engineNum} Vibration Y`, unit: "mm/s", warnMax: 7.1, critMax: 11.2, critical: true },
    { ...base, id: `sen-eng${engineNum}-vib-z`, key: "vibration_z", label: `Engine ${engineNum} Vibration Z`, unit: "mm/s", warnMax: 7.1, critMax: 11.2, critical: true },
    { ...base, id: `sen-eng${engineNum}-bearing-t`, key: "bearing_temp", label: `Engine ${engineNum} Bearing Temp`, unit: "°C", warnMax: 95, critMax: 110, critical: true },
    { ...base, id: `sen-eng${engineNum}-oil-p`, key: "oil_pressure", label: `Engine ${engineNum} Oil Pressure`, unit: "bar", warnMin: 3.5, critMin: 2.8, critical: true },
    { ...base, id: `sen-eng${engineNum}-exh-t`, key: "exhaust_temp", label: `Engine ${engineNum} Exhaust Temp`, unit: "°C", warnMax: 580, critMax: 640 },
    { ...base, id: `sen-eng${engineNum}-rpm`, key: "rpm", label: `Engine ${engineNum} RPM`, unit: "rpm", warnMin: 1490, warnMax: 1510 },
    { ...base, id: `sen-eng${engineNum}-load`, key: "load_kw", label: `Engine ${engineNum} Load`, unit: "kW", warnMax: 2100 },
    { ...base, id: `sen-eng${engineNum}-fuel`, key: "fuel_flow", label: `Engine ${engineNum} Fuel Flow`, unit: "m³/h", warnMax: 520 },
    { ...base, id: `sen-eng${engineNum}-coolant-t`, key: "coolant_temp", label: `Engine ${engineNum} Coolant Temp`, unit: "°C", warnMax: 92, critMax: 102 },
  ];
}

export const mockSensors: Sensor[] = [
  ...engineSensors(1),
  ...engineSensors(2),
  ...engineSensors(3),
  ...engineSensors(4),
  { id: "sen-grid-freq", propertyId: FLAGSHIP_PROPERTY_ID, equipmentId: "eq-switchgear-a", key: "grid_freq", label: "Grid Frequency", unit: "Hz", sampleHz: 1, critical: true, warnMin: 59.8, warnMax: 60.2, critMin: 59.5, critMax: 60.5 },
  { id: "sen-switchgear-temp", propertyId: FLAGSHIP_PROPERTY_ID, equipmentId: "eq-switchgear-a", key: "switchgear_temp", label: "Switchgear A Temp", unit: "°C", sampleHz: 1, critical: false, warnMax: 75, critMax: 90 },
  { id: "sen-fire-status", propertyId: FLAGSHIP_PROPERTY_ID, equipmentId: "eq-fire-panel", key: "fire_zone_status", label: "Fire Zone Status", unit: "", sampleHz: 1, critical: true },

  { id: "sen-chiller-m1-load", propertyId: "prop-meridian-tower", equipmentId: "eq-chiller-m1", key: "load_pct", label: "Chiller #1 Load", unit: "%", sampleHz: 1, critical: false, warnMax: 95 },
  { id: "sen-ahu-m1-supply-t", propertyId: "prop-meridian-tower", equipmentId: "eq-ahu-m1", key: "supply_temp", label: "AHU-M1 Supply Temp", unit: "°C", sampleHz: 1, critical: false, warnMin: 12, warnMax: 18 },

  { id: "sen-crac-n1-return-t", propertyId: "prop-northfield-dc", equipmentId: "eq-crac-n1", key: "return_temp", label: "CRAC-1 Return Temp", unit: "°C", sampleHz: 1, critical: true, warnMax: 27, critMax: 32 },
  { id: "sen-ups-n1-load", propertyId: "prop-northfield-dc", equipmentId: "eq-ups-n1", key: "load_pct", label: "UPS-A Load", unit: "%", sampleHz: 1, critical: false, warnMax: 85 },

  { id: "sen-compressor-g1-suction", propertyId: "prop-glacier-cold", equipmentId: "eq-compressor-g1", key: "suction_p", label: "Compressor Suction Pressure", unit: "bar", sampleHz: 1, critical: true, warnMin: 0.8 },
];

export function getSensorsByProperty(propertyId: string): Sensor[] {
  return mockSensors.filter((s) => s.propertyId === propertyId);
}

export function getSensorsByEquipment(equipmentId: string): Sensor[] {
  return mockSensors.filter((s) => s.equipmentId === equipmentId);
}

export function getSensorById(id: string): Sensor | undefined {
  return mockSensors.find((s) => s.id === id);
}
