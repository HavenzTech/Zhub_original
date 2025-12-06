"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { CompanyDetails } from "@/features/companies/components/CompanyDetails";
import { Button } from "@/components/ui/button";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Company } from "@/types/bms";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

const CompanyFormModal = dynamic(
  () =>
    import("@/features/companies/components/CompanyFormModal").then((mod) => ({
      default: mod.CompanyFormModal,
    })),
  { ssr: false }
);

export default function CompanyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const companyId = params.id as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    status: "active",
    locationAddress: "",
    locationCity: "",
    locationProvince: "",
    locationCountry: "",
    locationPostalCode: "",
    contactEmail: "",
    contactPhone: "",
    annualRevenue: "",
    logoUrl: "",
  });

  const loadCompany = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const auth = authService.getAuth();
      if (!auth) {
        router.push("/login");
        return;
      }

      const token = authService.getToken();
      const currentCompanyId = authService.getCurrentCompanyId();

      if (token) bmsApi.setToken(token);
      if (currentCompanyId) bmsApi.setCompanyId(currentCompanyId);

      const data = await bmsApi.companies.getById(companyId);
      setCompany(data as Company);
    } catch (err) {
      console.error("Error loading company:", err);
      setError(err instanceof Error ? err : new Error("Failed to load company"));
    } finally {
      setLoading(false);
    }
  }, [companyId, router]);

  useEffect(() => {
    loadCompany();
  }, [loadCompany]);

  const handleBack = () => {
    router.push("/companies");
  };

  const handleEdit = (company: Company) => {
    setFormData({
      name: company.name ?? "",
      industry: company.industry ?? "",
      status: company.status ?? "active",
      locationAddress: company.locationAddress ?? "",
      locationCity: company.locationCity ?? "",
      locationProvince: company.locationProvince ?? "",
      locationCountry: company.locationCountry ?? "",
      locationPostalCode: company.locationPostalCode ?? "",
      contactEmail: company.contactEmail ?? "",
      contactPhone: company.contactPhone ?? "",
      annualRevenue: company.annualRevenue?.toString() ?? "",
      logoUrl: company.logoUrl ?? "",
    });
    setShowEditForm(true);
  };

  const buildPayload = (includeId?: string) => {
    const payload: Record<string, unknown> = {
      name: formData.name,
      status: formData.status,
    };

    if (includeId) payload.id = includeId;
    if (formData.industry?.trim()) payload.industry = formData.industry;
    if (formData.locationAddress?.trim())
      payload.locationAddress = formData.locationAddress;
    if (formData.locationCity?.trim())
      payload.locationCity = formData.locationCity;
    if (formData.locationProvince?.trim())
      payload.locationProvince = formData.locationProvince;
    if (formData.locationCountry?.trim())
      payload.locationCountry = formData.locationCountry;
    if (formData.locationPostalCode?.trim())
      payload.locationPostalCode = formData.locationPostalCode;
    if (formData.contactEmail?.trim())
      payload.contactEmail = formData.contactEmail;
    if (formData.contactPhone?.trim())
      payload.contactPhone = formData.contactPhone;
    if (formData.logoUrl?.trim()) payload.logoUrl = formData.logoUrl;
    if (formData.annualRevenue && !isNaN(parseFloat(formData.annualRevenue))) {
      payload.annualRevenue = parseFloat(formData.annualRevenue);
    }

    return payload;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company?.id) return;

    setIsSubmitting(true);
    try {
      const payload = buildPayload(company.id);
      await bmsApi.companies.update(company.id, payload);
      toast.success("Company updated successfully!");
      setCompany({ ...company, ...payload } as Company);
      setShowEditForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update company";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinnerCentered text="Loading company..." />
      </AppLayout>
    );
  }

  if (error || !company) {
    return (
      <AppLayout>
        <ErrorDisplayCentered
          title="Error loading company"
          message={error?.message || "Company not found"}
          onRetry={loadCompany}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Companies
        </Button>

        {/* Company Details */}
        <CompanyDetails company={company} onEdit={handleEdit} />

        {/* Edit Modal */}
        <CompanyFormModal
          open={showEditForm}
          onOpenChange={setShowEditForm}
          mode="edit"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleEditSubmit}
        />
      </div>
    </AppLayout>
  );
}
