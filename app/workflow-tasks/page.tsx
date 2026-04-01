"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { useWorkflowTasksQueryCompat } from "@/lib/hooks/queries/useWorkflowTasksQuery";
import { useMyTasksQuery, useTasksQueryCompat } from "@/lib/hooks/queries/useTasksQuery";
import { useUsersQuery } from "@/lib/hooks/queries/useUsersQuery";
import { WorkflowTaskCard } from "@/features/documents/components/workflow/WorkflowTaskCard";
import {
  getTaskStatusColor,
  getTaskStatusLabel,
  getTaskPriorityColor,
  isOverdue,
  getRelativeTime,
  formatDate,
} from "@/features/tasks/utils/taskHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { TaskDetailDialog } from "@/features/tasks/components/TaskDetailDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  Circle,
  PlayCircle,
  PauseCircle,
  ChevronDown,
  Clock,
  Loader2,
  RefreshCw,
  FolderOpen,
  Users,
  Home,
  Building2,
  AlertCircle,
  Calendar,
  ClipboardCheck,
  FileText,
  User,
  Search,
  Inbox,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import {
  ShieldCheck,
  Send,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import type { CompleteTaskRequest, DelegateTaskRequest, TaskDto, ProjectMemberDto } from "@/types/bms";
import { extractArray } from "@/lib/utils/api";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getWorkflowTasksSteps } from "@/lib/tour/steps";

