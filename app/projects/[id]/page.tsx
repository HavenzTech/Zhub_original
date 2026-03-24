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
import { ProjectDocumentsTab } from "@/features/projects/components/ProjectDocumentsTab";
import { Button } from "@/components/ui/button";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Project, Company, ProjectSummaryDto } from "@/types/bms";
import { toast } from "sonner";
import { formatDateForInput } from "@/features/tasks/utils/taskHelpers";
import { ArrowLeft, Sparkles, Loader2, Bot, X } from "lucide-react";
import { useUsers } from "@/lib/hooks/useUsers";

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
  const [aiSummary, setAiSummary] = useState<ProjectSummaryDto | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryPhase, setSummaryPhase] = useState(0);
  const { users, loadUsers } = useUsers();

  const summaryMessages = [
    "Generating AI summary...",
    "Analyzing project metrics...",
    "Thinking critically...",
    "Compiling insights...",
    "Generating AI summary...",
  ];

  useEffect(() => {
    if (!summaryLoading) {
      setSummaryPhase(0);
      return;
    }
    const interval = setInterval(() => {
      setSummaryPhase((prev) => (prev + 1) % summaryMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [summaryLoading]);

  const handleGenerateSummary = async () => {
    if (!projectId) return;
    setSummaryLoading(true);
    setShowSummary(true);
    try {
      const data = await bmsApi.projects.getSummary(projectId);
      setAiSummary(data);
    } catch (err) {
      const msg = err instanceof BmsApiError ? err.message : "Failed to generate summary";
      toast.error(msg);
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  };

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
    loadUsers();
  }, [loadProject, loadUsers]);

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
            {["overview", "tasks", "documents", "team", "budget"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  if (tab === "documents") {
                    window.dispatchEvent(new Event("sidebar-collapse"));
                  }
                }}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  activeTab === tab
                    ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                }`}
              >
                {tab === "documents" ? "Project Documents" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className={activeTab === "documents" ? "" : "pt-6 space-y-6"}>
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

              {/* AI Summary */}
              {!showSummary ? (
                <button
                  onClick={handleGenerateSummary}
                  disabled={summaryLoading}
                  className="flex items-center gap-2 rounded-xl border border-dashed border-accent-cyan/40 bg-accent-cyan/5 px-4 py-3 text-sm font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 hover:border-accent-cyan/60 dark:bg-accent-cyan/5 dark:hover:bg-accent-cyan/10 w-full"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate AI Summary
                </button>
              ) : (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-accent-cyan" />
                      <span className="text-sm font-semibold text-stone-900 dark:text-stone-50">AI Summary</span>
                      {aiSummary && (
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">
                          {aiSummary.isAiGenerated
                            ? `Generated ${aiSummary.generatedAt ? new Date(aiSummary.generatedAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }) : ""}`
                            : "Fallback (AI unavailable)"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {!summaryLoading && (
                        <button
                          onClick={handleGenerateSummary}
                          className="rounded-md px-2 py-1 text-[11px] font-medium text-accent-cyan hover:bg-accent-cyan/10 transition-colors"
                        >
                          Regenerate
                        </button>
                      )}
                      <button
                        onClick={() => { setShowSummary(false); setAiSummary(null); }}
                        className="rounded-md p-1 text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-300 dark:hover:bg-stone-800 transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    {summaryLoading ? (
                      <div className="flex flex-col items-center gap-3 py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-accent-cyan" />
                        <span className="text-sm text-stone-500 dark:text-stone-400 transition-opacity duration-500">
                          {summaryMessages[summaryPhase]}
                        </span>
                      </div>
                    ) : aiSummary?.summary ? (
                      <div
                        className="prose prose-sm prose-stone dark:prose-invert max-w-none
                          prose-headings:text-stone-900 dark:prose-headings:text-stone-50 prose-headings:font-semibold prose-headings:text-sm prose-headings:mt-4 prose-headings:mb-2 first:prose-headings:mt-0
                          prose-p:text-stone-600 dark:prose-p:text-stone-400 prose-p:leading-relaxed prose-p:text-sm
                          prose-li:text-stone-600 dark:prose-li:text-stone-400 prose-li:text-sm
                          prose-strong:text-stone-900 dark:prose-strong:text-stone-50
                          prose-ul:my-1 prose-ol:my-1"
                        dangerouslySetInnerHTML={{
                          __html: aiSummary.summary
                            .replace(/^### (.+)$/gm, '<h3>$1</h3>')
                            .replace(/^## (.+)$/gm, '<h2>$1</h2>')
                            .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                            .replace(/^- (.+)$/gm, '<li>$1</li>')
                            .replace(/(<li>[^]*?<\/li>(?:\n<li>[^]*?<\/li>)*)/gm, (match) => `<ul>${match}</ul>`)
                            .replace(/\n\n/g, '</p><p>')
                            .replace(/\n/g, '<br/>')
                        }}
                      />
                    ) : (
                      <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
                        No summary available.
                      </p>
                    )}
                  </div>
                  {aiSummary && !summaryLoading && (
                    <div className="px-5 py-3 border-t border-stone-200 dark:border-stone-700">
                      <div className="flex items-center justify-center gap-2">
                        <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
                        <span
                          className="text-xs font-semibold bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]"
                          style={{
                            backgroundImage: "linear-gradient(90deg, #0891b2, #a78bfa, #ec4899, #f59e0b, #10b981, #0891b2)",
                          }}
                        >
                          Generated by Z AI
                        </span>
                      </div>
                      <div className="text-center mt-1">
                        <span className="text-[11px] text-stone-400 dark:text-stone-500">Z can make mistakes. Check important info.</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

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

          {activeTab === "documents" && (
            <ProjectDocumentsTab
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
          users={users.map((u) => ({ id: u.id || "", name: u.name || "" })).filter((u) => u.name)}
        />
      </div>
    </AppLayout>
  );
}
