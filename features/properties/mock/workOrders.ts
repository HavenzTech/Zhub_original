import type { MaintenanceWorkOrder } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

const seed: MaintenanceWorkOrder[] = [
  {
    id: "wo-1",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-engine-3",
    title: "Quarterly oil sample — Engine 3",
    description: "Draw 250 ml sample, send to Castrol Labs.",
    priority: "medium",
    status: "assigned",
    assigneeId: "user-tech-1",
    assigneeName: "Rosa Lopez",
    createdAt: "2026-04-18T10:00:00Z",
    updatedAt: "2026-04-19T12:00:00Z",
  },
  {
    id: "wo-2",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-hx-1",
    title: "HX-1 plate inspection — mild fouling",
    description: "Isolate, drain, visual inspection of plates.",
    priority: "low",
    status: "in_progress",
    assigneeId: "user-tech-2",
    assigneeName: "Kenji Nakamura",
    createdAt: "2026-04-15T10:00:00Z",
    updatedAt: "2026-04-21T08:00:00Z",
  },
  {
    id: "wo-3",
    propertyId: FLAGSHIP_PROPERTY_ID,
    equipmentId: "eq-cooling-tower",
    title: "Cooling tower — water treatment",
    description: "Completed quarterly biocide dosing and blowdown.",
    priority: "medium",
    status: "closed",
    assigneeId: "user-tech-1",
    assigneeName: "Rosa Lopez",
    createdAt: "2026-03-20T10:00:00Z",
    updatedAt: "2026-03-22T15:00:00Z",
    closedAt: "2026-03-22T15:00:00Z",
    cost: 2480,
  },
];

const store: MaintenanceWorkOrder[] = [...seed];

export function getWorkOrdersByProperty(id: string): MaintenanceWorkOrder[] {
  return store.filter((w) => w.propertyId === id);
}

export function addWorkOrder(w: MaintenanceWorkOrder): void {
  store.unshift(w);
}

export function updateWorkOrder(id: string, patch: Partial<MaintenanceWorkOrder>): void {
  const w = store.find((x) => x.id === id);
  if (w) Object.assign(w, patch, { updatedAt: new Date().toISOString() });
}

export function allWorkOrders(): MaintenanceWorkOrder[] {
  return store;
}
