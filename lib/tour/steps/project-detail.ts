import type { DriveStep } from "driver.js";

export function getProjectDetailSteps(activeTab?: string): DriveStep[] {
  // Auto-detect active tab from DOM if not provided (used by replay button)
  if (!activeTab && typeof document !== "undefined") {
    const activeButton = document.querySelector('[data-tour^="project-tab-"][data-active="true"]');
    if (activeButton) {
      const attr = activeButton.getAttribute("data-tour") || "";
      activeTab = attr.replace("project-tab-", "");
    }
  }
  // Common intro step
  const introSteps: DriveStep[] = [
    {
      element: '[data-tour="project-header"]',
      popover: {
        title: "Project Header",
        description:
          "See the project name, current status, and quick actions. You can edit the project or set it as your active project from here.",
      },
    },
    {
      element: '[data-tour="project-tabs"]',
      popover: {
        title: "Project Tabs",
        description:
          "Navigate between Overview, Tasks, Documents, Team, and Budget. Each tab gives you a focused view of that aspect of the project.",
      },
    },
  ];

  // Tab-specific steps
  switch (activeTab) {
    case "tasks":
      return [
        ...introSteps,
        {
          element: '[data-tour="project-tab-tasks"]',
          popover: {
            title: "Tasks Tab",
            description:
              "You're on the Tasks tab. Here you can create, assign, and track all tasks for this project.",
          },
        },
        {
          popover: {
            title: "Manage Your Tasks",
            description:
              "Create new tasks, set priorities and due dates, assign team members, and track progress. Overdue items are flagged automatically!",
          },
        },
      ];

    case "documents":
      return [
        ...introSteps,
        {
          element: '[data-tour="project-tab-documents"]',
          popover: {
            title: "Documents Tab",
            description:
              "You're on the Documents tab. Upload, manage, and organize all documents related to this project.",
          },
        },
        {
          popover: {
            title: "Document Management",
            description:
              "Upload new files, manage versions, control sharing and permissions, and keep everything organized in one place.",
          },
        },
      ];

    case "team":
      return [
        ...introSteps,
        {
          element: '[data-tour="project-tab-team"]',
          popover: {
            title: "Team Tab",
            description:
              "You're on the Team tab. See everyone working on this project and manage assignments.",
          },
        },
        {
          popover: {
            title: "Team Management",
            description:
              "Add or remove team members and assign departments to keep everyone organized and accountable.",
          },
        },
      ];

    case "budget":
      return [
        ...introSteps,
        {
          element: '[data-tour="project-tab-budget"]',
          popover: {
            title: "Budget Tab",
            description:
              "You're on the Budget tab. Track all expenses and spending for this project.",
          },
        },
        {
          popover: {
            title: "Budget Tracking",
            description:
              "Add expense line items, monitor spending against the allocated budget, and keep costs under control.",
          },
        },
      ];

    case "overview":
    default:
      return [
        {
          popover: {
            title: "Project Details",
            description:
              "You're inside a project! This is your command center for everything related to this project. Let's explore.",
          },
        },
        ...introSteps,
        {
          element: '[data-tour="project-stats"]',
          popover: {
            title: "Key Metrics",
            description:
              "Track progress, budget, spending, timeline, and any overdue items all in one place.",
          },
        },
        {
          element: '[data-tour="project-description"]',
          popover: {
            title: "Project Description",
            description:
              "The full project description lives here. You can also view the AI-generated summary and description history.",
          },
        },
        {
          element: '[data-tour="project-ai-summary"]',
          popover: {
            title: "AI Summary",
            description:
              "Z AI generates a smart summary of your project based on its tasks, documents, and activity. You can regenerate it anytime!",
          },
        },
        {
          element: '[data-tour="project-tab-tasks"]',
          popover: {
            title: "Tasks Tab",
            description:
              "Click here to manage all tasks for this project. Create, assign, prioritize, and track tasks.",
          },
        },
        {
          element: '[data-tour="project-tab-documents"]',
          popover: {
            title: "Documents Tab",
            description:
              "Access all documents attached to this project. Upload, version, share, and manage permissions.",
          },
        },
        {
          element: '[data-tour="project-tab-team"]',
          popover: {
            title: "Team Tab",
            description:
              "See who's working on this project. Add or remove team members and assign departments.",
          },
        },
        {
          element: '[data-tour="project-tab-budget"]',
          popover: {
            title: "Budget Tab",
            description:
              "Track expenses, monitor spending against budget, and keep costs under control.",
          },
        },
        {
          popover: {
            title: "That's the Full Picture!",
            description:
              "You now know your way around a project. Explore each tab to dive deeper — they're all yours!",
          },
        },
      ];
  }
}
