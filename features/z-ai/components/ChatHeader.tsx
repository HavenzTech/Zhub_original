import { Badge } from "@/components/ui/badge"
import { Bot, Shield, Globe } from "lucide-react"

interface ChatHeaderProps {
  aiMode: "internal" | "external"
  onModeChange: (mode: "internal" | "external") => void
}

export function ChatHeader({ aiMode, onModeChange }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Z AI Assistant</h1>
            <p className="text-blue-100">
              Your intelligent companion for Havenz Hub
            </p>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex items-center gap-2">
          <Badge
            variant={aiMode === "internal" ? "default" : "secondary"}
            className={`cursor-pointer ${
              aiMode === "internal"
                ? "bg-white text-blue-600"
                : "bg-blue-700 text-white"
            }`}
            onClick={() => onModeChange("internal")}
          >
            <Shield className="w-3 h-3 mr-1" />
            Internal Z
          </Badge>
          <Badge
            variant={aiMode === "external" ? "default" : "secondary"}
            className={`cursor-pointer ${
              aiMode === "external"
                ? "bg-white text-blue-600"
                : "bg-blue-700 text-white"
            }`}
            onClick={() => onModeChange("external")}
          >
            <Globe className="w-3 h-3 mr-1" />
            External Z
          </Badge>
        </div>
      </div>

      <div className="mt-4 p-3 bg-white/10 rounded-lg">
        <div className="flex items-center gap-2 text-sm">
          {aiMode === "internal" ? (
            <>
              <Shield className="w-4 h-4" />
              <span>
                Internal Mode: Full access to your Havenz Hub data • Secured
                • On-premise processing
              </span>
            </>
          ) : (
            <>
              <Globe className="w-4 h-4" />
              <span>
                External Mode: Connected to public AI • Your data never
                leaves Havenz Hub • Research only
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
