"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useProjects } from "@/lib/hooks/useProjects";
import { ProjectCard } from "@/features/projects/components/ProjectCard";
import { ProjectStats } from "@/features/projects/components/ProjectStats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Project } from "@/types/bms";
import { toast } from "sonner";
import { FolderOpen, Plus, Search, RefreshCw, Target } from "lucide-react";
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

const ProjectFormModal = dynamic(
  () =>
    import("@/features/projects/components/ProjectFormModal").then((mod) => ({
      default: mod.ProjectFormModal,
    })),
  { ssr: false, loading: () => <LoadingSpinnerCentered /> }
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

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, loading, error, loadProjects, setProjects } = useProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

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

    loadProjects();
  }, [router, loadProjects]);

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      status: formData.status,
      priority: formData.priority,
    };

    if (formData.description?.trim())
      payload.description = formData.description;
    if (formData.startDate?.trim()) payload.startDate = formData.startDate;
    if (formData.endDate?.trim()) payload.endDate = formData.endDate;
    if (formData.teamLead?.trim()) payload.teamLead = formData.teamLead;
    if (formData.projectedDeadline?.trim()) payload.projectedDeadline = formData.projectedDeadline;
    if (
      formData.budgetAllocated &&
      !isNaN(parseFloat(formData.budgetAllocated))
    ) {
      payload.budgetAllocated = parseFloat(formData.budgetAllocated);
    }
    if (formData.budgetSpent && !isNaN(parseFloat(formData.budgetSpent))) {
      payload.budgetSpent = parseFloat(formData.budgetSpent);
    }

    return payload;
  };

  const handleViewDetails = (project: Project) => {
    router.push(`/projects/${project.id}`);
  };

  const handleDeleteClick = (project: Project) => {
    setDeleteProject(project);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteProject) return;

    try {
      await bmsApi.projects.delete(deleteProject.id!);
      setProjects((prev) => prev.filter((p) => p.id !== deleteProject.id));
      toast.success(`Project "${deleteProject.name}" deleted successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to delete project";
      toast.error(errorMessage);
      console.error("Error deleting project:", err);
    } finally {
      setDeleteProject(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = buildPayload();
      const newProject = await bmsApi.projects.create(payload);

      setProjects((prev) => [...prev, newProject as Project]);
      toast.success("Project created successfully!");
      setShowAddForm(false);
      setFormData(initialFormData);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create project";
      toast.error(errorMessage);
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.teamLead?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Projects</h1>
            <p className="text-stone-500 dark:text-stone-400">
              Manage and track all organizational projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadProjects} className="border-stone-300 dark:border-stone-600">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {authService.hasPermission("create", "project") && (
              <Button onClick={() => setShowAddForm(true)} className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-cyan mx-auto mb-4"></div>
              <p className="text-sm text-stone-500 dark:text-stone-400">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-950 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 dark:text-red-400 text-xl">!</span>
              </div>
              <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
                Unable to load projects
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4 max-w-md">
                {error.message === "Failed to fetch"
                  ? "Could not connect to the server. Please check your connection and try again."
                  : error.message}
              </p>
              <Button variant="outline" onClick={loadProjects}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <ProjectStats projects={projects} />

            {/* Search */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400 dark:text-stone-500" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 rounded-xl"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="secondary">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
              </Badge>
            </div>

            {/* Projects Table */}
            {filteredProjects.length > 0 ? (
              <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50">
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Project</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Budget</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Progress</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Timeline</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-stone-500 dark:text-stone-400">Team Lead</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-stone-500 dark:text-stone-400"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProjects.map((project) => {
                        const progress = project.progress ?? 0;
                        const budget = project.budgetAllocated
                          ? `$${(project.budgetAllocated / 1000).toFixed(0)}K`
                          : "-";
                        const startDate = project.startDate
                          ? new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "";
                        const endDate = project.endDate
                          ? new Date(project.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                          : "";
                        const timeline = startDate && endDate ? `${startDate} - ${endDate}` : startDate || endDate || "-";

                        return (
                          <tr
                            key={project.id}
                            onClick={() => handleViewDetails(project)}
                            className="border-b border-stone-100 dark:border-stone-800 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors"
                          >
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center text-accent-cyan">
                                  <FolderOpen className="w-5 h-5" />
                                </div>
                                <div>
                                  <div className="font-medium text-stone-900 dark:text-stone-50">{project.name}</div>
                                  {project.description && (
                                    <div className="text-xs text-stone-500 dark:text-stone-400 truncate max-w-[200px]">{project.description}</div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex items-center text-xs px-2.5 py-1 rounded-md font-medium ${
                                project.status === "active" || project.status === "completed"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                  : project.status === "in_progress"
                                  ? "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-400"
                                  : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                              }`}>
                                {project.status?.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || "Unknown"}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-stone-700 dark:text-stone-300">{budget}</td>
                            <td className="px-4 py-4">
                              <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-accent-cyan rounded-full"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <span className="text-xs text-stone-500 dark:text-stone-400 w-8">{progress}%</span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-xs text-stone-500 dark:text-stone-400">{timeline}</td>
                            <td className="px-4 py-4 text-sm text-stone-700 dark:text-stone-300">{project.teamLead || "-"}</td>
                            <td className="px-4 py-4 text-right">
                              {authService.isSuperAdmin() && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteClick(project);
                                  }}
                                  className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                                >
                                  Delete
                                </Button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
                  No projects found
                </h3>
                <p className="text-stone-500 dark:text-stone-400 mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first project"}
                </p>
                {authService.hasPermission("create", "project") && (
                  <Button onClick={() => setShowAddForm(true)} className="bg-accent-cyan hover:bg-accent-cyan/90 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Project
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {/* Add Project Modal */}
        <ProjectFormModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={!!deleteProject}
          onOpenChange={(open) => !open && setDeleteProject(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Project</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete{" "}
                <strong>{deleteProject?.name}</strong>? This action cannot be
                undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteProject(null)}>
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
