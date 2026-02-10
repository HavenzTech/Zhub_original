"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { ProjectDetails } from "@/features/projects/components/ProjectDetails";
import { MembersAssignment } from "@/components/common/MembersAssignment";
import { DepartmentsAssignment } from "@/components/common/DepartmentsAssignment";
import { ProjectTasksSection } from "@/features/tasks/components";
import { ExpenseList } from "@/features/expenses/components";
import { Button } from "@/components/ui/button";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Project, Company } from "@/types/bms";
import { toast } from "sonner";
import { formatDateForInput } from "@/features/tasks/utils/taskHelpers";
import { ArrowLeft } from "lucide-react";

const ProjectFormModal = dynamic(
  () =>
    import("@/features/projects/components/ProjectFormModal").then((mod) => ({
      default: mod.ProjectFormModal,
    })),
  { ssr: false }
);

const initialFormData = {
  name: "",
  description: "",
  status: "planning",
  priority: "medium",
  startDate: "",
  endDate: "",
  budgetAllocated: "",
  budgetSpent: "",
  teamLead: "",
  projectedDeadline: "",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingActive, setIsSettingActive] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [activeTab, setActiveTab] = useState("overview");

  // Memoize breadcrumb items to prevent unnecessary re-renders
  const breadcrumbItems = useMemo(
    () => (project?.name ? [{ label: project.name }] : []),
    [project?.name]
  );

  const loadProject = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      setError(null);

      const auth = authService.getAuth();
      if (!auth) {
        router.push("/login");
        return;
      }

      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();

      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      const data = await bmsApi.projects.getById(projectId);
      setProject(data as Project);

      // Fetch company name if companyId exists
      if ((data as Project).companyId) {
        try {
          const companyData = await bmsApi.companies.getById((data as Project).companyId);
          setCompany(companyData as Company);
        } catch {
          // Silently fail - company name is optional
        }
      }
    } catch (err) {
      console.error("Error loading project:", err);
      setError(err instanceof Error ? err : new Error("Failed to load project"));
    } finally {
      setLoading(false);
    }
  }, [projectId, router]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  const handleBack = () => {
    router.push("/projects");
  };

  const handleEdit = (project: Project) => {
    setFormData({
      name: project.name ?? "",
      description: project.description ?? "",
      status: project.status ?? "planning",
      priority: project.priority ?? "medium",
      startDate: formatDateForInput(project.startDate),
      endDate: formatDateForInput(project.endDate),
      budgetAllocated: project.budgetAllocated?.toString() ?? "",
      budgetSpent: project.budgetSpent?.toString() ?? "",
      teamLead: project.teamLead ?? "",
      projectedDeadline: formatDateForInput(project.projectedDeadline),
    });
    setShowEditForm(true);
  };

  const handleSetActive = async () => {
    if (!project?.id) return;

    setIsSettingActive(true);
    try {
      const payload = {
        id: project.id,
        companyId: project.companyId,
        name: project.name,
        status: "active",
        priority: project.priority,
      };
      await bmsApi.projects.update(project.id, payload);
      toast.success("Project status set to Active!");
      setProject({ ...project, status: "active" });
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update project status";
      toast.error(errorMessage);
    } finally {
      setIsSettingActive(false);
    }
  };

  const buildPayload = (includeId?: string) => {
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      status: formData.status,
      priority: formData.priority,
      // progress is now auto-calculated from tasks - removed from payload
    };

    if (includeId) {
      payload.id = includeId;
      if (project) {
        payload.companyId = project.companyId;
        payload.company = project.companyId;
      }
    }

    if (formData.description?.trim())
      payload.description = formData.description.trim();
    if (formData.startDate?.trim())
      payload.startDate = formData.startDate.trim();
    if (formData.endDate?.trim()) payload.endDate = formData.endDate.trim();
    if (formData.teamLead?.trim())
      payload.teamLead = formData.teamLead.trim();
    if (formData.projectedDeadline?.trim())
      payload.projectedDeadline = formData.projectedDeadline.trim();

    const budgetAllocated = formData.budgetAllocated?.trim();
    if (budgetAllocated && !isNaN(parseFloat(budgetAllocated))) {
      payload.budgetAllocated = parseFloat(budgetAllocated);
    }

    const budgetSpent = formData.budgetSpent?.trim();
    if (budgetSpent && !isNaN(parseFloat(budgetSpent))) {
      payload.budgetSpent = parseFloat(budgetSpent);
    }

    return payload;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project?.id || !formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload(project.id);
      await bmsApi.projects.update(project.id, payload);
      toast.success("Project updated successfully!");
      setProject({ ...project, ...payload } as Project);
      setShowEditForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update project";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <LoadingSpinnerCentered text="Loading project..." />
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <ErrorDisplayCentered
          title="Error loading project"
          message={error?.message || "Project not found"}
          onRetry={loadProject}
        />
      </AppLayout>
    );
  }

  const formatBudget = (value?: number | null) => {
    if (!value) return "-";
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  const progress = project.progress ?? 0;

  return (
    <AppLayout>
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-0">
        {/* Header */}
        <div className="pb-4 border-b border-stone-200 dark:border-stone-700 mb-0">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={handleBack}
              className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </button>
            <div className="w-3 h-3 rounded-full bg-accent-cyan" />
            <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
              {project.name}
            </h1>
            <span
              className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                project.status === "active" || project.status === "completed"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                  : project.status === "in_progress"
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                  : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
              }`}
            >
              {project.status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1">
            {["overview", "tasks", "team", "budget"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="pt-6 space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Budget</div>
                  <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{formatBudget(project.budgetAllocated)}</div>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Spent</div>
                  <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{formatBudget(project.budgetSpent)}</div>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">Progress</div>
                  <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{progress}%</div>
                </div>
                <div className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">End Date</div>
                  <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">
                    {project.endDate ? new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-"}
                  </div>
                </div>
              </div>

              {/* Description & Details */}
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-5">
                <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 mb-3">Description</h3>
                <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed mb-5">
                  {project.description || "No description provided."}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                  <div>
                    <span className="text-xs text-stone-400 dark:text-stone-500">Team Lead</span>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-50">{project.teamLead || "-"}</div>
                  </div>
                  <div>
                    <span className="text-xs text-stone-400 dark:text-stone-500">Timeline</span>
                    <div className="text-sm font-medium text-stone-900 dark:text-stone-50">
                      {project.startDate ? new Date(project.startDate).toLocaleDateString() : "?"} - {project.endDate ? new Date(project.endDate).toLocaleDateString() : "?"}
                    </div>
                  </div>
                </div>
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-xs text-stone-500 dark:text-stone-400">Progress</span>
                    <span className="text-xs font-medium text-stone-900 dark:text-stone-50">{progress}%</span>
                  </div>
                  <div className="h-2 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                    <div className="h-full bg-accent-cyan rounded-full" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>

              {/* Edit / Set Active buttons */}
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => handleEdit(project)} className="border-stone-300 dark:border-stone-600">
                  Edit Project
                </Button>
                {project.status !== "active" && (
                  <Button
                    onClick={handleSetActive}
                    disabled={isSettingActive}
                    className="bg-accent-cyan hover:bg-accent-cyan/90 text-white"
                  >
                    {isSettingActive ? "Setting..." : "Set Active"}
                  </Button>
                )}
              </div>
            </>
          )}

          {activeTab === "tasks" && (
            <ProjectTasksSection
              projectId={project.id!}
              projectName={project.name || "this project"}
            />
          )}

          {activeTab === "team" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MembersAssignment
                entityType="project"
                entityId={project.id!}
                entityName={project.name || "this project"}
              />
              <DepartmentsAssignment
                projectId={project.id!}
                projectName={project.name || "this project"}
              />
            </div>
          )}

          {activeTab === "budget" && (
            <ExpenseList
              projectId={project.id!}
              projectName={project.name || "this project"}
              onBudgetUpdate={(newBudgetSpent) => {
                setProject((prev) => prev ? { ...prev, budgetSpent: newBudgetSpent } : prev);
              }}
            />
          )}
        </div>

        {/* Edit Modal */}
        <ProjectFormModal
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
