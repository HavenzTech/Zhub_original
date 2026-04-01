import type { TourKey } from "./types";

export const TOUR_KEYS = {
  DASHBOARD: "dashboard",
  PROJECTS_LIST: "projects_list",
  PROJECT_DETAIL: "project_detail",
  DEPARTMENTS_LIST: "departments_list",
  DEPARTMENT_DETAIL: "department_detail",
  PROPERTIES_LIST: "properties_list",
  PROPERTY_DETAIL: "property_detail",
  DOCUMENT_CONTROL: "document_control",
  WORKFLOW_TASKS: "workflow_tasks",
  SETTINGS: "settings",
  Z_AI: "z_ai",
} as const satisfies Record<string, TourKey>;

/** All tour keys as an array */
export const ALL_TOUR_KEYS = Object.values(TOUR_KEYS);

/** Map a pathname to its tour key (returns null for routes without tours) */
export function getTourKeyForRoute(pathname: string): TourKey | null {
  if (pathname === "/") return TOUR_KEYS.DASHBOARD;
  if (pathname === "/projects") return TOUR_KEYS.PROJECTS_LIST;
  if (/^\/projects\/[^/]+$/.test(pathname)) return TOUR_KEYS.PROJECT_DETAIL;
  if (pathname === "/departments") return TOUR_KEYS.DEPARTMENTS_LIST;
  if (/^\/departments\/[^/]+$/.test(pathname)) return TOUR_KEYS.DEPARTMENT_DETAIL;
  if (pathname === "/properties") return TOUR_KEYS.PROPERTIES_LIST;
  if (/^\/properties\/[^/]+$/.test(pathname)) return TOUR_KEYS.PROPERTY_DETAIL;
  if (pathname === "/document-control") return TOUR_KEYS.DOCUMENT_CONTROL;
  if (pathname === "/workflow-tasks") return TOUR_KEYS.WORKFLOW_TASKS;
  if (pathname === "/settings") return TOUR_KEYS.SETTINGS;
  if (pathname === "/z-ai") return TOUR_KEYS.Z_AI;
  return null;
}
