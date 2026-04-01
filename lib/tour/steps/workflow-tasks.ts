import type { DriveStep } from "driver.js";

export function getWorkflowTasksSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to My Tasks!",
        description:
          "This is your task hub — everything assigned to you across all projects and workflows lives here.",
      },
    },
    {
      element: '[data-tour="tasks-tabs"]',
      popover: {
        title: "Task Categories",
        description:
          "Switch between All tasks, Approvals, Reviews, and Completed to focus on what matters most right now.",
      },
    },
    {
      element: '[data-tour="tasks-search"]',
      popover: {
        title: "Search Tasks",
        description:
          "Looking for a specific task? Search by name or filter to narrow things down.",
      },
    },
    {
      element: '[data-tour="tasks-list"]',
      popover: {
        title: "Your Tasks",
        description:
          "Each task shows its priority, status, due date, and which project it belongs to. Overdue tasks are highlighted so you don't miss them.",
      },
    },
    {
      popover: {
        title: "Stay On Top of Things!",
        description:
          "Click any task to see its full details, take action on approvals, or update its status. You've got this!",
      },
    },
  ];
}
