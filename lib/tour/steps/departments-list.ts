import type { DriveStep } from "driver.js";

export function getDepartmentsListSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to Departments!",
        description:
          "This is where you organize your teams. Let's take a look at what's here.",
      },
    },
    {
      element: '[data-tour="departments-stats"]',
      popover: {
        title: "Department Stats",
        description:
          "A quick snapshot of your departments — total count, members, and budget overview.",
      },
    },
    {
      element: '[data-tour="departments-search"]',
      popover: {
        title: "Search Departments",
        description:
          "Quickly find a department by typing its name here.",
      },
    },
    {
      element: '[data-tour="departments-view-toggle"]',
      popover: {
        title: "Switch Your View",
        description:
          "Toggle between grid cards and a table view — pick whichever you prefer.",
      },
    },
    {
      element: '[data-tour="departments-add"]',
      popover: {
        title: "Add a Department",
        description:
          "Click here to create a new department. You'll set the name, assign a head, and allocate a budget.",
      },
    },
    {
      element: '[data-tour="departments-list"]',
      popover: {
        title: "Your Departments",
        description:
          "Here are all your departments. Click any one to see its details, members, and budget info.",
      },
    },
  ];
}
