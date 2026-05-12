"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import {
  Activity,
  Box,
  DollarSign,
  Gauge,
  KeyRound,
  Layers,
  LayoutDashboard,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { usePropertyControlRoom } from "../hooks/usePropertyControlRoom";
import { ContextRail } from "./ContextRail";
import { ControlRoomTopBar } from "./ControlRoomTopBar";
import { OverviewTab } from "./tabs/OverviewTab";
import { DigitalTwinTab } from "./tabs/DigitalTwinTab";
import { SystemsTab } from "./tabs/SystemsTab";
import { SensorsTab } from "./tabs/SensorsTab";
import { AIInsightsTab } from "./tabs/AIInsightsTab";
import { SecurityTab } from "./tabs/SecurityTab";
import { StaffTab } from "./tabs/StaffTab";
import { FinancialsTab } from "./tabs/FinancialsTab";
import { MaintenanceTab } from "./tabs/MaintenanceTab";
import { NewWorkOrderModal } from "./tabs/maintenance/NewWorkOrderModal";
import { AssignStaffModal } from "./tabs/staff/AssignStaffModal";
import { PropertyFormModal, type PropertyFormData } from "../components/PropertyFormModal";
import { AccessControlTab } from "@/features/access-control/AccessControlTab";
import { PropertyAreasPanel } from "../components/PropertyAreasPanel";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";

const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "twin", label: "Digital Twin", icon: Box },
  { id: "systems", label: "Systems", icon: Gauge },
  { id: "sensors", label: "Sensors", icon: Activity },
  { id: "ai", label: "AI Insights", icon: Sparkles },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "access-control", label: "Access Control", icon: KeyRound },
  { id: "areas", label: "Areas", icon: Layers },
  { id: "staff", label: "Staff", icon: Users },
  { id: "financials", label: "Financials", icon: DollarSign },
  { id: "maintenance", label: "Maintenance", icon: Wrench },
] as const;

const emptyForm: PropertyFormData = {
  name: "",
  description: "",
  type: "",
  status: "active",
  locationAddress: "",
  locationCity: "",
  locationProvince: "",
  locationCountry: "",
  locationPostalCode: "",
  locationLatitude: "",
  locationLongitude: "",
  sizeTotalArea: "",
  sizeUsableArea: "",
  sizeFloors: "",
  currentValue: "",
  monthlyOperatingCosts: "",
} as PropertyFormData;

interface ControlRoomShellProps {
  propertyId: string;
}

