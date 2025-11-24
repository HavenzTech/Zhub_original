import { useState, useCallback, Dispatch, SetStateAction } from "react"
import { bmsApi } from "@/lib/services/bmsApi"
import type { Project } from "@/types/bms"
import { toast } from "sonner"

interface UseProjectsReturn {
  projects: Project[]
  loading: boolean
  error: Error | null
  loadProjects: () => Promise<void>
  createProject: (projectData: Partial<Project>) => Promise<Project | null>
  updateProject: (
    id: string,
    projectData: Partial<Project>
  ) => Promise<boolean>
  deleteProject: (id: string) => Promise<boolean>
  setProjects: Dispatch<SetStateAction<Project[]>>
}

/**
 * Hook for managing projects
 * Handles fetching, creating, updating, and deleting projects
 */
export function useProjects(): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.projects.getAll()
      setProjects(data as Project[])
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to load projects")
      setError(error)
      toast.error("Failed to load projects", {
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }, [])

  const createProject = useCallback(
    async (projectData: Partial<Project>): Promise<Project | null> => {
      try {
        const newProject = await bmsApi.projects.create(projectData)
        setProjects((prev) => [...prev, newProject as Project])
        toast.success("Project created successfully")
        return newProject as Project
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to create project")
        toast.error("Failed to create project", {
          description: error.message,
        })
        return null
      }
    },
    []
  )

  const updateProject = useCallback(
    async (id: string, projectData: Partial<Project>): Promise<boolean> => {
      try {
        await bmsApi.projects.update(id, projectData)
        setProjects((prev) =>
          prev.map((project) =>
            project.id === id ? { ...project, ...projectData } : project
          )
        )
        toast.success("Project updated successfully")
        return true
      } catch (err) {
        const error =
          err instanceof Error ? err : new Error("Failed to update project")
        toast.error("Failed to update project", {
          description: error.message,
        })
        return false
      }
    },
    []
  )

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      await bmsApi.projects.delete(id)
      setProjects((prev) => prev.filter((project) => project.id !== id))
      toast.success("Project deleted successfully")
      return true
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error("Failed to delete project")
      toast.error("Failed to delete project", {
        description: error.message,
      })
      return false
    }
  }, [])

  return {
    projects,
    loading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    setProjects,
  }
}
