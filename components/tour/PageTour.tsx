"use client";

import { useTour } from "@/lib/hooks/useTour";
import type { TourKey, UseTourOptions } from "@/lib/tour/types";

interface PageTourProps {
  tourKey: TourKey;
  options: UseTourOptions;
}

/**
 * Invisible component that activates a tour for the current page.
 * Must be rendered inside AppLayout (within the TourProvider).
 */
export function PageTour({ tourKey, options }: PageTourProps) {
  useTour(tourKey, options);
  return null;
}
