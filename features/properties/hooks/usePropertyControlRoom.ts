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
import { bmsApi } from "@/lib/services/bmsApi";
import {
  areaToZone,
  computeHealthScore,
  deviceToEquipment,
  devicesToSystems,
  metricToAlert,
  metricToSensor,
  taskToWorkOrder,
} from "../adapters/liveAdapters";
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

/** Unwrap paged API results that may come back as `{ data: T[] }` or as a raw `T[]`. */
function unwrapArray<T>(result: any): T[] {
  if (!result) return [];
  if (Array.isArray(result)) return result as T[];
  if (Array.isArray(result.data)) return result.data as T[];
  return [];
}

export function usePropertyControlRoom(propertyId: string | undefined) {
  return useQuery<ControlRoomBundle | null>({
    queryKey: propertyId ? propertyKeys.detail(propertyId) : ["property", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.STANDARD,
    queryFn: async () => {
      if (!propertyId) return null;

      // -----------------------------------------------------------------------
      // Mock path — used when NEXT_PUBLIC_PROPERTIES_DATA_MODE=mock
      // -----------------------------------------------------------------------
      if (isMockMode()) {
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
      }

      // -----------------------------------------------------------------------
      // Live path — fetch real data from the backend API in parallel
      // -----------------------------------------------------------------------
      const [property, areasRaw, devicesRaw, metricsRaw, tasksRaw] =
        await Promise.all([
          bmsApi.properties.getById(propertyId) as Promise<Property>,
          bmsApi.properties.getAreas(propertyId).catch(() => []),
          bmsApi.bmsDevices.getByProperty(propertyId).catch(() => []),
          bmsApi.iotMetrics.getByProperty(propertyId).catch(() => []),
          // Pass propertyId as a filter so the backend returns only relevant tasks.
          bmsApi.tasks.getAll({ propertyId }).catch(() => []),
        ]);

      if (!property) return null;

      const devices: any[] = unwrapArray(devicesRaw);
      const metrics: any[] = unwrapArray(metricsRaw);
      const areas: any[] = unwrapArray(areasRaw);
      const taskList: any[] = unwrapArray<any>(tasksRaw).filter(
        (t) => t.propertyId === propertyId
      );

      // Build frontend domain objects using adapters
      const equipment: Equipment[] = devices.map((d) =>
        deviceToEquipment(d, propertyId)
      );

      const systems: PropertySystem[] = devicesToSystems(devices, propertyId);

      const zones: PropertyZone[] = areas.map(areaToZone);

      const sensors: Sensor[] = metrics.map(metricToSensor);

      const alerts: PropertyAlert[] = metrics
        .map(metricToAlert)
        .filter((a): a is PropertyAlert => a !== null);

      const workOrders: MaintenanceWorkOrder[] = taskList.map(taskToWorkOrder);

      // Health score — factor in open work orders
      const healthScore = computeHealthScore(propertyId, devices, alerts);
      const openWorkOrders = workOrders.filter(
        (w) => w.status === "open" || w.status === "assigned"
      );
      healthScore.components.maintenance = Math.max(
        0,
        100 - openWorkOrders.length * 5
      );

      return {
        property,
        systems,
        zones,
        equipment,
        sensors,
        alerts,
        workOrders,
        health: healthScore,
        // No backend equivalent yet — return empty arrays
        stakeholders: [] as PropertyStakeholder[],
        aiModels: [] as AIModelConfig[],
        insights: [] as AIInsight[],
      };
    },
  });
}
