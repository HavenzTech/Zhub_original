import type { DriveStep } from "driver.js";

export function getPropertiesListSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to Properties!",
        description:
          "Manage all your properties and real estate assets from here. Let's take a look around.",
      },
    },
    {
      element: '[data-tour="properties-stats"]',
      popover: {
        title: "Property Stats",
        description:
          "A quick overview of your property portfolio — total properties, types, and status breakdown.",
      },
    },
    {
      element: '[data-tour="properties-search"]',
      popover: {
        title: "Search Properties",
        description:
          "Find a property by name, location, or type. Start typing to filter the list.",
      },
    },
    {
      element: '[data-tour="properties-view-toggle"]',
      popover: {
        title: "Switch Your View",
        description:
          "Toggle between grid cards and a table view to browse your properties.",
      },
    },
    {
      element: '[data-tour="properties-add"]',
      popover: {
        title: "Add a Property",
        description:
          "Click here to register a new property. You'll enter the address, type, area, and other details.",
      },
    },
    {
      element: '[data-tour="properties-list"]',
      popover: {
        title: "Your Properties",
        description:
          "Here are all your properties. Click any one to see its full details, location, and metrics.",
      },
    },
  ];
}
