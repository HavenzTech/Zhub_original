import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Building2,
  Users,
  FolderOpen,
  Home,
  DollarSign,
} from "lucide-react"
import type { Company, Department, Project, Property } from "@/types/bms"

interface MetricCardsProps {
  companies: Company[]
  departments: Department[]
  projects: Project[]
  properties: Property[]
}

export function MetricCards({
  companies,
  departments,
  projects,
  properties,
}: MetricCardsProps) {
  const totalBudget = (
    departments.reduce((sum, dept) => sum + (dept.budgetAllocated || 0), 0) /
    1000000
  ).toFixed(1)

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <Card className="bg-white border border-gray-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Total Companies
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-gray-900">
            {companies.length}
          </div>
          <div className="text-xs text-green-600">
            All stakeholder entities
          </div>
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
          <div className="text-2xl font-bold text-gray-900">
            {departments.length}
          </div>
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
          <div className="text-2xl font-bold text-gray-900">
            {projects.length}
          </div>
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
          <div className="text-2xl font-bold text-gray-900">
            {properties.length}
          </div>
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
            ${totalBudget}M
          </div>
          <div className="text-xs text-green-600">Department budgets</div>
        </CardContent>
      </Card>
    </div>
  )
}
