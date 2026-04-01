import type { DriveStep } from "driver.js";

export function getSettingsSteps(
  isAdmin: boolean,
  isSuperAdmin: boolean
): DriveStep[] {
  const steps: DriveStep[] = [
    {
      popover: {
        title: "Welcome to Settings!",
        description:
          "This is where you customize your experience and manage your organization's configuration.",
      },
    },
    {
      element: '[data-tour="settings-tabs"]',
      popover: {
        title: "Settings Tabs",
        description:
          "Switch between different settings sections. What you see here depends on your role in the organization.",
      },
    },
    {
      element: '[data-tour="settings-tab-general"]',
      popover: {
        title: "General Settings",
        description:
          "Manage your theme preference (light, dark, or system) and other general configuration.",
      },
    },
  ];

  if (isAdmin) {
    steps.push({
      element: '[data-tour="settings-tab-users"]',
      popover: {
        title: "Staff & Roles",
        description:
          "As an admin, you can manage users, assign roles, and control what each role can access. You can also reset onboarding tours for any user.",
      },
    });
  }

  if (isSuperAdmin) {
    steps.push({
      element: '[data-tour="settings-tab-companies"]',
      popover: {
        title: "Companies",
        description:
          "As a super admin, you can manage all companies in the system — add new ones, edit details, or manage their settings.",
      },
    });
  }

  if (isAdmin) {
    steps.push({
      element: '[data-tour="settings-tab-doc-settings"]',
      popover: {
        title: "Document Settings",
        description:
          "Configure folder templates, retention policies, and document workflows. These settings apply to your entire organization.",
      },
    });
  }

  steps.push({
    popover: {
      title: "That's Settings!",
      description:
        "You can come back here anytime to adjust your preferences or manage your organization.",
    },
  });

  return steps;
}
