import type { DriveStep } from "driver.js";

export function getWorkflowsSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to Workflows!",
        description:
          "Workflows automate your processes — from document approvals to notifications. Let's see what's here.",
      },
    },
    {
      element: '[data-tour="workflows-search"]',
      popover: {
        title: "Search & Filter",
        description:
          "Search workflows by name or filter by type and status to find what you're looking for.",
      },
    },
    {
      element: '[data-tour="workflows-create"]',
      popover: {
        title: "Create a Workflow",
        description:
          "Ready to automate something? Click here to create a new workflow with triggers, actions, and conditions.",
      },
    },
    {
      element: '[data-tour="workflows-list"]',
      popover: {
        title: "Your Workflows",
        description:
          "Each workflow card shows its status, trigger, actions, and success rate. Click any workflow to see more details or edit it.",
      },
    },
  ];
}
