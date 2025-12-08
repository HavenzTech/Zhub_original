"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useCompanies } from "@/lib/hooks/useCompanies";
import { CompanyCard } from "@/features/companies/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Company } from "@/types/bms";
import { toast } from "sonner";
import { Building2, Plus, Search, RefreshCw } from "lucide-react";

const CompanyFormModal = dynamic(
  () =>
    import("@/features/companies/components/CompanyFormModal").then((mod) => ({
      default: mod.CompanyFormModal,
    })),
  { ssr: false, loading: () => <LoadingSpinnerCentered /> }
);

const initialFormData = {
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
};

export default function CompaniesPage() {
  const router = useRouter();
  const { companies, loading, error, loadCompanies, setCompanies } =
    useCompanies();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();

    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);

    loadCompanies();
  }, [router, loadCompanies]);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: formData.name,
      status: formData.status,
    };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Company name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const newCompany = await bmsApi.companies.create(payload);

      setCompanies((prev) => [...prev, newCompany as Company]);
      toast.success("Company created successfully!");
      setShowAddForm(false);
      setFormData(initialFormData);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create company";
      toast.error(errorMessage);
      console.error("Error creating company:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewDetails = (company: Company) => {
    router.push(`/companies/${company.id}`);
  };

  const filteredCompanies = companies.filter(
    (company) =>
      company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
            <p className="text-gray-600">
              Manage your organization companies and their operations
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadCompanies}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {authService.hasPermission("create", "company") && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Company
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading companies...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to load companies
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
                {error.message === "Failed to fetch"
                  ? "Could not connect to the server. Please check your connection and try again."
                  : error.message}
              </p>
              <Button variant="outline" onClick={loadCompanies}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search companies..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="secondary">
                {filteredCompanies.length}{" "}
                {filteredCompanies.length === 1 ? "company" : "companies"}
              </Badge>
            </div>

            {/* Companies Grid */}
            {filteredCompanies.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No companies found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm
                ? "Try adjusting your search criteria"
                : "Get started by adding your first company"}
            </p>
            {authService.hasPermission("create", "company") && (
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Company
              </Button>
            )}
          </div>
        )}
          </>
        )}

        {/* Add Company Modal */}
        <CompanyFormModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />
      </div>
    </AppLayout>
  );
}
