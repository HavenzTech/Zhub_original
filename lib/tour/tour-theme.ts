import type { Config } from "driver.js";

/** Base driver.js configuration — matches Havenz Hub's design system */
export function getTourConfig(): Partial<Config> {
  return {
    popoverClass: "havenz-tour-popover",
    overlayColor: "rgba(0, 0, 0, 0.55)",
    stagePadding: 8,
    stageRadius: 8,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    showProgress: true,
    progressText: "{{current}} of {{total}}",
    nextBtnText: "Next",
    prevBtnText: "Back",
    doneBtnText: "Got it!",
  };
}
