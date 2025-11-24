import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Users } from "lucide-react"
import type { Department } from "@/types/bms"
import {
  formatCurrency,
  getTimeAgo,
  getBudgetUtilization,
} from "../utils/departmentHelpers"

interface DepartmentCardProps {
  department: Department
  onViewDetails: (department: Department) => void
}

export function DepartmentCard({ department, onViewDetails }: DepartmentCardProps) {
  const utilization = getBudgetUtilization(department.budgetAllocated, department.budgetSpent)

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onViewDetails(department)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{department.name}</CardTitle>
              {department.headName && (
                <p className="text-sm text-gray-600">Led by {department.headName}</p>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {department.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{department.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(department.budgetAllocated)}
            </div>
            <div className="text-xs text-gray-600">Budget Allocated</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{utilization}%</div>
            <div className="text-xs text-gray-600">Utilized</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Budget Spent:</span>
            <span className="font-medium">{formatCurrency(department.budgetSpent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Remaining:</span>
            <span className="font-medium text-green-600">
              {formatCurrency((department.budgetAllocated || 0) - (department.budgetSpent || 0))}
            </span>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Updated: {getTimeAgo(department.updatedAt)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
