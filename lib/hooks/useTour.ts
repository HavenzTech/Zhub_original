"use client";

import { useEffect, useRef, useCallback } from "react";
import { driver, type Driver } from "driver.js";
import { toast } from "sonner";
import { useTourContext } from "@/contexts/TourContext";
import { authService } from "@/lib/services/auth";
import { getTourConfig } from "@/lib/tour/tour-theme";
import type { TourKey, UseTourOptions } from "@/lib/tour/types";

/** Minimum screen width for tours (desktop only) */
const MIN_TOUR_WIDTH = 768;

export function useTour(tourKey: TourKey, options: UseTourOptions) {
  const { steps, enabled = true, adminOnly = false } = options;
  const { isCompleted, markCompleted, isLoaded, isTourActive, setTourActive } =
    useTourContext();
  const driverRef = useRef<Driver | null>(null);
  const hasAutoStarted = useRef(false);
  // Use refs for values needed inside startTour to keep the callback stable
  const isTourActiveRef = useRef(isTourActive);
  isTourActiveRef.current = isTourActive;
  const stepsRef = useRef(steps);
  stepsRef.current = steps;

  const startTour = useCallback(() => {
    // Desktop only
    if (typeof window === "undefined" || window.innerWidth < MIN_TOUR_WIDTH) return;
    // Don't start if another tour is active
    if (isTourActiveRef.current) return;
    // Admin check
    if (adminOnly && !authService.isAdmin()) return;

    const currentSteps = stepsRef.current;
    if (!currentSteps || currentSteps.length === 0) return;

    // Expand sidebar before starting (in case it's collapsed)
    window.dispatchEvent(new Event("tour-expand-sidebar"));

    const d = driver({
      ...getTourConfig(),
      steps: currentSteps,
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
        driverRef.current = null;
      },
    });

    driverRef.current = d;
    setTourActive(true);
    d.drive();
  }, [tourKey, markCompleted, setTourActive, adminOnly]);

  // Auto-start on first visit
  useEffect(() => {
    if (!isLoaded || !enabled || hasAutoStarted.current) return;
    if (isCompleted(tourKey)) return;
    if (adminOnly && !authService.isAdmin()) return;
    if (typeof window === "undefined" || window.innerWidth < MIN_TOUR_WIDTH) return;

    hasAutoStarted.current = true;
    // Small delay to let the page render
    const timer = setTimeout(() => {
      startTour();
    }, 600);

    return () => clearTimeout(timer);
  }, [isLoaded, enabled, tourKey, isCompleted, adminOnly, startTour]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
        driverRef.current = null;
      }
    };
  }, []);

  return {
    startTour,
    isCompleted: isCompleted(tourKey),
  };
}
