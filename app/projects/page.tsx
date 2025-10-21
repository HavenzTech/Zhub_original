// app/projects/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  Users,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2,
  Target,
  TrendingUp,
  Filter,
  Download,
  Share
} from 'lucide-react'

interface Project {
  id: string
  name: string
  description: string
  company: string
  status: "planning" | "active" | "on-hold" | "completed" | "cancelled"
  priority: "low" | "medium" | "high" | "critical"
  progress: number
  startDate: string
  endDate: string
  budget: {
    allocated: number
    spent: number
    remaining: number
  }
  team: {
    lead: string
    members: number
    departments: string[]
  }
  milestones: {
    id: string
    name: string
    dueDate: string
    status: "pending" | "completed" | "overdue"
  }[]
  documents: number
  tasks: {
    total: number
    completed: number
    overdue: number
  }
  risks: {
    level: "low" | "medium" | "high"
    count: number
  }
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)

  const projects: Project[] = [
    {
      id: "PRJ-001",
      name: "Infrastructure Upgrade",
      description: "Complete modernization of IT infrastructure including servers, networking, and security systems",
      company: "AHI Red Deer",
      status: "active",
      priority: "high",
      progress: 68,
      startDate: "2024-11-01",
      endDate: "2025-03-15",
      budget: {
        allocated: 850000,
        spent: 578000,
        remaining: 272000
      },
      team: {
        lead: "Sarah Johnson",
        members: 8,
        departments: ["IT", "Operations", "Security"]
      },
      milestones: [
        { id: "M1", name: "Server Migration", dueDate: "2025-01-20", status: "completed" },
        { id: "M2", name: "Network Upgrade", dueDate: "2025-02-10", status: "pending" },
        { id: "M3", name: "Security Implementation", dueDate: "2025-03-01", status: "pending" }
      ],
      documents: 23,
      tasks: {
        total: 45,
        completed: 31,
        overdue: 2
      },
      risks: {
        level: "medium",
        count: 3
      }
    },
    {
      id: "PRJ-002",
      name: "Mobile App Development",
      description: "Development of customer-facing mobile application with real-time features",
      company: "Havenz Tech",
      status: "active",
      priority: "critical",
      progress: 45,
      startDate: "2024-12-01",
      endDate: "2025-04-30",
      budget: {
        allocated: 450000,
        spent: 203000,
        remaining: 247000
      },
      team: {
        lead: "Alex Chen",
        members: 6,
        departments: ["Development", "Design", "QA"]
      },
      milestones: [
        { id: "M1", name: "UI/UX Design", dueDate: "2025-01-15", status: "completed" },
        { id: "M2", name: "Backend Development", dueDate: "2025-02-28", status: "pending" },
        { id: "M3", name: "Testing & QA", dueDate: "2025-04-15", status: "pending" }
      ],
      documents: 15,
      tasks: {
        total: 32,
        completed: 14,
        overdue: 3
      },
      risks: {
        level: "high",
        count: 5
      }
    },
    {
      id: "PRJ-003",
      name: "Data Center Expansion",
      description: "Expansion of existing data center capacity and implementation of new cooling systems",
      company: "Denvr Dataworks",
      status: "planning",
      priority: "medium",
      progress: 15,
      startDate: "2025-02-01",
      endDate: "2025-08-31",
      budget: {
        allocated: 1200000,
        spent: 45000,
        remaining: 1155000
      },
      team: {
        lead: "Michael Torres",
        members: 12,
        departments: ["Infrastructure", "Engineering", "Operations"]
      },
      milestones: [
        { id: "M1", name: "Site Preparation", dueDate: "2025-03-01", status: "pending" },
        { id: "M2", name: "Equipment Installation", dueDate: "2025-05-15", status: "pending" },
        { id: "M3", name: "System Integration", dueDate: "2025-07-30", status: "pending" }
      ],
      documents: 8,
      tasks: {
        total: 28,
        completed: 4,
        overdue: 0
      },
      risks: {
        level: "low",
        count: 2
      }
    }
  ]

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesFilter = selectedFilter === "all" || 
                         project.status === selectedFilter ||
                         (selectedFilter === "overdue" && project.tasks.overdue > 0) ||
                         (selectedFilter === "high-priority" && (project.priority === "high" || project.priority === "critical"))
    
    return matchesSearch && matchesFilter
  })

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

  const getRiskColor = (level: string) => {
    switch (level) {
      case "high": return "text-red-600"
      case "medium": return "text-yellow-600"
      case "low": return "text-green-600"
      default: return "text-gray-600"
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
              <p className="text-sm text-gray-600">{project.company}</p>
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
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{project.description}</p>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{project.progress}%</span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold text-gray-900">${(project.budget.allocated / 1000).toFixed(0)}K</div>
              <div className="text-gray-600">Budget</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{project.team.members}</div>
              <div className="text-gray-600">Team</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{project.tasks.total}</div>
              <div className="text-gray-600">Tasks</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              Due: {new Date(project.endDate).toLocaleDateString()}
            </div>
            {project.risks.count > 0 && (
              <div className={`flex items-center gap-1 ${getRiskColor(project.risks.level)}`}>
                <AlertTriangle className="w-4 h-4" />
                {project.risks.count} risks
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const ProjectDetails = ({ project }: { project: Project }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedProject(null)}>
          ← Back to Projects
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Project
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            View Documents
          </Button>
        </div>
      </div>

      {/* Project Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              <FolderOpen className="w-10 h-10 text-blue-600" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority} priority
                </Badge>
              </div>
              
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Company:</span>
                  <div className="font-medium">{project.company}</div>
                </div>
                <div>
                  <span className="text-gray-600">Project Lead:</span>
                  <div className="font-medium">{project.team.lead}</div>
                </div>
                <div>
                  <span className="text-gray-600">Start Date:</span>
                  <div className="font-medium">{new Date(project.startDate).toLocaleDateString()}</div>
                </div>
                <div>
                  <span className="text-gray-600">End Date:</span>
                  <div className="font-medium">{new Date(project.endDate).toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium">Overall Progress</span>
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
                  ${(project.budget.allocated / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
                <div className="text-xs text-gray-500">
                  ${(project.budget.remaining / 1000).toFixed(0)}K remaining
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{project.team.members}</div>
                <div className="text-sm text-gray-600">Team Members</div>
                <div className="text-xs text-gray-500">
                  {project.team.departments.length} departments
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{project.tasks.completed}/{project.tasks.total}</div>
                <div className="text-sm text-gray-600">Tasks Complete</div>
                <div className="text-xs text-red-500">
                  {project.tasks.overdue} overdue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{project.risks.count}</div>
                <div className="text-sm text-gray-600">Active Risks</div>
                <div className={`text-xs ${getRiskColor(project.risks.level)}`}>
                  {project.risks.level} severity
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Milestones and Team */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Project Milestones
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {project.milestones.map((milestone) => (
                <div key={milestone.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center">
                    {milestone.status === "completed" ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : milestone.status === "overdue" ? (
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-yellow-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{milestone.name}</div>
                    <div className="text-sm text-gray-600">
                      Due: {new Date(milestone.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge 
                    variant={milestone.status === "completed" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {milestone.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team & Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="font-medium text-gray-900">Project Lead</div>
                <div className="text-sm text-gray-600">{project.team.lead}</div>
              </div>
              
              <div>
                <div className="font-medium text-gray-900 mb-2">Departments Involved</div>
                <div className="flex flex-wrap gap-2">
                  {project.team.departments.map((dept, index) => (
                    <Badge key={index} variant="secondary">
                      {dept}
                    </Badge>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600">Total Team Members</span>
                <span className="font-medium">{project.team.members}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Documents</span>
                <span className="font-medium">{project.documents}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {!selectedProject ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
              <p className="text-gray-600">Manage and track all organizational projects across companies</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>

          {/* Stats Cards */}
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
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projects.filter(p => p.status === "active").length}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {projects.reduce((sum, p) => sum + p.tasks.overdue, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Overdue Tasks</div>
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
                    <div className="text-2xl font-bold text-gray-900">
                      ${(projects.reduce((sum, p) => sum + p.budget.allocated, 0) / 1000000).toFixed(1)}M
                    </div>
                    <div className="text-sm text-gray-600">Total Budget</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
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
            
            <div className="flex gap-2">
              {["all", "active", "planning", "overdue", "high-priority"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter.split("-").map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(" ")}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12">
              <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria or create a new project</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create First Project
              </Button>
            </div>
          )}
        </>
      ) : (
        <ProjectDetails project={selectedProject} />
      )}
    </div>
  )
}