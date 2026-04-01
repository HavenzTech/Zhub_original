import type { DriveStep } from "driver.js";

export function getPropertyDetailSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Property Details",
        description:
          "Here's everything about this property. Let's walk through the key sections.",
      },
    },
    {
      element: '[data-tour="property-details"]',
      popover: {
        title: "Property Information",
        description:
          "All the key details — name, address, property type, dimensions, and current value. Click Edit to update anything.",
      },
    },
  ];
}
