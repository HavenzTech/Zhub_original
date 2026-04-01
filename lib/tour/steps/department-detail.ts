import type { DriveStep } from "driver.js";

export function getDepartmentDetailSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Department Details",
        description:
          "Here's everything about this department. Let's see what's available.",
      },
    },
    {
      element: '[data-tour="department-info"]',
      popover: {
        title: "Department Information",
        description:
          "Key details like the department head, contact info, and budget allocation. Click Edit to make changes.",
      },
    },
    {
      element: '[data-tour="department-description"]',
      popover: {
        title: "Description",
        description:
          "The department's description and purpose. Helps everyone understand what this team is responsible for.",
      },
    },
    {
      element: '[data-tour="department-members"]',
      popover: {
        title: "Team Members",
        description:
          "See who's in this department and manage member assignments. You can add or remove members from here.",
      },
    },
  ];
}
