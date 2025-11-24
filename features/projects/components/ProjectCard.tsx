import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { FolderOpen } from "lucide-react"
import type { Project } from "@/types/bms"
import {
  getStatusColor,
  getPriorityColor,
  formatCurrency,
  formatDate,
} from "../utils/projectHelpers"

interface ProjectCardProps {
  project: Project
  onViewDetails: (project: Project) => void
}

export function ProjectCard({ project, onViewDetails }: ProjectCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onViewDetails(project)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{project.name}</CardTitle>
              {project.teamLead && (
                <p className="text-sm text-gray-600">
                  Led by {project.teamLead}
                </p>
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
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {project.description}
          </p>
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
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(project.budgetAllocated)}
            </div>
            <div className="text-xs text-gray-600">Budget</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(project.budgetSpent)}
            </div>
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
}
