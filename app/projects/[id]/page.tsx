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
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { SetBreadcrumb } from "@/contexts/BreadcrumbContext";
import { Project } from "@/types/bms";
import { toast } from "sonner";

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
  progress: 0,
  startDate: "",
  endDate: "",
  budgetAllocated: "",
  budgetSpent: "",
  teamLead: "",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

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
      progress: project.progress ?? 0,
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
      budgetAllocated: project.budgetAllocated?.toString() ?? "",
      budgetSpent: project.budgetSpent?.toString() ?? "",
      teamLead: project.teamLead ?? "",
    });
    setShowEditForm(true);
  };

  const buildPayload = (includeId?: string) => {
    const payload: Record<string, unknown> = {
      name: formData.name.trim(),
      status: formData.status,
      priority: formData.priority,
      progress: formData.progress,
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

  return (
    <AppLayout>
      {/* Set breadcrumb inside AppLayout where provider exists */}
      {breadcrumbItems.length > 0 && <SetBreadcrumb items={breadcrumbItems} />}

      <div className="space-y-6">
        {/* Project Details */}
        <ProjectDetails project={project} onBack={handleBack} onEdit={handleEdit} />

        {/* Assignments Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members Assignment */}
          <MembersAssignment
            entityType="project"
            entityId={project.id!}
            entityName={project.name || "this project"}
          />

          {/* Departments Assignment */}
          <DepartmentsAssignment
            projectId={project.id!}
            projectName={project.name || "this project"}
          />
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
