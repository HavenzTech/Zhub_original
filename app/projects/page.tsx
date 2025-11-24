// app/projects/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { ErrorDisplayCentered } from "@/components/common/ErrorDisplay";
import { useProjects } from "@/lib/hooks/useProjects";
import { ProjectCard } from "@/features/projects/components/ProjectCard";

// Dynamic import for modal - only loaded when needed
const ProjectFormModal = dynamic(
  () =>
    import("@/features/projects/components/ProjectFormModal").then((mod) => ({
      default: mod.ProjectFormModal,
    })),
  { ssr: false }
);
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getPriorityColor,
} from "@/features/projects/utils/projectHelpers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { Project, ProjectStatus, ProjectPriority } from "@/types/bms";
import { toast } from "sonner";
import {
  FolderOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Loader2,
  RefreshCw,
  Target,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function ProjectsPage() {
  const router = useRouter();

  // Use custom hook for project management
  const { projects, loading, error, loadProjects, setProjects } = useProjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "planning" as ProjectStatus,
    priority: "medium" as ProjectPriority,
    progress: 0,
    startDate: "",
    endDate: "",
    budgetAllocated: "",
    budgetSpent: "",
    teamLead: "",
  });

  // Initialize auth on mount
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

  // loadProjects is now provided by useProjects hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        name: formData.name,
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
      };

      // Only add optional fields if they have values
      if (formData.description?.trim())
        payload.description = formData.description;
      if (formData.startDate?.trim()) payload.startDate = formData.startDate;
      if (formData.endDate?.trim()) payload.endDate = formData.endDate;
      if (
        formData.budgetAllocated &&
        !isNaN(parseFloat(formData.budgetAllocated))
      ) {
        payload.budgetAllocated = parseFloat(formData.budgetAllocated);
      }
      if (formData.budgetSpent && !isNaN(parseFloat(formData.budgetSpent))) {
        payload.budgetSpent = parseFloat(formData.budgetSpent);
      }
      if (formData.teamLead?.trim()) payload.teamLead = formData.teamLead;

      const newProject = await bmsApi.projects.create(payload);

      setProjects((prev) => [...prev, newProject as Project]);
      toast.success("Project created successfully!");
      setShowAddForm(false);
      setFormData({
        name: "",
        description: "",
        status: "planning" as ProjectStatus,
        priority: "medium" as ProjectPriority,
        progress: 0,
        startDate: "",
        endDate: "",
        budgetAllocated: "",
        budgetSpent: "",
        teamLead: "",
      });
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to create project";
      toast.error(errorMessage);
      console.error("Error creating project:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject || !formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: any = {
        id: selectedProject.id,
        companyId: selectedProject.companyId,
        name: formData.name.trim(),
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
        company: selectedProject.companyId, // Include the company object
      };

      // Only add optional fields if they have values (exclude empty strings)
      if (formData.description?.trim())
        payload.description = formData.description.trim();
      if (formData.startDate?.trim())
        payload.startDate = formData.startDate.trim();
      if (formData.endDate?.trim()) payload.endDate = formData.endDate.trim();
      if (formData.teamLead?.trim())
        payload.teamLead = formData.teamLead.trim();

      const budgetAllocated = formData.budgetAllocated?.trim();
      if (budgetAllocated && !isNaN(parseFloat(budgetAllocated))) {
        payload.budgetAllocated = parseFloat(budgetAllocated);
      }

      const budgetSpent = formData.budgetSpent?.trim();
      if (budgetSpent && !isNaN(parseFloat(budgetSpent))) {
        payload.budgetSpent = parseFloat(budgetSpent);
      }

      console.log("Updating project with payload:", payload);
      await bmsApi.projects.update(selectedProject.id, payload);

      // Update local state with the changed data (backend returns NoContent)
      const updatedProject = {
        ...selectedProject,
        ...payload,
        updatedAt: new Date().toISOString(),
      };

      setProjects((prev) =>
        prev.map((p) => (p.id === selectedProject.id ? updatedProject : p))
      );
      setSelectedProject(updatedProject);
      toast.success("Project updated successfully!");
      setShowEditForm(false);
    } catch (err) {
      const errorMessage =
        err instanceof BmsApiError ? err.message : "Failed to update project";
      toast.error(errorMessage);
      console.error("Error updating project:", err);
      if (err instanceof BmsApiError) {
        console.error("Error details:", {
          status: err.status,
          code: err.code,
          details: err.details,
          message: err.message,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditForm = (project: Project) => {
    setFormData({
      name: project.name,
      description: project.description || "",
      status: project.status,
      priority: project.priority,
      progress: project.progress,
      startDate: project.startDate || "",
      endDate: project.endDate || "",
      budgetAllocated: project.budgetAllocated?.toString() || "",
      budgetSpent: project.budgetSpent?.toString() || "",
      teamLead: project.teamLead || "",
    });
    setShowEditForm(true);
  };

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.teamLead?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper functions moved to features/projects/utils/projectHelpers.tsx
  // ProjectCard component moved to features/projects/components/ProjectCard.tsx

  const ProjectDetails = ({ project }: { project: Project }) => {
    const budgetRemaining =
      (project.budgetAllocated || 0) - (project.budgetSpent || 0);
    const budgetUtilization = project.budgetAllocated
      ? Math.round(((project.budgetSpent || 0) / project.budgetAllocated) * 100)
      : 0;

    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedProject(null)}>
          ← Back to Projects
        </Button>

        {/* Project Header */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
                <FolderOpen className="w-10 h-10 text-blue-600" />
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  {project.name}
                </h1>
                {project.description && (
                  <p className="text-gray-600 mb-4">{project.description}</p>
                )}

                <div className="flex gap-3 mb-4">
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  <Badge className={getPriorityColor(project.priority)}>
                    {project.priority}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                  {project.teamLead && (
                    <div>
                      <span className="text-gray-600">Project Lead:</span>
                      <div className="font-medium">{project.teamLead}</div>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">Progress:</span>
                    <div className="font-medium">{project.progress}%</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Project ID:</span>
                    <div className="font-medium font-mono text-xs">
                      {project.id.slice(0, 8)}...
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={() => openEditForm(project)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Overall Progress</span>
                <span className="font-medium">{project.progress}%</span>
              </div>
              <Progress value={project.progress} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(project.budgetAllocated)}
                  </div>
                  <div className="text-sm text-gray-600">Total Budget</div>
                  <div className="text-xs text-gray-500">
                    {formatCurrency(budgetRemaining)} remaining
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {formatCurrency(project.budgetSpent)}
                  </div>
                  <div className="text-sm text-gray-600">Budget Spent</div>
                  <div className="text-xs text-gray-500">
                    {budgetUtilization}% utilized
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">
                    {formatDate(project.startDate)}
                  </div>
                  <div className="text-sm text-gray-600">Start Date</div>
                  <div className="text-xs text-gray-500">
                    Ends {formatDate(project.endDate)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-900">
                    {project.progress}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                  <div className="text-xs text-gray-500">{project.status}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Project ID</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {project.id.slice(0, 8)}...
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company ID</span>
                <Badge variant="secondary" className="font-mono text-xs">
                  {project.companyId.slice(0, 8)}...
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority</span>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">
                  {formatDate(project.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">
                  {formatDate(project.updatedAt)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return <LoadingSpinnerCentered text="Loading projects..." />;
  }

  if (error) {
    return (
      <ErrorDisplayCentered
        title="Error loading projects"
        message={error.message}
        onRetry={loadProjects}
      />
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {!selectedProject ? (
          <>
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

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {projects.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total Projects
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {projects.filter((p) => p.status === "active").length}
                      </div>
                      <div className="text-sm text-gray-600">Active</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {formatCurrency(
                          projects.reduce(
                            (sum, p) => sum + (p.budgetAllocated || 0),
                            0
                          )
                        )}
                      </div>
                      <div className="text-sm text-gray-600">Total Budget</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Target className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(
                          projects.reduce((sum, p) => sum + p.progress, 0) /
                            projects.length
                        ) || 0}
                        %
                      </div>
                      <div className="text-sm text-gray-600">Avg Progress</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    onViewDetails={setSelectedProject}
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
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Project
                </Button>
              </div>
            )}
          </>
        ) : (
          <ProjectDetails project={selectedProject} />
        )}
        {/* Project Form Modals */}
        <ProjectFormModal
          open={showAddForm}
          onOpenChange={setShowAddForm}
          mode="add"
          formData={formData}
          setFormData={setFormData}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit}
        />

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
