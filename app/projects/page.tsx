// app/projects/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { Project, ProjectStatus, ProjectPriority } from "@/types/bms"
import { toast } from "sonner"
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
  Target
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function ProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    teamLead: ""
  })

  // Initialize auth on mount
  useEffect(() => {
    const auth = authService.getAuth()
    if (!auth) {
      router.push('/login')
      return
    }

    const token = authService.getToken()
    const companyId = authService.getCurrentCompanyId()

    if (token) bmsApi.setToken(token)
    if (companyId) bmsApi.setCompanyId(companyId)

    loadProjects()
  }, [router])

  const loadProjects = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.projects.getAll()
      setProjects(data as Project[])
      toast.success(`Loaded ${(data as Project[]).length} projects`)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load projects'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Project name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name: formData.name,
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress
      }

      // Only add optional fields if they have values
      if (formData.description?.trim()) payload.description = formData.description
      if (formData.startDate?.trim()) payload.startDate = formData.startDate
      if (formData.endDate?.trim()) payload.endDate = formData.endDate
      if (formData.budgetAllocated && !isNaN(parseFloat(formData.budgetAllocated))) {
        payload.budgetAllocated = parseFloat(formData.budgetAllocated)
      }
      if (formData.budgetSpent && !isNaN(parseFloat(formData.budgetSpent))) {
        payload.budgetSpent = parseFloat(formData.budgetSpent)
      }
      if (formData.teamLead?.trim()) payload.teamLead = formData.teamLead

      const newProject = await bmsApi.projects.create(payload)

      setProjects(prev => [...prev, newProject as Project])
      toast.success("Project created successfully!")
      setShowAddForm(false)
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
        teamLead: ""
      })
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to create project'
      toast.error(errorMessage)
      console.error('Error creating project:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProject || !formData.name.trim()) {
      toast.error("Project name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        id: selectedProject.id,
        companyId: selectedProject.companyId,
        name: formData.name.trim(),
        status: formData.status,
        priority: formData.priority,
        progress: formData.progress,
        company: selectedProject.company // Include the company object
      }

      // Only add optional fields if they have values (exclude empty strings)
      if (formData.description?.trim()) payload.description = formData.description.trim()
      if (formData.startDate?.trim()) payload.startDate = formData.startDate.trim()
      if (formData.endDate?.trim()) payload.endDate = formData.endDate.trim()
      if (formData.teamLead?.trim()) payload.teamLead = formData.teamLead.trim()

      const budgetAllocated = formData.budgetAllocated?.trim()
      if (budgetAllocated && !isNaN(parseFloat(budgetAllocated))) {
        payload.budgetAllocated = parseFloat(budgetAllocated)
      }

      const budgetSpent = formData.budgetSpent?.trim()
      if (budgetSpent && !isNaN(parseFloat(budgetSpent))) {
        payload.budgetSpent = parseFloat(budgetSpent)
      }

      console.log('Updating project with payload:', payload)
      await bmsApi.projects.update(selectedProject.id, payload)

      // Update local state with the changed data (backend returns NoContent)
      const updatedProject = {
        ...selectedProject,
        ...payload,
        updatedAt: new Date().toISOString()
      }

      setProjects(prev => prev.map(p => p.id === selectedProject.id ? updatedProject : p))
      setSelectedProject(updatedProject)
      toast.success("Project updated successfully!")
      setShowEditForm(false)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to update project'
      toast.error(errorMessage)
      console.error('Error updating project:', err)
      if (err instanceof BmsApiError) {
        console.error('Error details:', {
          status: err.status,
          code: err.code,
          details: err.details,
          message: err.message
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

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
      teamLead: project.teamLead || ""
    })
    setShowEditForm(true)
  }

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    project.teamLead?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "planning": return "bg-blue-100 text-blue-800"
      case "on-hold": return "bg-yellow-100 text-yellow-800"
      case "completed": return "bg-gray-100 text-gray-800"
      case "cancelled": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-100 text-red-800"
      case "high": return "bg-orange-100 text-orange-800"
      case "medium": return "bg-yellow-100 text-yellow-800"
      case "low": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const ProjectCard = ({ project }: { project: Project }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProject(project)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.teamLead && (
                <p className="text-sm text-gray-600">Led by {project.teamLead}</p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <Badge className={getPriorityColor(project.priority)}>
              {project.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {project.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        )}

        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Progress</span>
            <span className="font-medium">{project.progress}%</span>
          </div>
          <Progress value={project.progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{formatCurrency(project.budgetAllocated)}</div>
            <div className="text-xs text-gray-600">Budget</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{formatCurrency(project.budgetSpent)}</div>
            <div className="text-xs text-gray-600">Spent</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Start Date:</span>
            <span className="font-medium">{formatDate(project.startDate)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">End Date:</span>
            <span className="font-medium">{formatDate(project.endDate)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectDetails = ({ project }: { project: Project }) => {
    const budgetRemaining = (project.budgetAllocated || 0) - (project.budgetSpent || 0)
    const budgetUtilization = project.budgetAllocated ? Math.round(((project.budgetSpent || 0) / project.budgetAllocated) * 100) : 0

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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{project.name}</h1>
                {project.description && (
                  <p className="text-gray-600 mb-4">{project.description}</p>
                )}

                <div className="flex gap-3 mb-4">
                  <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                  <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
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
                    <div className="font-medium font-mono text-xs">{project.id.slice(0, 8)}...</div>
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
                  <div className="text-lg font-bold text-gray-900">{formatCurrency(project.budgetSpent)}</div>
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
                  <div className="text-sm font-bold text-gray-900">{formatDate(project.startDate)}</div>
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
                  <div className="text-lg font-bold text-gray-900">{project.progress}%</div>
                  <div className="text-sm text-gray-600">Complete</div>
                  <div className="text-xs text-gray-500">
                    {project.status}
                  </div>
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
                <Badge variant="secondary" className="font-mono text-xs">{project.id.slice(0, 8)}...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Company ID</span>
                <Badge variant="secondary" className="font-mono text-xs">{project.companyId.slice(0, 8)}...</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status</span>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Priority</span>
                <Badge className={getPriorityColor(project.priority)}>{project.priority}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Created</span>
                <span className="text-sm font-medium">{formatDate(project.createdAt)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Updated</span>
                <span className="text-sm font-medium">{formatDate(project.updatedAt)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading projects...</h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FolderOpen className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading projects</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProjects}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedProject ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600">Manage and track all organizational projects</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadProjects}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              {authService.hasPermission('create', 'project') && (
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
                    <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
                    <div className="text-sm text-gray-600">Total Projects</div>
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
                      {projects.filter(p => p.status === 'active').length}
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
                      {formatCurrency(projects.reduce((sum, p) => sum + (p.budgetAllocated || 0), 0))}
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
                      {Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) || 0}%
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
              {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
            </Badge>
          </div>

          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first project'}
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

      {/* Add Project Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Create a new project in the system. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Project Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Project Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description"
                  rows={3}
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as ProjectPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progress */}
              <div className="grid gap-2">
                <Label htmlFor="progress">Progress (%)</Label>
                <Input
                  id="progress"
                  type="number"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Budget Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="budgetAllocated">Budget Allocated (CAD)</Label>
                  <Input
                    id="budgetAllocated"
                    type="number"
                    value={formData.budgetAllocated}
                    onChange={(e) => setFormData({ ...formData, budgetAllocated: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="budgetSpent">Budget Spent (CAD)</Label>
                  <Input
                    id="budgetSpent"
                    type="number"
                    value={formData.budgetSpent}
                    onChange={(e) => setFormData({ ...formData, budgetSpent: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Team Lead */}
              <div className="grid gap-2">
                <Label htmlFor="teamLead">Team Lead</Label>
                <Input
                  id="teamLead"
                  value={formData.teamLead}
                  onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                  placeholder="Team lead name"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Modal */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update project information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              {/* Project Name */}
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Project Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>

              {/* Description */}
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project description"
                  rows={3}
                />
              </div>

              {/* Status and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as ProjectStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planning</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on-hold">On Hold</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value as ProjectPriority })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Progress */}
              <div className="grid gap-2">
                <Label htmlFor="edit-progress">Progress (%)</Label>
                <Input
                  id="edit-progress"
                  type="number"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                  max="100"
                />
              </div>

              {/* Start and End Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-startDate">Start Date</Label>
                  <Input
                    id="edit-startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-endDate">End Date</Label>
                  <Input
                    id="edit-endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Budget Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-budgetAllocated">Budget Allocated (CAD)</Label>
                  <Input
                    id="edit-budgetAllocated"
                    type="number"
                    value={formData.budgetAllocated}
                    onChange={(e) => setFormData({ ...formData, budgetAllocated: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-budgetSpent">Budget Spent (CAD)</Label>
                  <Input
                    id="edit-budgetSpent"
                    type="number"
                    value={formData.budgetSpent}
                    onChange={(e) => setFormData({ ...formData, budgetSpent: e.target.value })}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Team Lead */}
              <div className="grid gap-2">
                <Label htmlFor="edit-teamLead">Team Lead</Label>
                <Input
                  id="edit-teamLead"
                  value={formData.teamLead}
                  onChange={(e) => setFormData({ ...formData, teamLead: e.target.value })}
                  placeholder="Team lead name"
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Project
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
