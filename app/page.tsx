// app/page.tsx - Enhanced Main Layout with All New Pages and Features
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/services/auth"
import {
  Building2,
  Activity,
  Plus,
  FolderOpen,
  Users,
  CheckSquare,
  Workflow,
  Bot,
  Settings,
  Search,
  Bell,
  Shield,
  Upload,
  FileText,
  DollarSign,
  Calendar,
  ChevronRight,
  Home,
  Eye,
  Lock,
  Server,
  MessageSquare,
  Smartphone,
  Database,
  Globe,
  PanelRightClose,
  PanelRightOpen,
  Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi } from "@/lib/services/bmsApi"
import { UserProfile } from "@/components/UserProfile"
import type { Company, Department, Project, Property, BmsDevice, AccessLog, IotMetric } from "@/types/bms"

// Import all page components
import ZAiPage from "./z-ai/page"
import CompaniesPage from "./companies/page"
import ProjectsPage from "./projects/page"
import DepartmentsPage from "./departments/page"
import PropertiesPage from "./properties/page" // NEW
import DocumentControlPage from "./document-control/page"
import UsersPage from "./users/page" // NEW - Admin only
import WorkflowsPage from "./workflows/page"
import VirtualChatbotsPage from "./virtual-chatbots/page" // NEW
import SecureDataCenterPage from "./secure-datacenter/page" // NEW
import BMSHardwarePage from "./bms-hardware/page" // NEW
import SettingsPage from "./settings/page"

