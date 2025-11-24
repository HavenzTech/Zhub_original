import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Workflow,
  Edit,
  Activity,
  Copy,
  Pause,
  Play,
  CheckCircle,
  RefreshCw,
  Timer,
  Calendar,
  GitBranch,
  Zap,
  ArrowRight,
  Settings,
  Code,
  Building2,
} from "lucide-react"
import { getStatusColor, getTypeColor, getStatusIcon } from "../utils/workflowHelpers"

interface WorkflowIntegration {
  id: string
  name: string
  description: string
  type: "automation" | "integration" | "notification" | "data-sync"
  status: "active" | "inactive" | "error" | "pending"
  trigger: {
    type: string
    description: string
  }
  actions: {
    type: string
    description: string
    target: string
  }[]
  integrations: string[]
  lastRun: string
  totalRuns: number
  successRate: number
  companies: string[]
  departments: string[]
  createdBy: string
  createdDate: string
  schedule?: string
  averageRunTime: string
}

interface WorkflowDetailsProps {
  workflow: WorkflowIntegration
  onBack: () => void
}

export function WorkflowDetails({ workflow, onBack }: WorkflowDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          ← Back to Workflows
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Workflow
          </Button>
          <Button variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            View Logs
          </Button>
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Duplicate
          </Button>
          {workflow.status === "active" ? (
            <Button variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          ) : (
            <Button>
              <Play className="w-4 h-4 mr-2" />
              Activate
            </Button>
          )}
        </div>
      </div>

      {/* Workflow Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              <Workflow className="w-10 h-10 text-blue-600" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{workflow.name}</h1>
                {getStatusIcon(workflow.status)}
                <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
                <Badge className={getTypeColor(workflow.type)}>{workflow.type}</Badge>
              </div>

              <p className="text-gray-600 mb-4">{workflow.description}</p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created By:</span>
                  <div className="font-medium">{workflow.createdBy}</div>
                </div>
                <div>
                  <span className="text-gray-600">Created:</span>
                  <div className="font-medium">
                    {new Date(workflow.createdDate).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Schedule:</span>
                  <div className="font-medium">{workflow.schedule}</div>
                </div>
                <div>
                  <span className="text-gray-600">Avg Runtime:</span>
                  <div className="font-medium">{workflow.averageRunTime}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{workflow.successRate}%</div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{workflow.totalRuns}</div>
                <div className="text-sm text-gray-600">Total Runs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Timer className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{workflow.averageRunTime}</div>
                <div className="text-sm text-gray-600">Avg Runtime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{workflow.lastRun}</div>
                <div className="text-sm text-gray-600">Last Run</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            Workflow Flow
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Trigger */}
            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  Trigger: {workflow.trigger.type}
                </div>
                <div className="text-sm text-gray-600">{workflow.trigger.description}</div>
              </div>
              <Badge variant="outline" className="text-xs">
                TRIGGER
              </Badge>
            </div>

            {/* Actions */}
            {workflow.actions.map((action, index) => (
              <div key={index}>
                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border-l-4 border-gray-300">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{action.type}</div>
                    <div className="text-sm text-gray-600">{action.description}</div>
                    <div className="text-xs text-blue-600 mt-1">Target: {action.target}</div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ACTION
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Configuration & Scope */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Integrations Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {workflow.integrations.map((integration, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Code className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="font-medium text-gray-900 flex-1">{integration}</span>
                  <Badge variant="outline" className="text-xs">
                    Connected
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Scope & Coverage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600">Companies:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {workflow.companies.map((company, index) => (
                  <Badge key={index} variant="secondary">
                    {company}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <span className="text-sm font-medium text-gray-600">Departments:</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {workflow.departments.map((dept, index) => (
                  <Badge key={index} variant="secondary">
                    {dept}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Total Runs:</span>
                <span className="font-medium">{workflow.totalRuns}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Success Rate:</span>
                <span className="font-medium text-green-600">{workflow.successRate}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Execution History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                time: "2 hours ago",
                status: "success",
                duration: "1.2s",
                trigger: "Contract uploaded by John Smith",
              },
              {
                time: "6 hours ago",
                status: "success",
                duration: "0.9s",
                trigger: "Contract uploaded by Legal Team",
              },
              {
                time: "1 day ago",
                status: "success",
                duration: "1.5s",
                trigger: "Contract uploaded by Sarah Johnson",
              },
              {
                time: "2 days ago",
                status: "failed",
                duration: "0.3s",
                trigger: "Email service unavailable",
              },
              {
                time: "3 days ago",
                status: "success",
                duration: "1.1s",
                trigger: "Contract uploaded by Mike Chen",
              },
            ].map((run, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div
                  className={`w-3 h-3 rounded-full ${
                    run.status === "success" ? "bg-green-500" : "bg-red-500"
                  }`}
                ></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{run.trigger}</div>
                  <div className="text-xs text-gray-600">Completed in {run.duration}</div>
                </div>
                <div className="text-xs text-gray-500">{run.time}</div>
                <Badge
                  variant={run.status === "success" ? "default" : "destructive"}
                  className="text-xs"
                >
                  {run.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
