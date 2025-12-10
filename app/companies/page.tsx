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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);

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
    // Backend CreateCompanyRequest uses different field names than the Company entity
    const payload: Record<string, unknown> = {
      name: formData.name,
      status: formData.status,
    };

    if (formData.industry?.trim()) payload.industry = formData.industry;
    // Backend expects: address, city, province, country, postalCode (not locationAddress, etc.)
    if (formData.locationAddress?.trim())
      payload.address = formData.locationAddress;
    if (formData.locationCity?.trim())
      payload.city = formData.locationCity;
    if (formData.locationProvince?.trim())
      payload.province = formData.locationProvince;
    if (formData.locationCountry?.trim())
      payload.country = formData.locationCountry;
    if (formData.locationPostalCode?.trim())
      payload.postalCode = formData.locationPostalCode;
    // Backend expects: email, phone (not contactEmail, contactPhone)
    if (formData.contactEmail?.trim())
      payload.email = formData.contactEmail;
    if (formData.contactPhone?.trim())
      payload.phone = formData.contactPhone;
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
      const companyId = (newCompany as Company).id;

      // Upload logo if a file was selected
      if (logoFile && companyId) {
        try {
          await bmsApi.companies.uploadLogo(companyId, logoFile);
          toast.success("Company created with logo!");
        } catch (logoErr) {
          console.error("Error uploading logo:", logoErr);
          toast.success("Company created! Logo upload failed - you can add it later.");
        }
      } else {
        toast.success("Company created successfully!");
      }

      setCompanies((prev) => [...prev, newCompany as Company]);
      setShowAddForm(false);
      setFormData(initialFormData);
      setLogoFile(null);
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

  const handleDeleteClick = (company: Company) => {
    setDeleteCompany(company);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCompany) return;

    try {
      await bmsApi.companies.delete(deleteCompany.id!);
      setCompanies((prev) => prev.filter((c) => c.id !== deleteCompany.id));
      toast.success(`Company "${deleteCompany.name}" deleted successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to delete company";
      toast.error(errorMessage);
      console.error("Error deleting company:", err);
    } finally {
      setDeleteCompany(null);
    }
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
                onDelete={handleDeleteClick}
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
          onOpenChange={(open) => {
            setShowAddForm(open);
            if (!open) {
              setLogoFile(null);
            }
          }}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
          logoFile={logoFile}
          setLogoFile={setLogoFile}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteCompany}
          onOpenChange={(open) => !open && setDeleteCompany(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Company</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteCompany?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteCompany(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="!bg-red-600 hover:!bg-red-700 !text-white focus:ring-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AppLayout>
  );
}
