// app/departments/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Users, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  MoreHorizontal,
  Building2,
  FileText,
  CheckSquare,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Filter,
  Share,
  Download,
  Phone,
  Mail,
  MapPin,
  Target,
  Briefcase
} from 'lucide-react'

interface Department {
  id: string
  name: string
  description: string
  head: {
    name: string
    email: string
    phone: string
  }
  employees: {
    total: number
    active: number
    onLeave: number
  }
  budget: {
    allocated: number
    spent: number
    remaining: number
  }
  projects: {
    active: number
    completed: number
    total: number
  }
  tasks: {
    pending: number
    completed: number
    overdue: number
  }
  documents: {
    total: number
    recentUploads: number
  }
  companies: string[]
  kpis: {
    efficiency: number
    satisfaction: number
    utilization: number
  }
  recentActivity: {
    action: string
    timestamp: string
    user: string
  }[]
}

export default function DepartmentsPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)

  const departments: Department[] = [
    {
      id: "DEPT-001",
      name: "Information Technology",
      description: "Manages all technology infrastructure, software development, and digital transformation initiatives across the organization.",
      head: {
        name: "Sarah Johnson",
        email: "sarah.johnson@havenz.com",
        phone: "+1 (403) 555-0123"
      },
      employees: {
        total: 24,
        active: 22,
        onLeave: 2
      },
      budget: {
        allocated: 450000,
        spent: 285000,
        remaining: 165000
      },
      projects: {
        active: 5,
        completed: 22,
        total: 27
      },
      tasks: {
        pending: 23,
        completed: 89,
        overdue: 1
      },
      documents: {
        total: 203,
        recentUploads: 8
      },
      companies: ["AHI Red Deer", "Havenz Tech", "Denvr Dataworks"],
      kpis: {
        efficiency: 94,
        satisfaction: 89,
        utilization: 91
      },
      recentActivity: [
        { action: "Q1 budget review completed", timestamp: "4 hours ago", user: "Robert Martinez" },
        { action: "Financial report generated", timestamp: "1 day ago", user: "Finance Team" },
        { action: "Expense approval processed", timestamp: "2 days ago", user: "AccountsPayable" }
      ]
    },
    {
      id: "DEPT-003",
      name: "Legal & Compliance",
      description: "Ensures legal compliance, contract management, and risk mitigation across all business operations.",
      head: {
        name: "Jennifer Lee",
        email: "jennifer.lee@havenz.com",
        phone: "+1 (403) 555-0789"
      },
      employees: {
        total: 8,
        active: 8,
        onLeave: 0
      },
      budget: {
        allocated: 320000,
        spent: 195000,
        remaining: 125000
      },
      projects: {
        active: 6,
        completed: 18,
        total: 24
      },
      tasks: {
        pending: 17,
        completed: 156,
        overdue: 2
      },
      documents: {
        total: 312,
        recentUploads: 15
      },
      companies: ["AHI Red Deer", "Havenz Tech"],
      kpis: {
        efficiency: 91,
        satisfaction: 95,
        utilization: 88
      },
      recentActivity: [
        { action: "Contract review completed", timestamp: "1 hour ago", user: "Jennifer Lee" },
        { action: "Compliance audit scheduled", timestamp: "6 hours ago", user: "Legal Team" },
        { action: "Policy update published", timestamp: "1 day ago", user: "Compliance Officer" }
      ]
    },
    {
      id: "DEPT-004",
      name: "Operations",
      description: "Oversees daily operations, process optimization, and operational efficiency across all business units.",
      head: {
        name: "Michael Torres",
        email: "michael.torres@havenz.com",
        phone: "+1 (780) 555-0234"
      },
      employees: {
        total: 18,
        active: 17,
        onLeave: 1
      },
      budget: {
        allocated: 680000,
        spent: 425000,
        remaining: 255000
      },
      projects: {
        active: 7,
        completed: 12,
        total: 19
      },
      tasks: {
        pending: 34,
        completed: 98,
        overdue: 4
      },
      documents: {
        total: 89,
        recentUploads: 6
      },
      companies: ["Denvr Dataworks", "AHI Red Deer"],
      kpis: {
        efficiency: 89,
        satisfaction: 87,
        utilization: 93
      },
      recentActivity: [
        { action: "Process improvement implemented", timestamp: "3 hours ago", user: "Michael Torres" },
        { action: "Equipment maintenance scheduled", timestamp: "8 hours ago", user: "Operations Team" },
        { action: "Quality check completed", timestamp: "1 day ago", user: "QA Supervisor" }
      ]
    }
  ]

  const filteredDepartments = departments.filter(dept =>
    dept.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    dept.head.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const DepartmentCard = ({ department }: { department: Department }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDepartment(department)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              <p className="text-sm text-gray-600">Led by {department.head.name}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">{department.employees.active}</div>
            <div className="text-xs text-gray-600">Active Staff</div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{department.description}</p>
        
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{department.projects.active}</div>
            <div className="text-xs text-gray-600">Active Projects</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{department.tasks.pending}</div>
            <div className="text-xs text-gray-600">Pending Tasks</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">${(department.budget.allocated / 1000).toFixed(0)}K</div>
            <div className="text-xs text-gray-600">Budget</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Efficiency:</span>
            <span className="font-medium">{department.kpis.efficiency}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Companies:</span>
            <span className="font-medium">{department.companies.length}</span>
          </div>
        </div>
        
        {department.tasks.overdue > 0 && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <div className="flex items-center gap-2 text-red-600 text-sm">
              <AlertTriangle className="w-4 h-4" />
              {department.tasks.overdue} overdue tasks
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const DepartmentDetails = ({ department }: { department: Department }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedDepartment(null)}>
          ← Back to Departments
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Department
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button>
            <Eye className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
        </div>
      </div>

      {/* Department Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-purple-100 rounded-xl flex items-center justify-center">
              <Users className="w-10 h-10 text-purple-600" />
            </div>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{department.name}</h1>
              <p className="text-gray-600 mb-4">{department.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Department Head:</span>
                  <div className="font-medium">{department.head.name}</div>
                </div>
                <div>
                  <span className="text-gray-600">Total Staff:</span>
                  <div className="font-medium">{department.employees.total}</div>
                </div>
                <div>
                  <span className="text-gray-600">Active Projects:</span>
                  <div className="font-medium">{department.projects.active}</div>
                </div>
                <div>
                  <span className="text-gray-600">Companies Served:</span>
                  <div className="font-medium">{department.companies.length}</div>
                </div>
              </div>
            </div>
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
                  ${(department.budget.allocated / 1000).toFixed(0)}K
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
                <div className="text-xs text-gray-500">
                  ${(department.budget.remaining / 1000).toFixed(0)}K remaining
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
                <div className="text-lg font-bold text-gray-900">{department.employees.active}</div>
                <div className="text-sm text-gray-600">Active Staff</div>
                <div className="text-xs text-gray-500">
                  {department.employees.onLeave} on leave
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
                <div className="text-lg font-bold text-gray-900">{department.projects.active}</div>
                <div className="text-sm text-gray-600">Active Projects</div>
                <div className="text-xs text-gray-500">
                  {department.projects.completed} completed
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">{department.tasks.pending}</div>
                <div className="text-sm text-gray-600">Pending Tasks</div>
                <div className="text-xs text-red-500">
                  {department.tasks.overdue} overdue
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance & Contact */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Performance KPIs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Efficiency</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${department.kpis.efficiency}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{department.kpis.efficiency}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Satisfaction</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full" 
                      style={{ width: `${department.kpis.satisfaction}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{department.kpis.satisfaction}%</span>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Utilization</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-purple-500 rounded-full" 
                      style={{ width: `${department.kpis.utilization}%` }}
                    ></div>
                  </div>
                  <span className="font-medium">{department.kpis.utilization}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Department Head Contact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="font-medium">{department.head.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-blue-600">{department.head.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{department.head.phone}</span>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-2">Companies Served</h4>
              <div className="flex flex-wrap gap-2">
                {department.companies.map((company, index) => (
                  <Badge key={index} variant="secondary">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {department.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{activity.action}</div>
                  <div className="text-sm text-gray-600">by {activity.user}</div>
                </div>
                <div className="text-sm text-gray-500">{activity.timestamp}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {!selectedDepartment ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
              <p className="text-gray-600">Cross-organizational department management and analytics</p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Department
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
                    <div className="text-sm text-gray-600">Total Departments</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {departments.reduce((sum, dept) => sum + dept.employees.active, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Total Employees</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {departments.reduce((sum, dept) => sum + dept.projects.active, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Active Projects</div>
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
                    <div className="text-2xl font-bold text-gray-900">
                      {departments.reduce((sum, dept) => sum + dept.tasks.overdue, 0)}
                    </div>
                    <div className="text-sm text-gray-600">Overdue Tasks</div>
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
                placeholder="Search departments..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>

          {/* Departments Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredDepartments.map((department) => (
              <DepartmentCard key={department.id} department={department} />
            ))}
          </div>

          {filteredDepartments.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No departments found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Department
              </Button>
            </div>
          )}
        </>
      ) : (
        <DepartmentDetails department={selectedDepartment} />
      )}
    </div>
  )
}
