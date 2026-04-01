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
import { ArrowLeft, Sparkles, Loader2, Bot, X, History, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { useUsersQueryCompat } from "@/lib/hooks/queries/useUsersQuery";
import { useProjectTasksQuery } from "@/lib/hooks/queries/useTasksQuery";
import { isOverdue, getRelativeTime } from "@/features/tasks/utils/taskHelpers";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ProjectDescriptionHistoryEntry } from "@/types/bms";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getProjectDetailSteps } from "@/lib/tour/steps";

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
  const { users, loadUsers } = useUsersQueryCompat();
  const [showDescHistory, setShowDescHistory] = useState(false);
  const [showRegenConfirm, setShowRegenConfirm] = useState(false);
  const [descHistory, setDescHistory] = useState<ProjectDescriptionHistoryEntry[]>([]);
  const [descHistoryLoading, setDescHistoryLoading] = useState(false);

  // Fetch project tasks for overdue widget on overview tab
  const projectTasksQuery = useProjectTasksQuery(projectId);
  const overdueTasks = useMemo(() => {
    if (!projectTasksQuery.data) return [];
    return projectTasksQuery.data
      .filter((t) => isOverdue(t.dueDate, t.status))
      .sort((a, b) => {
        // Most overdue first
        const aDate = a.dueDate ? new Date(a.dueDate).getTime() : 0;
        const bDate = b.dueDate ? new Date(b.dueDate).getTime() : 0;
        return aDate - bDate;
      });
  }, [projectTasksQuery.data]);

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
    // users auto-fetched by React Query
  }, [loadProject]);

  useEffect(() => {
    if (!showDescHistory || !projectId) return;
    setDescHistoryLoading(true);
    bmsApi.projects
      .getDescriptionHistory(projectId)
      .then((res) => {
        console.log("Description history response:", res);
        setDescHistory((res as any).data || []);
      })
      .catch(() => setDescHistory([]))
      .finally(() => setDescHistoryLoading(false));
  }, [showDescHistory, projectId]);

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

    if (formData.description?.trim()) {
      payload.description = formData.description.trim();
      payload.descriptionFormat = "markdown";
    }
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

  const formatBudget = (value?: number | null) => {
    if (!value) return "-";
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
    return `$${value}`;
  };

  const progress = project?.progress ?? 0;

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.PROJECT_DETAIL} options={{ steps: getProjectDetailSteps(activeTab), enabled: !loading && !!project }} />

      {loading ? (
        <LoadingSpinnerCentered text="Loading project..." />
      ) : error || !project ? (
        <ErrorDisplayCentered
          title="Error loading project"
          message={error?.message || "Project not found"}
          onRetry={loadProject}
        />
      ) : (
      <>
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-6">
        {/* Header */}
        <div data-tour="project-header" className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 border border-stone-200 dark:border-stone-700 rounded-lg bg-white dark:bg-stone-900 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-stone-600 dark:text-stone-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">
                {project.name}
              </h1>
              <p className="text-stone-500 dark:text-stone-400">
                {project.status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Project"}
                {project.teamLead ? ` · Led by ${project.teamLead}` : ""}
              </p>
            </div>
          </div>
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
        </div>

        {/* Tabs */}
        <div data-tour="project-tabs" className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden w-fit">
          {["overview", "tasks", "documents", "team", "budget"].map((tab) => (
            <button
              key={tab}
              data-tour={`project-tab-${tab}`}
              data-active={activeTab === tab ? "true" : undefined}
              onClick={() => {
                setActiveTab(tab);
                if (tab === "documents") {
                  window.dispatchEvent(new Event("sidebar-collapse"));
                }
              }}
              className={`px-4 py-2 text-sm transition-colors ${
                activeTab === tab
                  ? "bg-accent-cyan text-white font-medium"
                  : "bg-white dark:bg-stone-900 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
              }`}
            >
              {tab === "documents" ? "Documents" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <>
              {/* Stat Cards — matching dashboard style */}
              <div data-tour="project-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Progress", value: `${progress}%` },
                  { label: "Budget", value: formatBudget(project.budgetAllocated) },
                  { label: "Spent", value: formatBudget(project.budgetSpent) },
                  { label: "End Date", value: project.endDate ? new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "-" },
                  { label: "Overdue", value: String(overdueTasks.length), alert: overdueTasks.length > 0 },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className={`p-5 bg-white dark:bg-stone-900 rounded-xl border ${
                      "alert" in stat && stat.alert
                        ? "border-red-200 dark:border-red-900/50"
                        : "border-stone-200 dark:border-stone-700"
                    } ${"alert" in stat && stat.alert ? "cursor-pointer hover:bg-red-50/50 dark:hover:bg-red-950/10 transition-colors" : ""}`}
                    onClick={() => {
                      if ("alert" in stat && stat.alert) setActiveTab("tasks");
                    }}
                  >
                    <div className={`text-sm mb-2 ${
                      "alert" in stat && stat.alert
                        ? "text-red-500 dark:text-red-400"
                        : "text-stone-500 dark:text-stone-400"
                    }`}>{stat.label}</div>
                    <div className={`text-3xl font-semibold ${
                      "alert" in stat && stat.alert
                        ? "text-red-600 dark:text-red-400"
                        : "text-stone-900 dark:text-stone-50"
                    }`}>{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Two-column: Description + Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Description */}
                <div data-tour="project-description" className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
                    <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Description</h2>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          if (!aiSummary && !showSummary) {
                            setShowSummary(true); // Show explanation first
                          } else {
                            handleGenerateSummary();
                          }
                        }}
                        disabled={summaryLoading}
                        className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors disabled:opacity-50"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {summaryLoading ? "Generating..." : "AI Summary"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowDescHistory(true)}
                        className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 transition-colors"
                        title="View description history"
                      >
                        <History className="w-3.5 h-3.5" />
                        History
                      </button>
                    </div>
                  </div>
                  <div className="p-5">
                    {project.description ? (
                      project.descriptionFormat === "plaintext" ? (
                        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed whitespace-pre-wrap">
                          {project.description}
                        </p>
                      ) : (
                        <div className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {project.description}
                          </ReactMarkdown>
                        </div>
                      )
                    ) : (
                      <p className="text-sm text-stone-400 dark:text-stone-500">
                        No description provided.
                      </p>
                    )}

                    {/* AI Summary — inline below description */}
                    {showSummary && (
                      <div data-tour="project-ai-summary" className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-700">
                        <div className="flex items-center justify-between mb-3">
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
                            {aiSummary && !summaryLoading && (
                              <button
                                onClick={() => setShowRegenConfirm(true)}
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

                        {/* First time — show explanation before generating */}
                        {!aiSummary && !summaryLoading && (
                          <div className="rounded-lg bg-stone-50 dark:bg-stone-800/50 p-4">
                            <p className="text-sm text-stone-600 dark:text-stone-400 mb-3">
                              Z AI will analyze this project&apos;s description, tasks, and activity to generate an intelligent summary with key insights and recommendations.
                            </p>
                            <Button
                              size="sm"
                              onClick={handleGenerateSummary}
                              className="bg-accent-cyan hover:bg-accent-cyan/90 text-white"
                            >
                              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                              Generate Summary
                            </Button>
                          </div>
                        )}

                        {/* Loading state */}
                        {summaryLoading && (
                          <div className="flex items-center gap-2 py-4">
                            <Loader2 className="h-4 w-4 animate-spin text-accent-cyan" />
                            <span className="text-sm text-stone-500 dark:text-stone-400">
                              {summaryMessages[summaryPhase]}
                            </span>
                          </div>
                        )}

                        {/* Generated summary */}
                        {aiSummary?.summary && !summaryLoading && (
                          <>
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
                            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800">
                              <Sparkles className="h-3 w-3 text-accent-cyan" />
                              <span
                                className="text-[11px] font-semibold bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]"
                                style={{ backgroundImage: "linear-gradient(90deg, #0891b2, #a78bfa, #ec4899, #f59e0b, #10b981, #0891b2)" }}
                              >
                                Generated by Z AI
                              </span>
                              <span className="text-[11px] text-stone-400 dark:text-stone-500">· Z can make mistakes</span>
                            </div>
                          </>
                        )}

                        {/* Regenerate confirmation dialog */}
                        {showRegenConfirm && (
                          <div className="mt-3 p-3 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
                            <p className="text-sm text-stone-700 dark:text-stone-300 mb-2">
                              Regenerating uses AI resources. Are you sure you want to generate a new summary?
                            </p>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => { setShowRegenConfirm(false); handleGenerateSummary(); }}
                                className="bg-accent-cyan hover:bg-accent-cyan/90 text-white text-xs"
                              >
                                Yes, regenerate
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setShowRegenConfirm(false)}
                                className="text-xs"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Project Details */}
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
                  <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
                    <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">Details</h2>
                  </div>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800">
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-stone-500 dark:text-stone-400">Status</span>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${
                        project.status === "active" || project.status === "completed"
                          ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                          : project.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                          : project.status === "under-construction"
                          ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                          : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                      }`}>
                        {project.status?.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-stone-500 dark:text-stone-400">Priority</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                        {project.priority?.charAt(0).toUpperCase()}{project.priority?.slice(1) || "-"}
                      </span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-stone-500 dark:text-stone-400">Team Lead</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{project.teamLead || "-"}</span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-stone-500 dark:text-stone-400">Start Date</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                        {project.startDate ? new Date(project.startDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-stone-500 dark:text-stone-400">End Date</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "-"}
                      </span>
                    </div>
                    {project.projectedDeadline && (
                      <div className="px-5 py-3 flex justify-between items-center">
                        <span className="text-sm text-stone-500 dark:text-stone-400">Projected Deadline</span>
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                          {new Date(project.projectedDeadline).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="px-5 py-3 flex justify-between items-center">
                      <span className="text-sm text-stone-500 dark:text-stone-400">Budget</span>
                      <span className="text-sm font-medium text-stone-900 dark:text-stone-50">
                        {formatBudget(project.budgetAllocated)}{project.budgetSpent ? ` (${formatBudget(project.budgetSpent)} spent)` : ""}
                      </span>
                    </div>
                    {company && (
                      <div className="px-5 py-3 flex justify-between items-center">
                        <span className="text-sm text-stone-500 dark:text-stone-400">Company</span>
                        <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{company.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Overdue Tasks */}
              {overdueTasks.length > 0 && (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-red-200 dark:border-red-900/50">
                  <div className="px-5 py-3 border-b border-red-100 dark:border-red-900/30 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-500" />
                      <h2 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                        Overdue Tasks
                      </h2>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 font-medium">
                        {overdueTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("tasks")}
                      className="flex items-center gap-1 text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                    >
                      View all tasks
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="divide-y divide-stone-100 dark:divide-stone-800 max-h-[280px] overflow-y-auto">
                    {overdueTasks.slice(0, 10).map((task) => (
                      <button
                        key={task.id}
                        onClick={() => setActiveTab("tasks")}
                        className="w-full px-5 py-3 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors text-left"
                      >
                        <div className="flex-1 min-w-0 mr-3">
                          <p className="text-sm text-stone-900 dark:text-stone-100 truncate">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            {task.assignees?.[0]?.userName && (
                              <span className="text-xs text-stone-400 dark:text-stone-500">
                                {task.assignees[0].userName}
                              </span>
                            )}
                            <span className={`text-xs px-1.5 py-0.5 rounded ${
                              task.priority === "critical"
                                ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400"
                                : task.priority === "high"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400"
                                : "bg-stone-100 text-stone-500 dark:bg-stone-800 dark:text-stone-400"
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Clock className="w-3.5 h-3.5 text-red-400" />
                          <span className="text-xs text-red-500 dark:text-red-400 font-medium">
                            {getRelativeTime(task.dueDate)}
                          </span>
                        </div>
                      </button>
                    ))}
                    {overdueTasks.length > 10 && (
                      <div className="px-5 py-2 text-center">
                        <button
                          onClick={() => setActiveTab("tasks")}
                          className="text-xs text-accent-cyan hover:text-accent-cyan/80 transition-colors"
                        >
                          +{overdueTasks.length - 10} more overdue tasks
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
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

        {/* Description History Modal */}
        {showDescHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowDescHistory(false)}>
            <div
              className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 w-full max-w-2xl max-h-[80vh] overflow-hidden mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-stone-700">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-stone-500" />
                  <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Description History</h3>
                </div>
                <button
                  onClick={() => setShowDescHistory(false)}
                  className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:text-stone-300 dark:hover:bg-stone-800 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="overflow-y-auto max-h-[calc(80vh-60px)] p-5 space-y-4">
                {descHistoryLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin text-accent-cyan" />
                  </div>
                ) : descHistory.length === 0 ? (
                  <p className="text-sm text-stone-500 dark:text-stone-400 text-center py-8">
                    No description changes recorded yet.
                  </p>
                ) : (
                  descHistory.map((entry, index) => {
                    const versionNum = descHistory.length - index;
                    return (
                    <div key={entry.id} className="border border-stone-200 dark:border-stone-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-stone-900 dark:text-stone-50">
                          Version {versionNum}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-stone-500">
                          {new Date(entry.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {entry.changedByUserName && (
                        <div className="flex items-center gap-2 mb-3 text-xs text-stone-500 dark:text-stone-400">
                          <span>by {entry.changedByUserName}</span>
                        </div>
                      )}
                      {entry.descriptionFormat === "markdown" ? (
                        <div className="text-sm text-stone-600 dark:text-stone-400 prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5 prose-headings:my-2">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {entry.description}
                          </ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm text-stone-600 dark:text-stone-400 whitespace-pre-wrap">
                          {entry.description}
                        </p>
                      )}
                    </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </AppLayout>
  );
}
