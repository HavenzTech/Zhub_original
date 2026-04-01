import type { DriveStep, Config } from "driver.js";

export type TourKey =
  | "dashboard"
  | "projects_list"
  | "project_detail"
  | "departments_list"
  | "department_detail"
  | "properties_list"
  | "property_detail"
  | "document_control"
  | "workflow_tasks"
  | "settings"
  | "z_ai";

/** API response: key → boolean (true = completed) */
export type TourStatusMap = Record<string, boolean>;

/** Options passed to the useTour hook per page */
export interface UseTourOptions {
  steps: DriveStep[];
  /** Set to false to delay auto-start (e.g. waiting for data to load) */
  enabled?: boolean;
  /** Only show this tour for admin/superadmin users */
  adminOnly?: boolean;
}

/** Shape of the PATCH request body */
export interface TourCompleteRequest {
  tourKey: TourKey;
}

export type { DriveStep, Config };