export default function MyTasksPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { data: usersQueryData } = useUsersQuery();
  const availableUsers = (usersQueryData ?? []).map((u) => ({ id: u.id || "", name: u.name || u.email || "" }));
  const [confirmStatus, setConfirmStatus] = useState<{ taskId: string; taskTitle: string; status: string } | null>(null);
  const [viewingTask, setViewingTask] = useState<TaskDto | null>(null);
  const [dismissedTaskId, setDismissedTaskId] = useState<string | null>(null);
  const [rejectDialogTask, setRejectDialogTask] = useState<TaskDto | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [projectLeadMap, setProjectLeadMap] = useState<Record<string, boolean>>({});
  const [currentUserId, setCurrentUserId] = useState("");

  const {
    myTasks,
    completedTasks: completedApprovals,
    loading: workflowLoading,
    loadMyTasks,
    loadCompletedTasks,
    completeTask,
    delegateTask,
  } = useWorkflowTasksQueryCompat();

  const myProjectTasksQuery = useMyTasksQuery();
  const myProjectTasks = myProjectTasksQuery.data ?? [];
  const tasksLoading = myProjectTasksQuery.isLoading;
  const loadMyProjectTasks = async () => { await myProjectTasksQuery.refetch(); };

  const taskMutations = useTasksQueryCompat();
  const {
    updateTaskStatus,
    toggleComplete,
    getTaskById,
    submitForReview,
    approveTask,
    rejectTask,
  } = taskMutations;

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

    setCurrentUserId(auth.userId || "");
    // All queries auto-fetched by React Query
  }, [router]);

  // Check project lead status for review-required tasks
  useEffect(() => {
    const reviewTasks = myProjectTasks.filter((t) => t.requiresReview && t.projectId);
    const uniqueProjectIds = [...new Set(reviewTasks.map((t) => t.projectId!))].filter(
      (pid) => !(pid in projectLeadMap)
    );

    if (uniqueProjectIds.length === 0) return;

    const isAdmin = authService.isAdmin();
    if (isAdmin) {
      const newMap: Record<string, boolean> = {};
      uniqueProjectIds.forEach((pid) => { newMap[pid] = true; });
      setProjectLeadMap((prev) => ({ ...prev, ...newMap }));
      return;
    }

    // Fetch project members for unknown projects
    Promise.all(
      uniqueProjectIds.map(async (pid) => {
        try {
          const data = await bmsApi.projects.getMembers(pid);
          const members = extractArray<ProjectMemberDto>(data);
          const isLead = members.some((m) => m.userId === currentUserId && m.role === "lead");
          return { pid, isLead };
        } catch {
          return { pid, isLead: false };
        }
      })
    ).then((results) => {
      const newMap: Record<string, boolean> = {};
      results.forEach(({ pid, isLead }) => { newMap[pid] = isLead; });
      setProjectLeadMap((prev) => ({ ...prev, ...newMap }));
    });
  }, [myProjectTasks, currentUserId, projectLeadMap]);

  // Open task detail dialog when taskId is in the URL
  useEffect(() => {
    const taskId = searchParams.get("taskId");
    if (!taskId) return;
    if (taskId === dismissedTaskId) return;

    // First check if it's already in the loaded project tasks
    const found = myProjectTasks.find((t) => t.id === taskId);
    if (found) {
      setViewingTask(found);
      return;
    }

    // Otherwise fetch it from the API
    if (!tasksLoading) {
      getTaskById(taskId).then((task) => {
        if (task) setViewingTask(task);
      });
    }
  }, [searchParams, myProjectTasks, tasksLoading, getTaskById]);

  // users auto-fetched by React Query

  const handleCompleteTask = async (taskId: string, request: CompleteTaskRequest) => {
    try {
      await completeTask(taskId, request);
      toast.success(`Task ${request.action === 'approve' ? 'approved' : 'completed'} successfully`);
      await loadMyTasks();
      await loadCompletedTasks();
    } catch (err) {
      toast.error("Failed to complete task");
    }
  };

  const handleDelegateTask = async (taskId: string, request: DelegateTaskRequest) => {
    try {
      await delegateTask(taskId, request);
      toast.success("Task delegated successfully");
      await loadMyTasks();
    } catch (err) {
      toast.error("Failed to delegate task");
    }
  };

  const handleViewDocument = (documentId: string) => {
    router.push(`/document-control/${documentId}`);
  };

  const handleSubmitForReview = async (task: TaskDto) => {
    if (!task.id) return;
    const updated = await submitForReview(task.id);
    if (updated) {
      loadMyProjectTasks();
      if (viewingTask?.id === task.id) setViewingTask({ ...task, ...updated });
    }
  };

  const handleApproveTask = async (task: TaskDto) => {
    if (!task.id) return;
    const updated = await approveTask(task.id);
    if (updated) {
      loadMyProjectTasks();
      if (viewingTask?.id === task.id) setViewingTask({ ...task, ...updated });
    }
  };

  const handleRejectTask = async (task: TaskDto, reason: string) => {
    if (!task.id) return;
    const updated = await rejectTask(task.id, reason);
    if (updated) {
      loadMyProjectTasks();
      if (viewingTask?.id === task.id) setViewingTask({ ...task, ...updated });
    }
  };

  const isLeadForTask = (task: TaskDto) => {
    if (!task.projectId) return false;
    return projectLeadMap[task.projectId] ?? false;
  };

  const handleRefresh = () => {
    loadMyTasks();
    loadCompletedTasks();
    loadMyProjectTasks();
  };

  // Filter active project tasks
  const activeProjectTasks = myProjectTasks.filter(
    (t) => t.status !== "completed" && t.status !== "cancelled"
  );

  // Completed project tasks
  const completedProjectTasks = myProjectTasks.filter(
    (t) => t.status === "completed"
  );

  // Urgent workflow tasks (due within 24h)
  const urgentWorkflowTasks = myTasks.filter((task) => {
    if (!task.dueAt) return false;
    const dueDate = new Date(task.dueAt);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDue < 24;
  });

  // Overdue project tasks
  const overdueProjectTasks = activeProjectTasks.filter((t) =>
    isOverdue(t.dueDate, t.status)
  );

  const dueSoonCount = urgentWorkflowTasks.length + overdueProjectTasks.length;

  // Helper: get linked entity icon
  const getLinkedIcon = (task: TaskDto) => {
    if (task.projectName) return <FolderOpen className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />;
    if (task.departmentName) return <Users className="w-3 h-3 text-violet-600 dark:text-violet-400" />;
    if (task.propertyName) return <Home className="w-3 h-3 text-amber-600 dark:text-amber-400" />;
    return <Building2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />;
  };

  // Helper: get linked entity text
  const getLinkedText = (task: TaskDto) => {
    if (task.projectName) return task.projectName;
    if (task.departmentName) return task.departmentName;
    if (task.propertyName) return task.propertyName;
    return null;
  };

  // ─── Render sections ───

  const renderApprovalsSection = () => (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-stone-500 dark:text-stone-400" />
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50 flex-1">
          Pending Approvals
        </h2>
        {myTasks.length > 0 && (
          <span className="text-xs px-2.5 py-1 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-400 rounded-full font-medium">
            {myTasks.length}
          </span>
        )}
      </div>
      {workflowLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
        </div>
      ) : myTasks.length === 0 ? (
        <div className="p-10 text-center">
          <CheckCircle className="w-10 h-10 text-stone-200 dark:text-stone-700 mx-auto mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">No pending approvals</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {myTasks.map((task) => (
            <div key={task.id} className="px-5 py-4">
              <WorkflowTaskCard
                task={task}
                onComplete={(request) => handleCompleteTask(task.id!, request)}
                onDelegate={(request) => handleDelegateTask(task.id!, request)}
                onViewDocument={handleViewDocument}
                availableUsers={availableUsers}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderProjectTasksSection = () => (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
        <ClipboardCheck className="w-5 h-5 text-stone-500 dark:text-stone-400" />
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50 flex-1">
          Assigned Tasks
        </h2>
        {activeProjectTasks.length > 0 && (
          <span className="text-xs px-2.5 py-1 bg-violet-100 dark:bg-violet-950 text-violet-700 dark:text-violet-400 rounded-full font-medium">
            {activeProjectTasks.length}
          </span>
        )}
      </div>
      {tasksLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
        </div>
      ) : activeProjectTasks.length === 0 ? (
        <div className="p-10 text-center">
          <Inbox className="w-10 h-10 text-stone-200 dark:text-stone-700 mx-auto mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">No tasks assigned to you</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {activeProjectTasks.map((task) => {
            const overdue = isOverdue(task.dueDate, task.status);
            const dueRelative = getRelativeTime(task.dueDate);
            const linkedText = getLinkedText(task);

            return (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    {task.requiresReview ? (
                      <span title="Requires review"><ShieldCheck className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" /></span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => task.id && toggleComplete(task.id).then(() => loadMyProjectTasks())}
                        className="mt-0.5 shrink-0 group/check"
                        title="Mark complete"
                      >
                        <Circle className="w-4 h-4 text-stone-300 dark:text-stone-600 group-hover/check:text-green-600 transition-colors" />
                      </button>
                    )}
                    <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 line-clamp-2">
                      {task.title}
                    </h4>
                  </div>
                  {task.priority && (
                    <Badge
                      className={`${getTaskPriorityColor(task.priority)} text-[10px] ml-2 flex-shrink-0`}
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getTaskStatusColor(task.status)} text-[10px]`}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                  {task.requiresReview && (
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px]">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      Requires Review
                    </Badge>
                  )}

                  {linkedText && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      {getLinkedIcon(task)}
                      <span className="truncate max-w-[200px]">{linkedText}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div
                      className={`flex items-center gap-1 text-xs ${
                        overdue ? "text-red-600 dark:text-red-400 font-medium" : "text-stone-400 dark:text-stone-500"
                      }`}
                    >
                      {overdue ? (
                        <AlertCircle className="w-3 h-3" />
                      ) : (
                        <Calendar className="w-3 h-3" />
                      )}
                      <span>
                        {formatDate(task.dueDate)}
                        {dueRelative && ` (${dueRelative})`}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  {/* Review-aware actions */}
                  {task.requiresReview && task.status === "in_progress" ? (
                    <Button
                      size="sm"
                      onClick={() => handleSubmitForReview(task)}
                      className="bg-accent-cyan hover:bg-accent-cyan/90 text-white text-xs"
                    >
                      <Send className="w-3 h-3 mr-1" />
                      Submit for Review
                    </Button>
                  ) : task.requiresReview && task.status === "in_review" && isLeadForTask(task) ? (
                    <>
                      <Button
                        size="sm"
                        onClick={() => handleApproveTask(task)}
                        className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:hover:bg-emerald-900 text-xs"
                      >
                        <ThumbsUp className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setRejectDialogTask(task);
                          setRejectReason("");
                        }}
                        className="bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950 dark:text-red-400 dark:hover:bg-red-900 text-xs"
                      >
                        <ThumbsDown className="w-3 h-3 mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : task.requiresReview && task.status === "in_review" ? (
                    <span className="inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
                      <PauseCircle className="w-3 h-3 mr-1" />
                      Awaiting Review
                    </span>
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="outline">
                          Update Status
                          <ChevronDown className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem
                          onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "todo" })}
                          disabled={task.status === "todo"}
                        >
                          <Circle className="w-4 h-4 mr-2 text-stone-400" />
                          To Do
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "in_progress" })}
                          disabled={task.status === "in_progress"}
                        >
                          <PlayCircle className="w-4 h-4 mr-2 text-blue-600" />
                          In Progress
                        </DropdownMenuItem>
                        {/* Employees only get In Review/Completed on non-review tasks; leads/admins always */}
                        {(!task.requiresReview || isLeadForTask(task) || authService.isAdmin()) && (
                          <DropdownMenuItem
                            onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "in_review" })}
                            disabled={task.status === "in_review"}
                          >
                            <PauseCircle className="w-4 h-4 mr-2 text-violet-600" />
                            In Review
                          </DropdownMenuItem>
                        )}
                        {(!task.requiresReview || isLeadForTask(task) || authService.isAdmin()) && (
                          <DropdownMenuItem
                            onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "completed" })}
                            disabled={task.status === "completed"}
                          >
                            <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                            Completed
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setViewingTask(task)}
                    className="text-stone-500"
                  >
                    View Details
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCompletedSection = () => (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50 flex-1">
          Completed Tasks
        </h2>
        {completedProjectTasks.length > 0 && (
          <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
            {completedProjectTasks.length}
          </span>
        )}
      </div>
      {tasksLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
        </div>
      ) : completedProjectTasks.length === 0 ? (
        <div className="p-10 text-center">
          <CheckCircle className="w-10 h-10 text-stone-200 dark:text-stone-700 mx-auto mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">No completed tasks yet</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {completedProjectTasks.map((task) => {
            const linkedText = getLinkedText(task);

            return (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start gap-2">
                    <button
                      type="button"
                      onClick={() => task.id && toggleComplete(task.id).then(() => loadMyProjectTasks())}
                      className="mt-0.5 shrink-0 group/check"
                      title="Reopen task"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 group-hover/check:text-stone-400 transition-colors" />
                    </button>
                    <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 line-clamp-2">
                      {task.title}
                    </h4>
                  </div>
                  {task.priority && (
                    <Badge
                      className={`${getTaskPriorityColor(task.priority)} text-[10px] ml-2 flex-shrink-0`}
                    >
                      {task.priority}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={`${getTaskStatusColor(task.status)} text-[10px]`}>
                    {getTaskStatusLabel(task.status)}
                  </Badge>
                  {task.requiresReview && (
                    <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 text-[10px]">
                      <ShieldCheck className="w-3 h-3 mr-0.5" />
                      Requires Review
                    </Badge>
                  )}

                  {linkedText && (
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                      {getLinkedIcon(task)}
                      <span className="truncate max-w-[200px]">{linkedText}</span>
                    </div>
                  )}

                  {task.dueDate && (
                    <div className="flex items-center gap-1 text-xs text-stone-400 dark:text-stone-500">
                      <Calendar className="w-3 h-3" />
                      <span>{formatDate(task.dueDate)}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "todo" })}
                  >
                    <Circle className="w-3.5 h-3.5 mr-1.5 text-stone-400" />
                    Reopen
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderCompletedApprovalsSection = () => (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
        <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50 flex-1">
          Completed Approvals
        </h2>
        {completedApprovals.length > 0 && (
          <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 rounded-full font-medium">
            {completedApprovals.length}
          </span>
        )}
      </div>
      {workflowLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
        </div>
      ) : completedApprovals.length === 0 ? (
        <div className="p-10 text-center">
          <CheckCircle className="w-10 h-10 text-stone-200 dark:text-stone-700 mx-auto mb-3" />
          <p className="text-sm text-stone-400 dark:text-stone-500">No completed approvals yet</p>
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {completedApprovals.map((task) => (
            <div key={task.id} className="px-5 py-4 space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-accent-cyan" />
                    {task.documentName || "Document Review"}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                    {task.stepName || "Review Task"}
                  </p>
                </div>
                <Badge
                  className={`text-[10px] ${
                    task.actionTaken === "approve"
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                      : task.actionTaken === "reject"
                      ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400"
                      : "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300"
                  }`}
                >
                  {task.actionTaken === "approve" ? "Approved" : task.actionTaken === "reject" ? "Rejected" : task.actionTaken || "Completed"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-stone-500 dark:text-stone-400">
                {task.completedByUserName && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3" />
                    {task.completedByUserName}
                  </div>
                )}
                {task.completedAt && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {formatDate(task.completedAt)}
                  </div>
                )}
              </div>
              {task.comments && (
                <div className="text-xs text-stone-600 dark:text-stone-300 bg-stone-50 dark:bg-stone-800 p-3 rounded-lg">
                  {task.comments}
                </div>
              )}
              {task.documentId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-[12px] border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                  onClick={() => handleViewDocument(task.documentId!)}
                >
                  <FileText className="mr-1 h-3 w-3" />
                  View Document
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.WORKFLOW_TASKS} options={{ steps: getWorkflowTasksSteps(), enabled: true }} />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">My Tasks</h1>
            <p className="text-stone-500 dark:text-stone-400">
              All your tasks and approvals in one place
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: "Approvals", value: myTasks.length },
            { label: "Due Soon", value: dueSoonCount },
            { label: "Tasks", value: activeProjectTasks.length },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-5 bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700"
            >
              <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">{stat.label}</div>
              <div className="text-3xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Search + Tabs */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md" data-tour="tasks-search">
            <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400 dark:text-stone-500" />
            <Input
              placeholder="Search tasks..."
              className="pl-10 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex-1" />
          <div className="flex items-center border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden" data-tour="tasks-tabs">
            {["all", "tasks", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === tab
                    ? "bg-accent-cyan text-white font-medium"
                    : "bg-white dark:bg-stone-900 text-stone-500 hover:bg-stone-50 dark:hover:bg-stone-800"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div data-tour="tasks-list">
        {activeTab === "all" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderApprovalsSection()}
            {renderProjectTasksSection()}
          </div>
        )}

        {activeTab === "tasks" && renderProjectTasksSection()}

        {activeTab === "completed" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCompletedApprovalsSection()}
            {renderCompletedSection()}
          </div>
        )}
        </div>
      </div>

      <TaskDetailDialog
        task={viewingTask}
        open={!!viewingTask}
        onOpenChange={(open) => {
          if (!open) {
            const closedId = viewingTask?.id || null;
            setViewingTask(null);
            if (closedId) setDismissedTaskId(closedId);
            // Clean up the taskId from the URL without a full navigation
            const url = new URL(window.location.href);
            if (url.searchParams.has("taskId")) {
              url.searchParams.delete("taskId");
              window.history.replaceState({}, "", url.pathname);
            }
          }
        }}
        onStatusChange={async (task, status) => {
          if (task.id) {
            const success = await updateTaskStatus(task.id, status);
            if (success) loadMyProjectTasks();
          }
        }}
        onSubmitForReview={handleSubmitForReview}
        onApprove={handleApproveTask}
        onReject={handleRejectTask}
        currentUserId={currentUserId}
        isProjectLeadOrAdmin={viewingTask?.projectId ? (projectLeadMap[viewingTask.projectId] ?? false) : false}
      />

      <ConfirmDialog
        open={!!confirmStatus}
        onOpenChange={(open) => { if (!open) setConfirmStatus(null); }}
        title="Update Task Status"
        description={confirmStatus ? `Are you sure you want to mark "${confirmStatus.taskTitle}" as ${confirmStatus.status.replace(/_/g, " ")}?` : ""}
        confirmText="Yes, update"
        icon={CheckCircle}
        onConfirm={async () => {
          if (confirmStatus) {
            const success = await updateTaskStatus(confirmStatus.taskId, confirmStatus.status);
            if (success) loadMyProjectTasks();
          }
          setConfirmStatus(null);
        }}
      />

      {/* Reject reason dialog */}
      {rejectDialogTask && (
        <Dialog open={!!rejectDialogTask} onOpenChange={(open) => { if (!open) { setRejectDialogTask(null); setRejectReason(""); } }}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Reject Task</DialogTitle>
            </DialogHeader>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Rejecting <strong>{rejectDialogTask.title}</strong>. Please provide a reason.
            </p>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this task is being rejected..."
              rows={3}
            />
            <div className="flex items-center gap-2 justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setRejectDialogTask(null); setRejectReason(""); }}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={!rejectReason.trim()}
                onClick={() => {
                  handleRejectTask(rejectDialogTask, rejectReason.trim());
                  setRejectDialogTask(null);
                  setRejectReason("");
                }}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Confirm Rejection
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AppLayout>
  );
}
