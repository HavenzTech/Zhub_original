"use client";

import { useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { ControlRoomShell } from "@/features/properties/control-room/ControlRoomShell";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getPropertyDetailSteps } from "@/lib/tour/steps";

export default function PropertyDetailPage() {
  const params = useParams();
  const propertyId = params?.id as string;

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.PROPERTY_DETAIL} options={{ steps: getPropertyDetailSteps(), enabled: !!propertyId }} />
      {propertyId && <ControlRoomShell propertyId={propertyId} />}
    </AppLayout>
  );
}
