import type { DriveStep } from "driver.js";

export function getProjectsListSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to Projects!",
        description:
          "This is where you manage all your projects. Let's walk through what you can do here.",
      },
    },
    {
      element: '[data-tour="projects-stats"]',
      popover: {
        title: "Project Stats",
        description:
          "A quick overview of your project metrics — total projects, active ones, completion rates, and more.",
      },
    },
    {
      element: '[data-tour="projects-search"]',
      popover: {
        title: "Search & Filter",
        description:
          "Looking for a specific project? Type here to search by name. You can also filter by status.",
      },
    },
    {
      element: '[data-tour="projects-view-toggle"]',
      popover: {
        title: "Switch Your View",
        description:
          "Prefer cards or a table? Toggle between grid and table view to find the layout that works best for you.",
      },
    },
    {
      element: '[data-tour="projects-add"]',
      popover: {
        title: "Create a New Project",
        description:
          "Ready to start something new? Click here to create a project. You'll set the name, team, budget, and timeline.",
      },
    },
    {
      element: '[data-tour="projects-list"]',
      popover: {
        title: "Your Project List",
        description:
          "Here are all your projects. Click on any one to see its full details, tasks, documents, and team members.",
      },
    },
  ];
}