export default function HavenzHubDashboard() {
  const router = useRouter()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [activeSection, setActiveSection] = useState("dashboard")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [todosPanelCollapsed, setTodosPanelCollapsed] = useState(false)

  // Backend data state
  const [companies, setCompanies] = useState<Company[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [bmsDevices, setBmsDevices] = useState<BmsDevice[]>([])
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [loading, setLoading] = useState(true)

  // Check authentication on mount
  useEffect(() => {
    const auth = authService.getAuth()

    if (!auth) {
      router.push('/login')
      return
    }

    // Set auth token and company ID for API calls
    const token = authService.getToken()
    const companyId = authService.getCurrentCompanyId()

    if (token) {
      bmsApi.setToken(token)
    }

    if (companyId) {
      bmsApi.setCompanyId(companyId)
    }

    setIsAuthenticated(true)
    setAuthLoading(false)
  }, [router])

  // Load all dashboard data from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      const [companiesData, departmentsData, projectsData, propertiesData, devicesData, logsData] = await Promise.all([
        bmsApi.companies.getAll(),
        bmsApi.departments.getAll(),
        bmsApi.projects.getAll(),
        bmsApi.properties.getAll(),
        bmsApi.bmsDevices.getAll(),
        bmsApi.accessLogs.getAll()
      ])

      setCompanies(companiesData as Company[])
      setDepartments(departmentsData as Department[])
      setProjects(projectsData as Project[])
      setProperties(propertiesData as Property[])
      setBmsDevices(devicesData as BmsDevice[])
      setAccessLogs(logsData as AccessLog[])
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const recentTodos = [
    { id: 1, task: "Review Q4 contracts for AHI Red Deer", due: "Today", priority: "high", linkedTo: { type: "company", name: "AHI Red Deer" } },
    { id: 2, task: "Upload insurance documents", due: "Tomorrow", priority: "medium", linkedTo: { type: "property", name: "CHP Facility" } },
    { id: 3, task: "Schedule department meeting", due: "This week", priority: "low", linkedTo: { type: "department", name: "Operations" } },
    { id: 4, task: "Approve budget for Havenz Tech project", due: "Friday", priority: "high", linkedTo: { type: "project", name: "AI Integration" } },
    { id: 5, task: "Configure chatbot for Energy Haven", due: "Next week", priority: "medium", linkedTo: { type: "company", name: "Energy Haven LP" } }
  ]

  const recentUploads = [
    { id: 1, name: "Contract_AHI_2025.pdf", company: "Agritech Haven LP", time: "2 hours ago" },
    { id: 2, name: "Budget_Q1_Report.xlsx", company: "Havenz Tech", time: "4 hours ago" },
    { id: 3, name: "Security_Audit.docx", company: "Denvr Dataworks", time: "1 day ago" },
    { id: 4, name: "CHP_Maintenance_Schedule.pdf", property: "CHP Facility", time: "2 days ago" }
  ]

  // Enhanced sidebar items with NEW PAGES
  const sidebarItems = [
    { id: "dashboard", icon: Home, label: "Global Dashboard" },
    { id: "companies", icon: Building2, label: "Companies" },
    { id: "departments", icon: Users, label: "Departments" },
    { id: "projects", icon: FolderOpen, label: "Projects" },
    { id: "properties", icon: Home, label: "Properties" }, // NEW 4th Category
    { id: "document-control", icon: FileText, label: "Document Control" },
    { id: "users", icon: Shield, label: "User Management", adminOnly: true }, // NEW - Admin only
    // { id: "workflows", icon: Workflow, label: "Workflows" }, // Hidden temporarily
    { id: "virtual-chatbots", icon: MessageSquare, label: "Virtual Chatbots" }, // NEW
    // { id: "secure-datacenter", icon: Server, label: "Secure Data Center" }, // Hidden temporarily
    // { id: "bms-hardware", icon: Smartphone, label: "BMS Hardware" }, // Hidden temporarily
    { id: "z-ai", icon: Bot, label: "Z AI" },
    // { id: "settings", icon: Settings, label: "Settings" } // Hidden temporarily
  ]

  const renderGlobalDashboard = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      )
    }

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Havenz Hub</h1>
          <p className="text-blue-100">Your secure operating system for organizational intelligence</p>
          <div className="flex items-center gap-2 mt-3">
            <Shield className="w-4 h-4" />
            <span className="text-sm">Secured • On-Premise • Blockchain Audited</span>
          </div>
        </div>

      {/* Enhanced Key Metrics - NOW INCLUDING ALL CATEGORIES */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Total Companies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{companies.length}</div>
            <div className="text-xs text-green-600">All stakeholder entities</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{departments.length}</div>
            <div className="text-xs text-blue-600">Across all companies</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <FolderOpen className="w-4 h-4" />
              Active Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{projects.length}</div>
            <div className="text-xs text-purple-600">Portfolio-wide</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Home className="w-4 h-4" />
              Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
            <div className="text-xs text-orange-600">Physical assets</div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              Total Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              ${(departments.reduce((sum, dept) => sum + (dept.budgetAllocated || 0), 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-xs text-green-600">Department budgets</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Enhanced */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Virtual Chatbots</h3>
                <p className="text-sm text-gray-600">AI-powered assistance</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => setActiveSection("virtual-chatbots")}
            >
              Manage Chatbots
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data Center</h3>
                <p className="text-sm text-gray-600">{accessLogs.length} access logs</p>
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setActiveSection("secure-datacenter")}
            >
              View Capacity
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">BMS Hardware</h3>
                <p className="text-sm text-gray-600">{bmsDevices.length} devices online</p>
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setActiveSection("bms-hardware")}
            >
              Shop Hardware
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Company Overview */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Companies Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <div key={company.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100" onClick={() => setActiveSection("companies")}>
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 text-sm">{company.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{company.status}</span>
                  </div>
                </div>
                <Badge className={`text-xs ${company.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                  {company.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Recent Uploads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUploads.map((upload) => (
                <div key={upload.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{upload.name}</div>
                    <div className="text-xs text-gray-600">
                      {upload.company || upload.property} • {upload.time}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Companies</span>
                <Badge className="bg-blue-100 text-blue-800">{companies.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Departments</span>
                <Badge className="bg-purple-100 text-purple-800">{departments.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active Projects</span>
                <Badge className="bg-green-100 text-green-800">{projects.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Properties</span>
                <Badge className="bg-orange-100 text-orange-800">{properties.length}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">BMS Devices Online</span>
                <Badge className="bg-green-100 text-green-800">{bmsDevices.length}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    )
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Enhanced Sidebar */}
      <div className={`${sidebarCollapsed ? "w-16" : "w-64"} bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0`}>
        <div className="p-4 h-full flex flex-col">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            {!sidebarCollapsed ? (
              <img 
                src="/logo.png" 
                alt="Havenz Hub" 
                className="h-8 object-contain"
              />
            ) : (
              <img 
                src="/logo.png" 
                alt="Havenz Hub" 
                className="w-8 h-8 object-contain mx-auto"
              />
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className={`${sidebarCollapsed ? "" : "ml-auto"}`}
            >
              <ChevronRight className={`w-4 h-4 transition-transform ${sidebarCollapsed ? "" : "rotate-180"}`} />
            </Button>
          </div>

          {/* Enhanced Search with Z AI */}
          {!sidebarCollapsed && (
            <div className="mb-6">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input 
                  placeholder="Ask Z or search..." 
                  className="pl-10 bg-gray-50 border-gray-200"
                />
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="space-y-2 flex-1">
            {sidebarItems
              .filter((item) => {
                // Filter out admin-only items if user is not admin/super_admin
                if (item.adminOnly) {
                  const role = authService.getCurrentRole()
                  return role === 'admin' || role === 'super_admin'
                }
                return true
              })
              .map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {!sidebarCollapsed && (
                    <span className="font-medium">{item.label}</span>
                  )}
                </button>
              ))}
          </nav>

          {/* Enhanced Security Status */}
          {!sidebarCollapsed && (
            <div className="mt-auto">
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-green-700">ALL SYSTEMS SECURE</span>
                </div>
                <div className="text-xs text-green-600">
                  On-premise • Encrypted • Monitored
                </div>
              </div>
              
              <div className="text-xs text-center text-gray-500">
                <div className="mb-1">Havenz Hub v3.2.1</div>
                <div className="flex items-center justify-center gap-1">
                  <Globe className="w-3 h-3" />
                  <span>Calgary, AB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {activeSection === "dashboard" && "Global Dashboard"}
                {activeSection === "companies" && "Companies"}
                {activeSection === "departments" && "Departments"}
                {activeSection === "projects" && "Projects"}
                {activeSection === "properties" && "Properties"}
                {activeSection === "document-control" && "Document Control"}
                {activeSection === "users" && "User Management"}
                {activeSection === "workflows" && "Workflows"}
                {activeSection === "virtual-chatbots" && "Virtual Chatbots"}
                {activeSection === "secure-datacenter" && "Secure Data Center"}
                {activeSection === "bms-hardware" && "BMS Hardware"}
                {activeSection === "z-ai" && "Z AI Assistant"}
                {activeSection === "settings" && "Settings"}
              </h2>
              
              {/* Breadcrumb indicators */}
              {activeSection !== "dashboard" && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ChevronRight className="w-4 h-4" />
                  <span className="capitalize">{activeSection.replace('-', ' ')}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <Button variant="ghost" size="sm" onClick={() => setActiveSection("z-ai")}>
                <Bot className="w-4 h-4 mr-2" />
                Ask Z
              </Button>

              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>

              <UserProfile />
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            {activeSection === "dashboard" && renderGlobalDashboard()}
            {activeSection === "companies" && <CompaniesPage />}
            {activeSection === "departments" && <DepartmentsPage />}
            {activeSection === "projects" && <ProjectsPage />}
            {activeSection === "properties" && <PropertiesPage />}
            {activeSection === "document-control" && <DocumentControlPage />}
            {activeSection === "users" && <UsersPage />}
            {activeSection === "workflows" && <WorkflowsPage />}
            {activeSection === "virtual-chatbots" && <VirtualChatbotsPage />}
            {activeSection === "secure-datacenter" && <SecureDataCenterPage />}
            {activeSection === "bms-hardware" && <BMSHardwarePage />}
            {activeSection === "z-ai" && <ZAiPage />}
            {activeSection === "settings" && <SettingsPage />}
          </div>
        </div>

        {/* Enhanced To-Do Sidebar with Linked Entities */}
        <div className={`${todosPanelCollapsed ? 'w-12' : 'w-80'} bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className={`${todosPanelCollapsed ? 'hidden' : 'block'}`}>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  To-Dos
                </h3>
                <p className="text-xs text-gray-500 mt-1">Linked to projects, companies & more</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTodosPanelCollapsed(!todosPanelCollapsed)}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {todosPanelCollapsed ? (
                  <PanelRightOpen className="w-4 h-4" />
                ) : (
                  <PanelRightClose className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          
          <div className={`flex-1 overflow-auto ${todosPanelCollapsed ? 'hidden' : 'p-4'}`}>
            <div className="space-y-3">
              {recentTodos.map((todo) => (
                <div key={todo.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">{todo.task}</h4>
                    <Badge
                      variant={todo.priority === "high" ? "destructive" : todo.priority === "medium" ? "default" : "secondary"}
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {todo.priority}
                    </Badge>
                  </div>

                  {/* Linked Entity Display */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                      {todo.linkedTo.type === 'company' && <Building2 className="w-3 h-3 text-blue-600" />}
                      {todo.linkedTo.type === 'project' && <FolderOpen className="w-3 h-3 text-green-600" />}
                      {todo.linkedTo.type === 'department' && <Users className="w-3 h-3 text-purple-600" />}
                      {todo.linkedTo.type === 'property' && <Home className="w-3 h-3 text-orange-600" />}
                    </div>
                    <span className="text-xs text-gray-600 capitalize">
                      {todo.linkedTo.type}: {todo.linkedTo.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{todo.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className={`${todosPanelCollapsed ? 'hidden' : 'p-4'} border-t border-gray-200`}>
            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
            <Button variant="outline" className="w-full mt-2" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All Tasks
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}