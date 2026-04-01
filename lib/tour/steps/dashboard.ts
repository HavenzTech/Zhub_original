import type { DriveStep } from "driver.js";

export function getDashboardSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to Havenz Hub!",
        description:
          "Hey there! Let's take a quick tour of your dashboard. This is your home base — everything you need to stay on top of things is right here.",
      },
    },
    {
      element: '[data-tour="dashboard-welcome"]',
      popover: {
        title: "Your Daily Overview",
        description:
          "This card shows your company info, a personalized greeting, and the current time. A nice way to start your day!",
      },
    },
    {
      element: '[data-tour="dashboard-stats"]',
      popover: {
        title: "Quick Stats at a Glance",
        description:
          "See how many properties, active projects, documents, and pending reviews you have. These numbers update in real time so you're always in the loop.",
      },
    },
    {
      element: '[data-tour="dashboard-projects"]',
      popover: {
        title: "Your Projects",
        description:
          "Here are your active projects with progress bars. Click any project to dive into its details, tasks, and documents.",
      },
    },
    {
      element: '[data-tour="dashboard-tasks"]',
      popover: {
        title: "My Tasks",
        description:
          "Your assigned tasks, sorted by urgency — overdue items show up first so nothing slips through the cracks.",
      },
    },
    {
      element: '[data-tour="dashboard-documents"]',
      popover: {
        title: "Recent Documents",
        description:
          "Quick access to the latest documents across your projects. Click any document to view or manage it.",
      },
    },
    {
      element: '[data-tour="sidebar-nav"]',
      popover: {
        title: "Navigation Sidebar",
        description:
          "This is your main navigation. Each section has its own features and its own tour to help you learn the ropes!",
        side: "right",
      },
    },
    {
      element: '[data-tour="sidebar-projects"]',
      popover: {
        title: "Projects",
        description:
          "Manage all your projects here — create new ones, track progress, assign team members, and manage budgets.",
        side: "right",
      },
    },
    {
      element: '[data-tour="sidebar-document-control"]',
      popover: {
        title: "Document Control",
        description:
          "Your secure document hub. Upload, version, share, and track documents with full workflow support.",
        side: "right",
      },
    },
    {
      element: '[data-tour="sidebar-z-ai"]',
      popover: {
        title: "Z AI Assistant",
        description:
          "Your AI-powered assistant! Ask questions about your documents, projects, or anything else. Give it a try!",
        side: "right",
      },
    },
    {
      element: '[data-tour="sidebar-profile"]',
      popover: {
        title: "Your Profile",
        description:
          "Access your settings, notifications, and log out from here. You can also switch between companies if you belong to more than one.",
        side: "right",
      },
    },
    {
      popover: {
        title: "You're All Set!",
        description:
          "Go ahead and explore — click on Projects in the sidebar to continue your tour there. Each page has its own walkthrough waiting for you!",
      },
    },
  ];
}
