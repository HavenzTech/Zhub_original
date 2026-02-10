import { Bot, Shield, Globe } from "lucide-react"

interface ChatHeaderProps {
  aiMode: "internal" | "external"
  onModeChange: (mode: "internal" | "external") => void
}

export function ChatHeader({ aiMode, onModeChange }: ChatHeaderProps) {
  return (
    <div className="bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700 p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-accent-cyan/10 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-accent-cyan" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Z AI Assistant</h1>
            <p className="text-stone-500 dark:text-stone-400">
              Your intelligent companion for Havenz Hub
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-1 rounded-lg border border-stone-200 dark:border-stone-700 p-1">
          <button
            onClick={() => onModeChange("internal")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              aiMode === "internal"
                ? "bg-accent-cyan text-white"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            <Shield className="w-3 h-3" />
            Internal Z
          </button>
          <button
            onClick={() => onModeChange("external")}
            className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              aiMode === "external"
                ? "bg-accent-cyan text-white"
                : "text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800"
            }`}
          >
            <Globe className="w-3 h-3" />
            External Z
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-stone-50 dark:bg-stone-800/50 rounded-lg border border-stone-200 dark:border-stone-700">
        <div className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-400">
          {aiMode === "internal" ? (
            <>
              <Shield className="w-4 h-4 text-accent-cyan" />
              <span>
                Internal Mode: Full access to your Havenz Hub data &bull; Secured
                &bull; On-premise processing
              </span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span>
                External Mode: Connected to public AI &bull; Your data never
                leaves Havenz Hub &bull; Research only
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