export function ControlRoomShell({ propertyId }: ControlRoomShellProps) {
  const router = useRouter();
  const search = useSearchParams();
  const tabFromUrl = search?.get("tab");
  const [tab, setTab] = useState<string>(
    (TABS.find((t) => t.id === tabFromUrl)?.id as string) || "overview"
  );
  const [focusEquipmentId, setFocusEquipmentId] = useState<string | null>(null);

  const qc = useQueryClient();
  const [showEdit, setShowEdit] = useState(false);
  const [editForm, setEditForm] = useState<PropertyFormData>(emptyForm);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [showNewWO, setShowNewWO] = useState(false);
  const [newWOEquipmentId, setNewWOEquipmentId] = useState<string | undefined>();
  const [newWOInsightId, setNewWOInsightId] = useState<string | undefined>();
  const [newWOTitle, setNewWOTitle] = useState<string | undefined>();
  const [showAssignStaff, setShowAssignStaff] = useState(false);

  const { data, isLoading, error, refetch } = usePropertyControlRoom(propertyId);

  const changeTab = useCallback(
    (id: string) => {
      setTab(id);
      const params = new URLSearchParams(Array.from(search?.entries() ?? []));
      params.set("tab", id);
      router.replace(`/properties/${propertyId}?${params.toString()}`, { scroll: false });
    },
    [propertyId, router, search]
  );

  const goToTwinWithEquipment = useCallback(
    (equipmentId: string) => {
      setFocusEquipmentId(equipmentId);
      changeTab("twin");
    },
    [changeTab]
  );

  const openNewWorkOrder = useCallback(
    (opts?: { equipmentId?: string; insightId?: string; title?: string }) => {
      setNewWOEquipmentId(opts?.equipmentId);
      setNewWOInsightId(opts?.insightId);
      setNewWOTitle(opts?.title);
      setShowNewWO(true);
    },
    []
  );

  const breadcrumbItems = useMemo(
    () => (data?.property?.name ? [{ label: data.property.name }] : []),
    [data?.property?.name]
  );

  if (isLoading) return <LoadingSpinnerCentered text="Loading control room..." />;
  if (error || !data)
    return (
      <ErrorDisplayCentered
        title="Error loading property"
        message={(error as Error | null)?.message || "Property not found"}
        onRetry={refetch}
      />
    );

  const { property, systems, zones, equipment, sensors, stakeholders, aiModels, insights, workOrders, alerts, health } = data;

  return (
    <>
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}
      <div className="space-y-4">
        <ControlRoomTopBar
          onBack={() => router.push("/properties")}
          onEdit={() => {
            setEditForm({
              name: property.name ?? "",
              description: (property.description as string) ?? "",
              type: (property.type as PropertyFormData["type"]) ?? "",
              status: (property.status as PropertyFormData["status"]) ?? "active",
              locationAddress: (property.locationAddress as string) ?? "",
              locationCity: (property.locationCity as string) ?? "",
              locationProvince: (property.locationProvince as string) ?? "",
              locationCountry: (property.locationCountry as string) ?? "",
              locationPostalCode: (property.locationPostalCode as string) ?? "",
              locationLatitude: (property.locationLatitude as number | undefined)?.toString() ?? "",
              locationLongitude: (property.locationLongitude as number | undefined)?.toString() ?? "",
              sizeTotalArea: (property.sizeTotalArea as number | undefined)?.toString() ?? "",
              sizeUsableArea: (property.sizeUsableArea as number | undefined)?.toString() ?? "",
              sizeFloors: (property.sizeFloors as number | undefined)?.toString() ?? "",
              currentValue: (property.currentValue as number | undefined)?.toString() ?? "",
              monthlyOperatingCosts: (property.monthlyOperatingCosts as number | undefined)?.toString() ?? "",
            });
            setShowEdit(true);
          }}
          onNewWorkOrder={() => openNewWorkOrder()}
          onAssignStaff={() => setShowAssignStaff(true)}
        />

        <div className="flex flex-col lg:flex-row gap-6">
          <ContextRail property={property} health={health} alerts={alerts} staff={stakeholders} />

          <div className="flex-1 min-w-0">
            <Tabs value={tab} onValueChange={changeTab}>
              <TabsList className="w-full justify-start overflow-x-auto h-auto bg-stone-100 dark:bg-stone-900 p-1">
                {TABS.map((t) => {
                  const Icon = t.icon;
                  return (
                    <TabsTrigger key={t.id} value={t.id} className="gap-1.5">
                      <Icon className="w-3.5 h-3.5" />
                      {t.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>

              <TabsContent value="overview" className="mt-4">
                <OverviewTab
                  property={property}
                  health={health}
                  alerts={alerts}
                  insights={insights}
                  workOrders={workOrders}
                  onEdit={() => setShowEdit(true)}
                />
              </TabsContent>
              <TabsContent value="twin" className="mt-4">
                <DigitalTwinTab />
              </TabsContent>
              <TabsContent value="systems" className="mt-4">
                <SystemsTab systems={systems} equipment={equipment} sensors={sensors} />
              </TabsContent>
              <TabsContent value="sensors" className="mt-4">
                <SensorsTab property={property} sensors={sensors} systems={systems} zones={zones} equipment={equipment} />
              </TabsContent>
              <TabsContent value="ai" className="mt-4">
                <AIInsightsTab
                  propertyId={propertyId}
                  models={aiModels}
                  equipment={equipment}
                  onFocusIn3D={goToTwinWithEquipment}
                  onCreateWorkOrder={(opts) => openNewWorkOrder(opts)}
                />
              </TabsContent>
              <TabsContent value="security" className="mt-4">
                <SecurityTab propertyId={propertyId} />
              </TabsContent>
              <TabsContent value="access-control" className="mt-4">
                <AccessControlTab />
              </TabsContent>
              <TabsContent value="areas" className="mt-4">
                <PropertyAreasPanel propertyId={propertyId} />
              </TabsContent>
              <TabsContent value="staff" className="mt-4">
                <StaffTab propertyId={propertyId} />
              </TabsContent>
              <TabsContent value="financials" className="mt-4">
                <FinancialsTab property={property} />
              </TabsContent>
              <TabsContent value="maintenance" className="mt-4">
                <MaintenanceTab
                  propertyId={propertyId}
                  equipment={equipment}
                  onNew={() => openNewWorkOrder()}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <PropertyFormModal
        open={showEdit}
        onOpenChange={setShowEdit}
        mode="edit"
        formData={editForm}
        setFormData={setEditForm}
        isSubmitting={editSubmitting}
        onSubmit={async (e) => {
          e.preventDefault();
          if (!property?.id) return;
          setEditSubmitting(true);
          try {
            const payload: Record<string, unknown> = {
              id: property.id,
              name: editForm.name.trim(),
              status: editForm.status,
              description: editForm.description?.trim() || null,
              type: editForm.type?.trim() || null,
              locationAddress: editForm.locationAddress?.trim() || null,
              locationCity: editForm.locationCity?.trim() || null,
              locationProvince: editForm.locationProvince?.trim() || null,
              locationCountry: editForm.locationCountry?.trim() || null,
              locationPostalCode: editForm.locationPostalCode?.trim() || null,
            };
            for (const [k, v] of Object.entries({
              locationLatitude: editForm.locationLatitude,
              locationLongitude: editForm.locationLongitude,
              sizeTotalArea: editForm.sizeTotalArea,
              sizeUsableArea: editForm.sizeUsableArea,
              currentValue: editForm.currentValue,
              monthlyOperatingCosts: editForm.monthlyOperatingCosts,
            })) {
              const trimmed = v?.trim();
              payload[k] = trimmed && !isNaN(parseFloat(trimmed)) ? parseFloat(trimmed) : null;
            }
            const floors = editForm.sizeFloors?.trim();
            payload.sizeFloors = floors && !isNaN(parseInt(floors)) ? parseInt(floors) : null;
            await bmsApi.properties.update(property.id as string, payload);
            toast.success("Property updated");
            setShowEdit(false);
            qc.invalidateQueries({ queryKey: propertyKeys.detail(property.id as string) });
          } catch (err) {
            toast.error(err instanceof BmsApiError ? err.message : "Failed to update property");
          } finally {
            setEditSubmitting(false);
          }
        }}
      />

      <NewWorkOrderModal
        open={showNewWO}
        onOpenChange={setShowNewWO}
        propertyId={propertyId}
        equipment={equipment}
        defaultEquipmentId={newWOEquipmentId}
        defaultInsightId={newWOInsightId}
        defaultTitle={newWOTitle}
      />

      <AssignStaffModal
        open={showAssignStaff}
        onOpenChange={setShowAssignStaff}
        propertyId={propertyId}
      />
    </>
  );
}
