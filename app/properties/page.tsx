"use client";

import { AppLayout } from "@/components/layout/AppLayout";
import { PortfolioPage } from "@/features/properties/portfolio/PortfolioPage";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getPropertiesListSteps } from "@/lib/tour/steps";

export default function PropertiesPage() {
  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.PROPERTIES_LIST} options={{ steps: getPropertiesListSteps() }} />
      <PortfolioPage />
    </AppLayout>
  );
}
