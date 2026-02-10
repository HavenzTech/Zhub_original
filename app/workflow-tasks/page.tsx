"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { useWorkflowTasks } from "@/lib/hooks/useWorkflowTasks";
import { useTasks } from "@/lib/hooks/useTasks";
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
} from "lucide-react";
import { toast } from "sonner";
import type { CompleteTaskRequest, DelegateTaskRequest, TaskDto } from "@/types/bms";

export default function MyTasksPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");
  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string }>>([]);
  const [confirmStatus, setConfirmStatus] = useState<{ taskId: string; taskTitle: string; status: string } | null>(null);

  const {
    myTasks,
    pendingTasks,
    loading: workflowLoading,
    loadMyTasks,
    loadPendingTasks,
    completeTask,
    delegateTask,
  } = useWorkflowTasks();

  const {
    tasks: myProjectTasks,
    loading: tasksLoading,
    loadMyTasks: loadMyProjectTasks,
    updateTaskStatus,
  } = useTasks();

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

    loadMyTasks();
    loadPendingTasks();
    loadMyProjectTasks();
    loadUsers();
  }, [router, loadMyTasks, loadPendingTasks, loadMyProjectTasks]);

  const loadUsers = async () => {
    try {
      const response = await bmsApi.users.getAll();
      const data = Array.isArray(response)
        ? response
        : (response as any)?.items || (response as any)?.data || [];
      setAvailableUsers(
        data.map((u: any) => ({
          id: u.id || "",
          name: u.name || u.email || "",
        }))
      );
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const handleCompleteTask = async (taskId: string, request: CompleteTaskRequest) => {
    try {
      await completeTask(taskId, request);
      toast.success(`Task ${request.action === 'approve' ? 'approved' : 'completed'} successfully`);
      await loadMyTasks();
      await loadPendingTasks();
    } catch (err) {
      toast.error("Failed to complete task");
    }
  };

  const handleDelegateTask = async (taskId: string, request: DelegateTaskRequest) => {
    try {
      await delegateTask(taskId, request);
      toast.success("Task delegated successfully");
      await loadMyTasks();
      await loadPendingTasks();
    } catch (err) {
      toast.error("Failed to delegate task");
    }
  };

  const handleViewDocument = (documentId: string) => {
    router.push(`/document-control/${documentId}`);
  };

  const handleRefresh = () => {
    loadMyTasks();
    loadPendingTasks();
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
    <>
      {/* Pending Approvals */}
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
          <div className="p-10 text-center text-stone-400 dark:text-stone-500 text-sm">
            No pending approvals
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

      {/* All Pending Workflow Tasks */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
          <Clock className="w-5 h-5 text-stone-500 dark:text-stone-400" />
          <h2 className="text-base font-semibold text-stone-900 dark:text-stone-50 flex-1">
            All Pending Workflow Tasks
          </h2>
          {pendingTasks.length > 0 && (
            <span className="text-xs px-2.5 py-1 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-400 rounded-full font-medium">
              {pendingTasks.length}
            </span>
          )}
        </div>
        {workflowLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="p-10 text-center text-stone-400 dark:text-stone-500 text-sm">
            No pending workflow tasks
          </div>
        ) : (
          <div className="divide-y divide-stone-100 dark:divide-stone-800">
            {pendingTasks.map((task) => (
              <div key={task.id} className="px-5 py-4">
                <WorkflowTaskCard
                  task={task}
                  onComplete={(request) => handleCompleteTask(task.id!, request)}
                  onViewDocument={handleViewDocument}
                  availableUsers={[]}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </>
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
        <div className="p-10 text-center text-stone-400 dark:text-stone-500 text-sm">
          No tasks assigned to you
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
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 line-clamp-2">
                    {task.title}
                  </h4>
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
                      <DropdownMenuItem
                        onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "in_review" })}
                        disabled={task.status === "in_review"}
                      >
                        <PauseCircle className="w-4 h-4 mr-2 text-violet-600" />
                        In Review
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setConfirmStatus({ taskId: task.id!, taskTitle: task.title || "this task", status: "completed" })}
                        disabled={task.status === "completed"}
                      >
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Completed
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
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
        <div className="p-10 text-center text-stone-400 dark:text-stone-500 text-sm">
          No completed tasks yet
        </div>
      ) : (
        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {completedProjectTasks.map((task) => {
            const linkedText = getLinkedText(task);

            return (
              <div key={task.id} className="px-5 py-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 line-clamp-2">
                    {task.title}
                  </h4>
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

  return (
    <AppLayout>
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

        {/* Tabs */}
        <div className="flex gap-1">
          {["all", "approvals", "tasks", "completed"].map((tab) => (
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

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === "all" && (
            <>
              {renderApprovalsSection()}
              {renderProjectTasksSection()}
            </>
          )}

          {activeTab === "approvals" && renderApprovalsSection()}

          {activeTab === "tasks" && renderProjectTasksSection()}

          {activeTab === "completed" && renderCompletedSection()}
        </div>
      </div>

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
    </AppLayout>
  );
}
