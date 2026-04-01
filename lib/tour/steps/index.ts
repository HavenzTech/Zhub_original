import type { DriveStep } from "driver.js";
import type { TourKey } from "../types";
import { authService } from "@/lib/services/auth";

import { getDashboardSteps } from "./dashboard";
import { getProjectsListSteps } from "./projects-list";
import { getProjectDetailSteps } from "./project-detail";
import { getDepartmentsListSteps } from "./departments-list";
import { getDepartmentDetailSteps } from "./department-detail";
import { getPropertiesListSteps } from "./properties-list";
import { getPropertyDetailSteps } from "./property-detail";
import { getDocumentControlSteps } from "./document-control";
import { getWorkflowTasksSteps } from "./workflow-tasks";
import { getSettingsSteps } from "./settings";
import { getZAiSteps } from "./z-ai";

/** Get tour steps for a given tour key */
export function getTourStepsForRoute(tourKey: TourKey): DriveStep[] {
  const isAdmin = authService.isAdmin();
  const isSuperAdmin = authService.isSuperAdmin();

  switch (tourKey) {
    case "dashboard":
      return getDashboardSteps();
    case "projects_list":
      return getProjectsListSteps();
    case "project_detail":
      return getProjectDetailSteps();
    case "departments_list":
      return getDepartmentsListSteps();
    case "department_detail":
      return getDepartmentDetailSteps();
    case "properties_list":
      return getPropertiesListSteps();
    case "property_detail":
      return getPropertyDetailSteps();
    case "document_control":
      return getDocumentControlSteps();
    case "workflow_tasks":
      return getWorkflowTasksSteps();
    case "settings":
      return getSettingsSteps(isAdmin, isSuperAdmin);
    case "z_ai":
      return getZAiSteps();
    default:
      return [];
  }
}

// Re-export all step getters for direct use
export {
  getDashboardSteps,
  getProjectsListSteps,
  getProjectDetailSteps,
  getDepartmentsListSteps,
  getDepartmentDetailSteps,
  getPropertiesListSteps,
  getPropertyDetailSteps,
  getDocumentControlSteps,
  getWorkflowTasksSteps,
  getSettingsSteps,
  getZAiSteps,
};
