import type { DriveStep } from "driver.js";

export function getZAiSteps(): DriveStep[] {
  return [
    {
      popover: {
        title: "Meet Z AI!",
        description:
          "This is your AI-powered assistant. Z AI can help you find information, analyze documents, answer questions, and a whole lot more.",
      },
    },
    {
      element: '[data-tour="zai-chat"]',
      popover: {
        title: "Chat Area",
        description:
          "Your conversation with Z AI appears here. It remembers context from your current chat, so feel free to ask follow-up questions.",
      },
    },
    {
      element: '[data-tour="zai-input"]',
      popover: {
        title: "Ask Away!",
        description:
          "Type your question or request here and hit send. Try something like \"What documents were updated this week?\" or \"Summarize my active projects.\"",
      },
    },
    {
      popover: {
        title: "Give It a Try!",
        description:
          "Go ahead and send Z AI a message — start with something simple like \"Hello\" to see how it responds. It's here to help!",
      },
    },
  ];
}
