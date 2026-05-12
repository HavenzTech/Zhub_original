"use client";

import dynamic from "next/dynamic";
import type {
  AIInsight,
  Equipment,
  MaintenanceWorkOrder,
  PropertyAlert,
  PropertyZone,
  Sensor,
} from "../../types";
import type { Property } from "@/types/bms";

export interface TwinHotspotDescriptor {
  id: string;
  label: string;
  kind: "sensor" | "equipment" | "zone";
  position: [number, number, number];
  sensorId?: string;
  equipmentId?: string;
}

export interface DigitalTwinViewerProps {
  property: Property;
  equipment: Equipment[];
  zones: PropertyZone[];
  sensors: Sensor[];
  insights: AIInsight[];
  alerts: PropertyAlert[];
  workOrders: MaintenanceWorkOrder[];
  focusEquipmentId?: string;
  onSelectEquipment?: (equipmentId: string) => void;
  onCreateWorkOrder?: (equipmentId: string) => void;
}

const TwinScene = dynamic(
  () => import("./TwinScene").then((m) => m.TwinScene),
  { ssr: false, loading: () => <TwinLoading /> }
);

function TwinLoading() {
  return (
    <div className="h-full w-full flex items-center justify-center text-xs text-stone-500 dark:text-stone-400">
      Loading 3D twin…
    </div>
  );
}

export function DigitalTwinViewer(props: DigitalTwinViewerProps) {
  return <TwinScene {...props} />;
}
