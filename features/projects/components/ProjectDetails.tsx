"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Project } from "@/types/bms";
import {
  FolderOpen,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  Target,
} from "lucide-react";
import {
  formatCurrency,
  formatDate,
  getStatusColor,
  getPriorityColor,
} from "../utils/projectHelpers";

interface ProjectDetailsProps {
  project: Project;
  onBack: () => void;
  onEdit: (project: Project) => void;
}

export function ProjectDetails({
  project,
  onBack,
  onEdit,
}: ProjectDetailsProps) {
  const budgetRemaining =
    (project.budgetAllocated || 0) - (project.budgetSpent || 0);
  const budgetUtilization = project.budgetAllocated
    ? Math.round(((project.budgetSpent || 0) / project.budgetAllocated) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-gray-600 mb-4">{project.description}</p>
              )}

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {project.priority}
                </Badge>
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
                  <div className="font-medium font-mono text-xs">
                    {project.id ? `${project.id.slice(0, 8)}...` : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(project)}>
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
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(project.budgetSpent)}
                </div>
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
                <div className="text-sm font-bold text-gray-900">
                  {formatDate(project.startDate)}
                </div>
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
                <div className="text-lg font-bold text-gray-900">
                  {project.progress}%
                </div>
                <div className="text-sm text-gray-600">Complete</div>
                <div className="text-xs text-gray-500">{project.status}</div>
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
              <Badge variant="secondary" className="font-mono text-xs">
                {project.id ? `${project.id.slice(0, 8)}...` : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company ID</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {project.companyId ? `${project.companyId.slice(0, 8)}...` : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Priority</span>
              <Badge className={getPriorityColor(project.priority)}>
                {project.priority}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium">
                {formatDate(project.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">
                {formatDate(project.updatedAt)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
