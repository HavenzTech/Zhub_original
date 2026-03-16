import { useState, useEffect } from "react"
import { Bot } from "lucide-react"
import { cn } from "@/lib/utils"
import { getMessageAvatarBg } from "../utils/chatHelpers"

const PHASES = [
  { text: "Processing request", minDuration: 3000 },
  { text: "Finalizing response", minDuration: 0 },
]

export function TypingIndicator() {
  const [phaseIndex, setPhaseIndex] = useState(0)

  useEffect(() => {
    setPhaseIndex(0)
  }, [])

  useEffect(() => {
    const phase = PHASES[phaseIndex]
    if (!phase || phaseIndex >= PHASES.length - 1) return

    const timer = setTimeout(() => {
      setPhaseIndex((prev) => prev + 1)
    }, phase.minDuration)

    return () => clearTimeout(timer)
  }, [phaseIndex])

  return (
    <div className="flex gap-4 animate-fade-in">
      {/* Avatar */}
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
          getMessageAvatarBg("internal-z")
        )}
      >
        <Bot className="w-5 h-5 text-white" />
      </div>

      {/* Content */}
      <div className="flex-1 max-w-[80%]">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-accent-cyan">
            Z AI
          </span>
        </div>

        <div className="p-4 rounded-lg border bg-white border-stone-200 dark:bg-stone-800/50 dark:border-stone-700">
          <div className="flex items-center gap-3">
            {/* Animated dots */}
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-typing-dot-1" />
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-typing-dot-2" />
              <span className="w-2 h-2 rounded-full bg-accent-cyan animate-typing-dot-3" />
            </div>

            {/* Phase text */}
            <span className="text-sm text-stone-500 dark:text-stone-400 transition-opacity duration-300">
              {PHASES[phaseIndex].text}...
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
