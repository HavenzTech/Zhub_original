"use client";

import { usePathname } from "next/navigation";
import { HelpCircle } from "lucide-react";
import { useTourContext } from "@/contexts/TourContext";
import { getTourKeyForRoute } from "@/lib/tour/tour-keys";
import { getTourStepsForRoute } from "@/lib/tour/steps";
import { getTourConfig } from "@/lib/tour/tour-theme";
import { driver } from "driver.js";
import { toast } from "sonner";

export function useTourReplay() {
  const pathname = usePathname();
  const { markCompleted, isTourActive, setTourActive } = useTourContext();

  const tourKey = getTourKeyForRoute(pathname);
  const hasTour = !!tourKey;

  const replay = () => {
    if (!tourKey || isTourActive) return;
    if (typeof window === "undefined" || window.innerWidth < 768) return;

    const steps = getTourStepsForRoute(tourKey);
    if (!steps || steps.length === 0) return;

    window.dispatchEvent(new Event("tour-expand-sidebar"));

    const d = driver({
      ...getTourConfig(),
      steps,
      onDestroyStarted: () => {
        if (d.hasNextStep()) {
          toast.info(
            "No worries! You can restart this tour anytime from the ? button in the sidebar.",
            { duration: 5000 }
          );
        }
        d.destroy();
      },
      onDestroyed: () => {
        markCompleted(tourKey);
        setTourActive(false);
      },
    });

    setTourActive(true);
    d.drive();
  };

  return { replay, hasTour, isTourActive };
}
