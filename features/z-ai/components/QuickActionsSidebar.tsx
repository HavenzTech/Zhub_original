import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Shield,
  Search,
  TrendingUp,
  Globe,
  AlertTriangle,
  FileText,
} from "lucide-react"
import { getQuickActions, type QuickAction } from "../utils/chatHelpers"

interface QuickActionsSidebarProps {
  onQuickAction: (prompt: string) => void
}

export function QuickActionsSidebar({ onQuickAction }: QuickActionsSidebarProps) {
  const quickActions = getQuickActions()

  return (
    <div className="w-80 bg-gray-50 border-l border-gray-200 p-4">
      <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>

      <div className="space-y-3 mb-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onQuickAction(action.prompt)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-600">{action.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Insights */}
      <div className="mb-6">
        <h4 className="font-medium text-gray-900 mb-3">Recent Insights</h4>
        <div className="space-y-2">
          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-gray-900">
                Revenue Growth
              </span>
            </div>
            <p className="text-xs text-gray-600">
              AHI Red Deer showing 15% increase this quarter
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-3 h-3 text-orange-600" />
              <span className="text-xs font-medium text-gray-900">
                Contract Alert
              </span>
            </div>
            <p className="text-xs text-gray-600">
              3 contracts expiring within 30 days
            </p>
          </div>

          <div className="p-3 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-gray-900">
                Document Activity
              </span>
            </div>
            <p className="text-xs text-gray-600">
              47 new uploads this week across all companies
            </p>
          </div>
        </div>
      </div>

      {/* Z AI Capabilities */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm text-blue-900">
            Z AI Capabilities
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-blue-800 space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3" />
            <span>Encryption-secured processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3" />
            <span>Smart document search</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3" />
            <span>Predictive analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3" />
            <span>External research (secure)</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
