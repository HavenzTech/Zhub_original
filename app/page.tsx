// app/page.tsx - Dashboard
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import {
  Home,
  FolderOpen,
  FileText,
  Clock,
  Plus,
  Loader2,
  Building2,
  DollarSign,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { bmsApi } from "@/lib/services/bmsApi";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { AppLayout } from "@/components/layout/AppLayout";
import { formatCurrency } from "@/features/companies/utils/companyHelpers";

export default function HavenzHubDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const {
    companies,
    departments,
    projects,
    properties,
    bmsDevices,
    accessLogs,
    users,
    documents,
    loading,
    error,
    loadDashboardData,
  } = useDashboard();

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    const token = authService.getToken();
    const currentCompanyId = authService.getCurrentCompanyId();
    if (token) bmsApi.setToken(token);
    if (currentCompanyId) bmsApi.setCompanyId(currentCompanyId);

    setCompanyId(currentCompanyId);
    setIsAuthenticated(true);
    setAuthLoading(false);
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  const recentDocuments = [...documents]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 30) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const activeProjects = projects.filter((p) => p.status !== "completed");
  const pendingReviews = documents.filter(
    (d) => d.status === "pending_review" || d.status === "pending"
  );

  const currentCompany = companies.find((c) => c.id === companyId);

  const renderDashboard = () => {
    if (loading) {
      return <LoadingSpinnerCentered text="Loading dashboard..." />;
    }

    const locationParts = currentCompany
      ? [
          currentCompany.locationCity,
          currentCompany.locationProvince,
          currentCompany.locationCountry,
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    return (
      <div className="space-y-6">
        {/* Company Overview */}
        {currentCompany ? (
          <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
            <div className="flex items-center gap-4 mb-4">
              {currentCompany.logoUrl && !imageError ? (
                <Image
                  src={currentCompany.logoUrl}
                  alt={currentCompany.name}
                  className="rounded-xl object-cover"
                  width={48}
                  height={48}
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-12 h-12 bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-accent-cyan" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                  {currentCompany.name}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400">
                  {currentCompany.industry || "No industry specified"}
                </p>
              </div>
              <StatusBadge status={currentCompany.status || "active"} />
            </div>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-stone-500 dark:text-stone-400">
              {currentCompany.annualRevenue != null && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{formatCurrency(currentCompany.annualRevenue)}</span>
                </div>
              )}
              {currentCompany.contactEmail && (
                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{currentCompany.contactEmail}</span>
                </div>
              )}
              {currentCompany.contactPhone && (
                <div className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{currentCompany.contactPhone}</span>
                </div>
              )}
              {locationParts && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-accent-cyan" />
                  <span>{locationParts}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <h1 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">
            Dashboard
          </h1>
        )}

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Properties",
              value: properties.length,
            },
            {
              label: "Active Projects",
              value: activeProjects.length,
            },
            {
              label: "Documents",
              value: documents.length,
            },
            {
              label: "Pending Reviews",
              value: pendingReviews.length,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700"
            >
              <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">
                {stat.label}
              </div>
              <div className="text-3xl font-semibold text-stone-900 dark:text-stone-50">
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Projects List */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
              Projects
            </h2>
            <Button
              size="sm"
              onClick={() => router.push("/projects")}
              className="bg-accent-cyan hover:bg-accent-cyan/90 text-white text-xs"
            >
              <Plus className="w-3 h-3 mr-1" />
              New Project
            </Button>
          </div>
          {projects.length === 0 ? (
            <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-sm">
              No projects yet
            </div>
          ) : (
            projects.map((project) => {
              const progress = project.progress ?? 0;
              return (
                <div
                  key={project.id}
                  onClick={() => router.push(`/projects/${project.id}`)}
                  className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 last:border-b-0 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-center gap-3"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-accent-cyan flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-stone-900 dark:text-stone-50">
                      {project.name}
                    </div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {project.teamLead || "No team lead"}
                    </div>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                      project.status === "completed"
                        ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                        : project.status === "active" ||
                          project.status === "in_progress"
                        ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                        : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                    }`}
                  >
                    {project.status
                      ?.replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown"}
                  </span>
                  <div className="w-24 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-cyan rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-stone-500 dark:text-stone-400 w-8 text-right">
                    {progress}%
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Recent Documents */}
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
              Recent Documents
            </h2>
          </div>
          {recentDocuments.length === 0 ? (
            <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-sm">
              No documents yet
            </div>
          ) : (
            recentDocuments.map((doc) => (
              <div
                key={doc.id}
                onClick={() => router.push("/document-control")}
                className="px-5 py-3 border-b border-stone-100 dark:border-stone-800 last:border-b-0 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan flex-shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-stone-900 dark:text-stone-50 truncate">
                    {doc.name}
                  </div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {doc.category || doc.fileType || "Document"}
                  </div>
                </div>
                <StatusBadge status={doc.status || "draft"} />
                <span className="text-xs text-stone-400 dark:text-stone-500">
                  {formatRelativeTime(doc.updatedAt || doc.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-stone-50 dark:bg-stone-950">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent-cyan mx-auto mb-4" />
          <p className="text-stone-500 dark:text-stone-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout>{renderDashboard()}</AppLayout>;
}
