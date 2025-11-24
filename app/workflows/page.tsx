// app/workflows/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Workflow,
  Plus,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  Play,
  Pause,
  Settings,
  Zap,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  FileText,
  Building2,
  Phone,
  Mail,
  Database,
  Cloud,
  Code,
  Bell,
  Filter,
  Download,
  Share,
  GitBranch,
  Timer,
  Activity,
  Calendar,
  Target,
  ArrowRight,
  Copy,
  Trash2,
  BarChart3,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { WorkflowCard } from "@/features/workflows/components/WorkflowCard";
import { WorkflowDetails } from "@/features/workflows/components/WorkflowDetails";

interface WorkflowIntegration {
  id: string;
  name: string;
  description: string;
  type: "automation" | "integration" | "notification" | "data-sync";
  status: "active" | "inactive" | "error" | "pending";
  trigger: {
    type: string;
    description: string;
  };
  actions: {
    type: string;
    description: string;
    target: string;
  }[];
  integrations: string[];
  lastRun: string;
  totalRuns: number;
  successRate: number;
  companies: string[];
  departments: string[];
  createdBy: string;
  createdDate: string;
  schedule?: string;
  averageRunTime: string;
}

export default function WorkflowsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowIntegration | null>(null);

  const workflows: WorkflowIntegration[] = [
    {
      id: "WF-001",
      name: "Contract Upload Notification",
      description:
        "Automatically notify Legal Department and create tasks when new contracts are uploaded",
      type: "automation",
      status: "active",
      trigger: {
        type: "Document Upload",
        description:
          "When a document with 'contract' tag is uploaded to Legal folder",
      },
      actions: [
        {
          type: "Send Email",
          description: "Notify Legal Department",
          target: "legal@havenz.com",
        },
        {
          type: "Create Task",
          description: "Review new contract",
          target: "Legal Department",
        },
        {
          type: "Update Dashboard",
          description: "Add to pending contracts list",
          target: "Legal Dashboard",
        },
      ],
      integrations: ["Document Control", "Email System", "Task Management"],
      lastRun: "2 hours ago",
      totalRuns: 156,
      successRate: 98.7,
      companies: ["AHI Red Deer", "Havenz Tech"],
      departments: ["Legal", "Operations"],
      createdBy: "Jennifer Lee",
      createdDate: "2024-11-15",
      schedule: "Event-triggered",
      averageRunTime: "1.2s",
    },
    {
      id: "WF-002",
      name: "QuickBooks Financial Sync",
      description:
        "Synchronize financial data from QuickBooks to company dashboards and generate reports",
      type: "data-sync",
      status: "active",
      trigger: {
        type: "Scheduled",
        description: "Every day at 6:00 AM",
      },
      actions: [
        {
          type: "Data Sync",
          description: "Import financial data",
          target: "QuickBooks API",
        },
        {
          type: "Update KPIs",
          description: "Refresh company metrics",
          target: "Company Dashboards",
        },
        {
          type: "Generate Report",
          description: "Create daily financial summary",
          target: "Finance Department",
        },
      ],
      integrations: ["QuickBooks", "Company Dashboards", "Finance Module"],
      lastRun: "6 hours ago",
      totalRuns: 89,
      successRate: 95.5,
      companies: ["AHI Red Deer", "Havenz Tech", "Denvr Dataworks"],
      departments: ["Finance", "Management"],
      createdBy: "Robert Martinez",
      createdDate: "2024-12-01",
      schedule: "Daily at 6:00 AM",
      averageRunTime: "45s",
    },
    {
      id: "WF-003",
      name: "Project Deadline Alerts",
      description:
        "Send alerts and escalate when project milestones are approaching or overdue",
      type: "notification",
      status: "active",
      trigger: {
        type: "Time-based",
        description: "Check milestones every 4 hours",
      },
      actions: [
        {
          type: "Send Alert",
          description: "Notify project lead",
          target: "Project Managers",
        },
        {
          type: "Create Escalation",
          description: "Alert department head if overdue",
          target: "Department Heads",
        },
        {
          type: "Update Status",
          description: "Mark milestone as at-risk",
          target: "Project Dashboard",
        },
      ],
      integrations: ["Project Management", "Email System", "SMS Gateway"],
      lastRun: "30 minutes ago",
      totalRuns: 234,
      successRate: 99.1,
      companies: ["AHI Red Deer", "Havenz Tech", "Denvr Dataworks"],
      departments: ["IT", "Operations", "Management"],
      createdBy: "Sarah Johnson",
      createdDate: "2024-10-20",
      schedule: "Every 4 hours",
      averageRunTime: "3.4s",
    },
    {
      id: "WF-004",
      name: "Security Audit Automation",
      description:
        "Automated security audits and compliance reporting for document access and system usage",
      type: "automation",
      status: "active",
      trigger: {
        type: "Scheduled",
        description: "Weekly on Sundays at 2:00 AM",
      },
      actions: [
        {
          type: "Scan Systems",
          description: "Audit document access logs",
          target: "Encrypted Security",
        },
        {
          type: "Generate Report",
          description: "Create compliance report",
          target: "Security Team",
        },
        {
          type: "Flag Issues",
          description: "Identify security risks",
          target: "Management Dashboard",
        },
      ],
      integrations: [
        "Encrypted Security",
        "Document Control",
        "Compliance Module",
      ],
      lastRun: "2 days ago",
      totalRuns: 12,
      successRate: 100,
      companies: ["AHI Red Deer", "Havenz Tech", "Denvr Dataworks"],
      departments: ["Security", "IT", "Legal"],
      createdBy: "Security Team",
      createdDate: "2025-01-05",
      schedule: "Weekly (Sunday 2:00 AM)",
      averageRunTime: "2m 15s",
    },
    {
      id: "WF-005",
      name: "Customer Service Integration",
      description:
        "Route customer inquiries to appropriate departments and track resolution",
      type: "integration",
      status: "error",
      trigger: {
        type: "API Call",
        description: "When new support ticket is created",
      },
      actions: [
        {
          type: "Route Ticket",
          description: "Assign to appropriate team",
          target: "Support Teams",
        },
        {
          type: "Send Confirmation",
          description: "Notify customer",
          target: "Customer Email",
        },
        {
          type: "Track Progress",
          description: "Monitor resolution time",
          target: "Service Dashboard",
        },
      ],
      integrations: ["HubSpot CRM", "Email System", "Customer Service"],
      lastRun: "1 day ago",
      totalRuns: 78,
      successRate: 87.2,
      companies: ["Havenz Tech"],
      departments: ["Customer Service", "Technical Support"],
      createdBy: "Alex Chen",
      createdDate: "2024-12-10",
      schedule: "Event-triggered",
      averageRunTime: "2.8s",
    },
    {
      id: "WF-006",
      name: "Budget Threshold Monitoring",
      description:
        "Monitor company budgets and send alerts when thresholds are exceeded",
      type: "notification",
      status: "active",
      trigger: {
        type: "Data Change",
        description: "When budget utilization exceeds 80%",
      },
      actions: [
        {
          type: "Send Alert",
          description: "Notify finance team",
          target: "Finance Department",
        },
        {
          type: "Create Report",
          description: "Generate budget analysis",
          target: "Management",
        },
        {
          type: "Log Event",
          description: "Record threshold breach",
          target: "Audit System",
        },
      ],
      integrations: ["QuickBooks", "Email System", "Finance Dashboard"],
      lastRun: "5 hours ago",
      totalRuns: 23,
      successRate: 95.7,
      companies: ["AHI Red Deer", "Denvr Dataworks"],
      departments: ["Finance", "Management"],
      createdBy: "Robert Martinez",
      createdDate: "2024-12-20",
      schedule: "Real-time monitoring",
      averageRunTime: "0.8s",
    },
  ];

  const availableIntegrations = [
    {
      name: "QuickBooks",
      icon: Database,
      status: "connected",
      type: "Finance",
      description: "Financial data synchronization",
    },
    {
      name: "HubSpot CRM",
      icon: Users,
      status: "connected",
      type: "Customer Management",
      description: "Customer relationship management",
    },
    {
      name: "Encrypted Security",
      icon: Settings,
      status: "connected",
      type: "Security",
      description: "Hardware security platform",
    },
    {
      name: "Email System",
      icon: Mail,
      status: "connected",
      type: "Communication",
      description: "SMTP email services",
    },
    {
      name: "SMS Gateway",
      icon: Phone,
      status: "connected",
      type: "Communication",
      description: "SMS messaging service",
    },
    {
      name: "Telus IoT",
      icon: Cloud,
      status: "available",
      type: "IoT & Sensors",
      description: "IoT device monitoring",
    },
    {
      name: "Avigilon Security",
      icon: Eye,
      status: "available",
      type: "Video Security",
      description: "Video surveillance system",
    },
    {
      name: "Basecamp",
      icon: GitBranch,
      status: "available",
      type: "Project Management",
      description: "Project collaboration platform",
    },
    {
      name: "Trello",
      icon: CheckCircle,
      status: "available",
      type: "Task Management",
      description: "Visual task boards",
    },
    {
      name: "Jira",
      icon: Code,
      status: "available",
      type: "Development",
      description: "Issue and project tracking",
    },
  ];

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.integrations.some((integration) =>
        integration.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      selectedFilter === "all" ||
      workflow.status === selectedFilter ||
      workflow.type === selectedFilter;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {!selectedWorkflow ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Workflows & Integrations
              </h1>
              <p className="text-gray-600">
                Automate processes and connect systems across your organization
              </p>
            </div>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Workflow
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {workflows.reduce((sum, w) => sum + w.totalRuns, 0)}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total Executions
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {
                        availableIntegrations.filter(
                          (i) => i.status === "connected"
                        ).length
                      }
                    </div>
                    <div className="text-sm text-gray-600">
                      Connected Integrations
                    </div>
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
                placeholder="Search workflows..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              {[
                "all",
                "active",
                "inactive",
                "error",
                "automation",
                "integration",
              ].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Workflows List */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Active Workflows
              </h3>
              <div className="grid grid-cols-1 gap-4">
                {filteredWorkflows.map((workflow) => (
                  <WorkflowCard
                    key={workflow.id}
                    workflow={workflow}
                    onClick={setSelectedWorkflow}
                  />
                ))}
              </div>

              {filteredWorkflows.length === 0 && (
                <div className="text-center py-12">
                  <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No workflows found
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Try adjusting your search criteria or create a new workflow
                  </p>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Workflow
                  </Button>
                </div>
              )}
            </div>

            {/* Available Integrations Sidebar */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Available Integrations
              </h3>
              <Card>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {availableIntegrations.map((integration, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                          <integration.icon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-gray-900 text-sm">
                            {integration.name}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {integration.description}
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <Badge
                            variant={
                              integration.status === "connected"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs mb-1"
                          >
                            {integration.status}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {integration.type}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full" size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Integration
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Workflow Templates */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Workflow Templates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      {
                        name: "Document Approval",
                        description:
                          "Automate document review and approval process",
                        type: "automation",
                      },
                      {
                        name: "Employee Onboarding",
                        description: "Streamline new employee setup",
                        type: "automation",
                      },
                      {
                        name: "Invoice Processing",
                        description: "Automated invoice handling and payments",
                        type: "data-sync",
                      },
                      {
                        name: "Incident Response",
                        description:
                          "Security incident notification and escalation",
                        type: "notification",
                      },
                    ].map((template, index) => (
                      <div
                        key={index}
                        className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <div className="font-medium text-gray-900 text-sm mb-1">
                          {template.name}
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          {template.description}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {template.type}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full" size="sm">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Browse All Templates
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">System Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Overall Success Rate
                      </span>
                      <span className="font-medium text-green-600">96.8%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Avg Execution Time
                      </span>
                      <span className="font-medium">2.1s</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">
                        Executions Today
                      </span>
                      <span className="font-medium">47</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <span className="font-medium text-red-600">3.2%</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <Button variant="outline" className="w-full" size="sm">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Detailed Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <WorkflowDetails
          workflow={selectedWorkflow}
          onBack={() => setSelectedWorkflow(null)}
        />
      )}
    </div>
  );
}
