import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Workflow } from "lucide-react"
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

interface WorkflowCardProps {
  workflow: WorkflowIntegration
  onClick: (workflow: WorkflowIntegration) => void
}

export function WorkflowCard({ workflow, onClick }: WorkflowCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(workflow)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Workflow className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{workflow.name}</CardTitle>
              <p className="text-sm text-gray-600">{workflow.trigger.type} trigger</p>
            </div>
          </div>
          <div className="flex gap-2">
            {getStatusIcon(workflow.status)}
            <Badge className={getStatusColor(workflow.status)}>{workflow.status}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{workflow.description}</p>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={getTypeColor(workflow.type)}>{workflow.type}</Badge>
            <span className="text-sm text-gray-600">{workflow.totalRuns} runs</span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Success Rate:</span>
              <div className="font-medium text-green-600">{workflow.successRate}%</div>
            </div>
            <div>
              <span className="text-gray-600">Last Run:</span>
              <div className="font-medium">{workflow.lastRun}</div>
            </div>
          </div>

          <div>
            <span className="text-xs text-gray-600">Integrations:</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {workflow.integrations.slice(0, 3).map((integration, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {integration}
                </Badge>
              ))}
              {workflow.integrations.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{workflow.integrations.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
