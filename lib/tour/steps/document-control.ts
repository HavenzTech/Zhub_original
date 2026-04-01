import type { DriveStep } from "driver.js";

export function getDocumentControlSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Welcome to Document Control!",
        description:
          "This is your secure document management hub. Upload, organize, version, and share documents — all in one place. Let's explore!",
      },
    },
    {
      element: '[data-tour="doccontrol-toolbar"]',
      popover: {
        title: "Toolbar",
        description:
          "Upload documents, create folders, refresh the list, and search — all from this toolbar.",
      },
    },
    {
      element: '[data-tour="doccontrol-folder-tree"]',
      popover: {
        title: "Folder Tree",
        description:
          "Navigate your folder structure here. Click folders to browse, and drag & drop to organize your documents.",
        side: "right",
      },
    },
    {
      element: '[data-tour="doccontrol-document-list"]',
      popover: {
        title: "Document List",
        description:
          "All your documents in the current folder. Click any document to preview it and see its details.",
      },
    },
    {
      element: '[data-tour="doccontrol-filters"]',
      popover: {
        title: "Filters",
        description:
          "Filter documents by status, classification, or type. Great for finding exactly what you need.",
      },
    },
    {
      element: '[data-tour="doccontrol-preview"]',
      popover: {
        title: "Document Preview & Details",
        description:
          "When you select a document, its preview appears here along with tabs for Metadata, Versions, Sharing, Permissions, and Workflow.",
      },
    },
    {
      element: '[data-tour="doccontrol-chat"]',
      popover: {
        title: "Document Chat",
        description:
          "Ask Z AI questions about your documents right here. It can summarize, compare, and find information across your files.",
        side: "left",
      },
    },
  ];
}
