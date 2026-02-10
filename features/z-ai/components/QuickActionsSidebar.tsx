import {
  Shield,
  Search,
  TrendingUp,
  Globe,
} from "lucide-react"
import { getQuickActions, type QuickAction } from "../utils/chatHelpers"

interface QuickActionsSidebarProps {
  onQuickAction: (prompt: string) => void
}

export function QuickActionsSidebar({ onQuickAction }: QuickActionsSidebarProps) {
  const quickActions = getQuickActions()

  return (
    <div className="w-80 bg-white dark:bg-stone-900 border-l border-stone-200 dark:border-stone-700 p-4 overflow-y-auto">
      <h3 className="font-semibold text-stone-900 dark:text-stone-50 mb-4">Quick Actions</h3>

      <div className="space-y-3 mb-6">
        {quickActions.map((action, index) => (
          <div
            key={index}
            className="cursor-pointer bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-accent-cyan/40 hover:shadow-md transition-all"
            onClick={() => onQuickAction(action.prompt)}
          >
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-accent-cyan/10 rounded-lg flex items-center justify-center">
                  <action.icon className="w-4 h-4 text-accent-cyan" />
                </div>
                <div>
                  <h4 className="font-medium text-stone-900 dark:text-stone-50 text-sm">
                    {action.title}
                  </h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400">{action.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Z AI Capabilities */}
      <div className="bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
          <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
            Z AI Capabilities
          </h4>
        </div>
        <div className="p-4 text-xs text-stone-600 dark:text-stone-400 space-y-2.5">
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-accent-cyan" />
            <span>Encryption-secured processing</span>
          </div>
          <div className="flex items-center gap-2">
            <Search className="w-3 h-3 text-accent-cyan" />
            <span>Smart document search</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-3 h-3 text-accent-cyan" />
            <span>Predictive analytics</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="w-3 h-3 text-accent-cyan" />
            <span>External research (secure)</span>
          </div>
        </div>
      </div>
    </div>
  )
}
