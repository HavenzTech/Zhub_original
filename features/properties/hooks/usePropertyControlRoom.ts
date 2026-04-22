"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import {
  getAIModelsByProperty,
  getAlertsByProperty,
  getEquipmentByProperty,
  getHealthForProperty,
  getInsightsByProperty,
  getMockProperty,
  getSensorsByProperty,
  getStakeholdersByProperty,
  getSystemsByProperty,
  getWorkOrdersByProperty,
  getZonesByProperty,
  isMockMode,
} from "../mock";
import type { Property } from "@/types/bms";
import type {
  AIInsight,
  AIModelConfig,
  Equipment,
  MaintenanceWorkOrder,
  PropertyAlert,
  PropertyHealthScore,
  PropertyStakeholder,
  PropertySystem,
  PropertyZone,
  Sensor,
} from "../types";

export interface ControlRoomBundle {
  property: Property;
  systems: PropertySystem[];
  zones: PropertyZone[];
  equipment: Equipment[];
  sensors: Sensor[];
  stakeholders: PropertyStakeholder[];
  aiModels: AIModelConfig[];
  insights: AIInsight[];
  workOrders: MaintenanceWorkOrder[];
  alerts: PropertyAlert[];
  health: PropertyHealthScore;
}

export function usePropertyControlRoom(propertyId: string | undefined) {
  return useQuery<ControlRoomBundle | null>({
    queryKey: propertyId ? propertyKeys.detail(propertyId) : ["property", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.STANDARD,
    queryFn: async () => {
      if (!propertyId) return null;
      if (!isMockMode()) {
        throw new Error(
          "Live control-room bundle not wired. Set NEXT_PUBLIC_PROPERTIES_DATA_MODE=mock."
        );
      }
      const property = getMockProperty(propertyId);
      if (!property) return null;
      return {
        property,
        systems: getSystemsByProperty(propertyId),
        zones: getZonesByProperty(propertyId),
        equipment: getEquipmentByProperty(propertyId),
        sensors: getSensorsByProperty(propertyId),
        stakeholders: getStakeholdersByProperty(propertyId),
        aiModels: getAIModelsByProperty(propertyId),
        insights: getInsightsByProperty(propertyId),
        workOrders: getWorkOrdersByProperty(propertyId),
        alerts: getAlertsByProperty(propertyId),
        health: getHealthForProperty(propertyId),
      };
    },
  });
}
