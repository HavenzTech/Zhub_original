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
import { FolderOpen, Plus, Search, RefreshCw } from "lucide-react";

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
  progress: 0,
  startDate: "",
  endDate: "",
  budgetAllocated: "",
  budgetSpent: "",
  teamLead: "",
};

export default function ProjectsPage() {
  const router = useRouter();
  const { projects, loading, error, loadProjects, setProjects } = useProjects();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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
      progress: formData.progress,
    };

    if (formData.description?.trim())
      payload.description = formData.description;
    if (formData.startDate?.trim()) payload.startDate = formData.startDate;
    if (formData.endDate?.trim()) payload.endDate = formData.endDate;
    if (formData.teamLead?.trim()) payload.teamLead = formData.teamLead;
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
            <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-600">
              Manage and track all organizational projects
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadProjects}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {authService.hasPermission("create", "project") && (
              <Button onClick={() => setShowAddForm(true)}>
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
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-sm text-gray-600">Loading projects...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-xl">!</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Unable to load projects
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md">
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
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Badge variant="secondary">
                {filteredProjects.length}{" "}
                {filteredProjects.length === 1 ? "project" : "projects"}
              </Badge>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onViewDetails={handleViewDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects found
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? "Try adjusting your search criteria"
                    : "Get started by adding your first project"}
                </p>
                {authService.hasPermission("create", "project") && (
                  <Button onClick={() => setShowAddForm(true)}>
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
      </div>
    </AppLayout>
  );
}
