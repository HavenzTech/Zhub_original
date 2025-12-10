import { Card, CardContent } from "@/components/ui/card"
import {
  Building2,
  Users,
  FolderOpen,
  Home,
  DollarSign,
  UserCircle,
} from "lucide-react"
import type { Company, Department, Project, Property, User } from "@/types/bms"

interface MetricCardsProps {
  companies: Company[]
  departments: Department[]
  projects: Project[]
  properties: Property[]
  users: User[]
}

export function MetricCards({
  companies,
  departments,
  projects,
  properties,
  users,
}: MetricCardsProps) {
  const totalBudget = (
    departments.reduce((sum, dept) => sum + (dept.budgetAllocated || 0), 0) /
    1000000
  ).toFixed(1)

  const metrics = [
    {
      label: "Total Companies",
      value: companies.length,
      subtitle: "All stakeholder entities",
      icon: Building2,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      subtitleColor: "text-green-600",
    },
    {
      label: "Departments",
      value: departments.length,
      subtitle: "Across all companies",
      icon: Users,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      subtitleColor: "text-blue-600",
    },
    {
      label: "Active Projects",
      value: projects.length,
      subtitle: "Portfolio-wide",
      icon: FolderOpen,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      subtitleColor: "text-purple-600",
    },
    {
      label: "Properties",
      value: properties.length,
      subtitle: "Physical assets",
      icon: Home,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      subtitleColor: "text-orange-600",
    },
    {
      label: "Total Budget",
      value: `$${totalBudget}M`,
      subtitle: "Department budgets",
      icon: DollarSign,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      subtitleColor: "text-green-600",
    },
    {
      label: "Total Users",
      value: users.length,
      subtitle: "Registered users",
      icon: UserCircle,
      iconBg: "bg-indigo-100",
      iconColor: "text-indigo-600",
      subtitleColor: "text-indigo-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.label} className="bg-white border border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${metric.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${metric.iconColor}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-gray-500 truncate">{metric.label}</p>
                  <p className="text-2xl font-bold text-gray-900 truncate">
                    {metric.value}
                  </p>
                </div>
              </div>
              <p className={`text-xs ${metric.subtitleColor} mt-2 truncate`}>
                {metric.subtitle}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
