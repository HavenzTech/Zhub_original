"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { useWorkflowTasks } from "@/lib/hooks/useWorkflowTasks";
import { WorkflowTaskCard } from "@/features/documents/components/workflow/WorkflowTaskCard";
import {
  ClipboardCheck,
  Clock,
  CheckCircle,
  Loader2,
  RefreshCw,
  Inbox,
} from "lucide-react";
import { toast } from "sonner";
import type { CompleteTaskRequest, DelegateTaskRequest } from "@/types/bms";

export default function WorkflowTasksPage() {
  const router = useRouter();
  const {
    myTasks,
    pendingTasks,
    loading,
    loadMyTasks,
    loadPendingTasks,
    completeTask,
    delegateTask,
  } = useWorkflowTasks();

  const [availableUsers, setAvailableUsers] = useState<Array<{ id: string; name: string }>>([]);

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
    loadUsers();
  }, [router, loadMyTasks, loadPendingTasks]);

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
  };

  const urgentTasks = myTasks.filter((task) => {
    if (!task.dueAt) return false;
    const dueDate = new Date(task.dueAt);
    const now = new Date();
    const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilDue < 24;
  });

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Workflow Tasks</h1>
            <p className="text-gray-600">
              Review and approve documents awaiting your action
            </p>
          </div>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{myTasks.length}</div>
                  <div className="text-sm text-gray-600">My Tasks</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{urgentTasks.length}</div>
                  <div className="text-sm text-gray-600">Due Soon (24h)</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  <Inbox className="w-6 h-6 text-gray-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{pendingTasks.length}</div>
                  <div className="text-sm text-gray-600">All Pending</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Tabs */}
        <Tabs defaultValue="my-tasks" className="w-full">
          <TabsList>
            <TabsTrigger value="my-tasks" className="flex items-center gap-2">
              My Tasks
              {myTasks.length > 0 && (
                <Badge variant="secondary">{myTasks.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="all-pending" className="flex items-center gap-2">
              All Pending
              {pendingTasks.length > 0 && (
                <Badge variant="secondary">{pendingTasks.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* My Tasks Tab */}
          <TabsContent value="my-tasks" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : myTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    All caught up!
                  </h3>
                  <p className="text-gray-600">
                    You have no pending workflow tasks.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {myTasks.map((task) => (
                  <WorkflowTaskCard
                    key={task.id}
                    task={task}
                    onComplete={(request) => handleCompleteTask(task.id!, request)}
                    onDelegate={(request) => handleDelegateTask(task.id!, request)}
                    onViewDocument={handleViewDocument}
                    availableUsers={availableUsers}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* All Pending Tab */}
          <TabsContent value="all-pending" className="mt-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            ) : pendingTasks.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Inbox className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No pending tasks
                  </h3>
                  <p className="text-gray-600">
                    There are no workflow tasks awaiting action.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingTasks.map((task) => (
                  <WorkflowTaskCard
                    key={task.id}
                    task={task}
                    onComplete={(request) => handleCompleteTask(task.id!, request)}
                    onViewDocument={handleViewDocument}
                    availableUsers={[]}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
