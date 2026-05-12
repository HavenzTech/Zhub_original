export type WorkOrderStatus = "open" | "assigned" | "in_progress" | "closed";
export type WorkOrderPriority = "low" | "medium" | "high" | "urgent";

export interface MaintenanceWorkOrder {
  id: string;
  propertyId: string;
  equipmentId?: string;
  insightId?: string;
  title: string;
  description: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assigneeId?: string;
  assigneeName?: string;
  createdAt: string;
  updatedAt: string;
  closedAt?: string | null;
  cost?: number;
}

export interface FinancialsMonthly {
  month: string;
  value: number;
  operatingCost: number;
  revenue: number;
  forecastCost: number;
}
