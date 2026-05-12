"use client";

import dynamic from "next/dynamic";
import type { Property } from "@/types/bms";
import type {
  AIInsight,
  Equipment,
  MaintenanceWorkOrder,
  PropertyAlert,
  PropertyZone,
  Sensor,
} from "../../types";

interface Props {
  property: Property;
  equipment: Equipment[];
  zones: PropertyZone[];
  sensors: Sensor[];
  insights: AIInsight[];
  alerts: PropertyAlert[];
  workOrders: MaintenanceWorkOrder[];
  focusEquipmentId?: string;
  onCreateWorkOrder?: (equipmentId: string) => void;
}

const DigitalTwinViewer = dynamic(
  () => import("../digital-twin/DigitalTwinViewer").then((m) => m.DigitalTwinViewer),
  {
    ssr: false,
    loading: () => (
      <div className="h-[68vh] min-h-[520px] rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-950 flex items-center justify-center text-xs text-stone-400">
        Loading 3D twin…
      </div>
    ),
  }
);

export function DigitalTwinTab(props: Props) {
  return <DigitalTwinViewer {...props} />;
}
