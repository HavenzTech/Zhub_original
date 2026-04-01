// app/page.tsx - Dashboard
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import {
  FileText,
  Clock,
  Plus,
  Loader2,
  Building2,
  Circle,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { bmsApi } from "@/lib/services/bmsApi";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { useDashboardQuery } from "@/lib/hooks/queries/useDashboardQuery";
import { AppLayout } from "@/components/layout/AppLayout";
import { PageTour } from "@/components/tour/PageTour";
import { OnboardingChecklist } from "@/components/tour/OnboardingChecklist";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getDashboardSteps } from "@/lib/tour/steps";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HavenzHubDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const {
    companies,
    departments,
    projects,
    properties,
    users,
    documents,
    myTasks,
    loading,
    error,
    loadDashboardData,
  } = useDashboardQuery();

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    // Ensure token is set (may already be set from useState initializer)
    const token = authService.getToken();
    const currentCompanyId = authService.getCurrentCompanyId();
    if (token) bmsApi.setToken(token);
    if (currentCompanyId) bmsApi.setCompanyId(currentCompanyId);

    setCompanyId(currentCompanyId);
    setUserName(auth.name);
    setIsAuthenticated(true);
    setAuthLoading(false);
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const recentDocuments = [...documents]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  const formatRelativeTime = (dateString?: string | null) => {
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

  // Sort tasks: overdue first, then by due date, then by priority
  const sortedTasks = useMemo(() => {
    const activeTasks = myTasks.filter(
      (t) => t.status !== "completed" && t.status !== "cancelled"
    );
    return activeTasks.sort((a, b) => {
      const now = new Date();
      const aDue = a.dueDate ? new Date(a.dueDate) : null;
      const bDue = b.dueDate ? new Date(b.dueDate) : null;
      const aOverdue = aDue && aDue < now;
      const bOverdue = bDue && bDue < now;
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      if (aDue && bDue) return aDue.getTime() - bDue.getTime();
      if (aDue) return -1;
      if (bDue) return 1;
      return 0;
    });
  }, [myTasks]);

  const renderDashboard = () => {
    if (loading) {
      return <LoadingSpinnerCentered text="Loading dashboard..." />;
    }

    const firstName = userName?.split(" ")[0];

    return (
      <div className="space-y-6">
        {/* Welcome Greeting + Company Overview */}
        {currentCompany ? (
          <div data-tour="dashboard-welcome" className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 px-5 py-4 flex items-center gap-4">
            {currentCompany.logoUrl && !imageError ? (
              <Image
                src={currentCompany.logoUrl}
                alt={currentCompany.name}
                className="rounded-xl object-cover"
                width={44}
                height={44}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-11 h-11 bg-accent-cyan/10 rounded-xl flex items-center justify-center">
                <Building2 className="w-5 h-5 text-accent-cyan" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-semibold text-stone-900 dark:text-stone-50">
                {firstName
                  ? `${getGreeting()}, ${firstName}`
                  : getGreeting()}
              </h1>
              <p className="text-sm text-stone-500 dark:text-stone-400">
                <span className="font-semibold bg-clip-text text-transparent animate-[shimmer_3s_linear_infinite] bg-[length:200%_100%]" style={{ backgroundImage: "linear-gradient(90deg, #0891b2, #a78bfa, #ec4899, #f59e0b, #10b981, #0891b2)" }}>Z AI</span> is here to help you work efficiently
              </p>
              <p className="text-xs text-stone-400 dark:text-stone-500">
                {currentCompany.name}
                {currentCompany.industry
                  ? ` · ${currentCompany.industry}`
                  : ""}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50 tabular-nums">
                {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div className="text-xs text-stone-500 dark:text-stone-400">
                {currentTime.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" })}
              </div>
            </div>
          </div>
        ) : (
          <h1 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
            {firstName ? `${getGreeting()}, ${firstName}` : getGreeting()}
          </h1>
        )}

        {/* Onboarding Checklist */}
        <OnboardingChecklist />

        {/* Stat Cards */}
        <div data-tour="dashboard-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {/* Two-column: Projects + My Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Projects List */}
          <div data-tour="dashboard-projects" className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
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
              <div className="max-h-[400px] overflow-y-auto scrollbar-modern">
                {projects.map((project) => {
                  const progress = project.progress ?? 0;
                  return (
                    <div
                      key={project.id}
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="px-5 py-4 border-b border-stone-100 dark:border-stone-800 last:border-b-0 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
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
                          className={`text-xs px-2.5 py-1 rounded-md font-medium flex-shrink-0 ${
                            project.status === "completed"
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                              : project.status === "active" ||
                                project.status === "in_progress"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                              : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                          }`}
                        >
                          {project.status
                            ?.replace(/[-_]/g, " ")
                            .replace(/\b\w/g, (c) => c.toUpperCase()) ||
                            "Unknown"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-2 ml-[22px]">
                        <div className="flex-1 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent-cyan rounded-full"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs text-stone-500 dark:text-stone-400 w-8 text-right">
                          {progress}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* My Tasks */}
          <div data-tour="dashboard-tasks" className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center justify-between">
              <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50">
                My Tasks
              </h2>
              <Button
                size="sm"
                variant="outline"
                onClick={() => router.push("/workflow-tasks")}
                className="text-xs"
              >
                View All
              </Button>
            </div>
            {sortedTasks.length === 0 ? (
              <div className="p-8 text-center text-stone-400 dark:text-stone-500 text-sm">
                No tasks assigned to you
              </div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto scrollbar-modern">
                {sortedTasks.slice(0, 8).map((task) => {
                  const isOverdue =
                    task.dueDate && new Date(task.dueDate) < new Date();
                  const priorityColors: Record<string, string> = {
                    critical:
                      "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
                    high: "bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-400",
                    medium:
                      "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-400",
                    low: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400",
                  };

                  return (
                    <div
                      key={task.id}
                      onClick={() => router.push(`/workflow-tasks?taskId=${task.id}`)}
                      className="px-5 py-3.5 border-b border-stone-100 dark:border-stone-800 last:border-b-0 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors flex items-start gap-3"
                    >
                      {task.status === "in_progress" ? (
                        <Clock className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      ) : isOverdue ? (
                        <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-stone-400 mt-0.5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-stone-900 dark:text-stone-50 truncate">
                          {task.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {task.priority && (
                            <span
                              className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                                priorityColors[task.priority] ||
                                priorityColors.low
                              }`}
                            >
                              {task.priority.charAt(0).toUpperCase() +
                                task.priority.slice(1)}
                            </span>
                          )}
                          {task.dueDate && (
                            <span
                              className={`text-xs ${
                                isOverdue
                                  ? "text-red-500 font-medium"
                                  : "text-stone-500 dark:text-stone-400"
                              }`}
                            >
                              {isOverdue ? "Overdue · " : "Due "}
                              {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium flex-shrink-0 ${
                          task.status === "in_progress"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                            : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                        }`}
                      >
                        {(task.status as string)
                          ?.replace(/[-_]/g, " ")
                          .replace(/\b\w/g, (c) => c.toUpperCase()) || "Open"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Recent Documents - full width below */}
        <div data-tour="dashboard-documents" className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
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

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.DASHBOARD} options={{ steps: getDashboardSteps(), enabled: !loading && isAuthenticated }} />
      {renderDashboard()}
    </AppLayout>
  );
}
