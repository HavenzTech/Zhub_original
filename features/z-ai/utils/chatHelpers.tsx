import { Building2, FileText, TrendingUp, Shield } from "lucide-react"

/**
 * Helper functions for Z-AI chat page
 * Extracted from app/z-ai/page.tsx
 */

export interface QuickAction {
  title: string
  description: string
  icon: any
  prompt: string
}

/**
 * Get quick action presets for chat
 */
export const getQuickActions = (): QuickAction[] => [
  {
    title: "Company Analysis",
    description: "Get insights on company performance",
    icon: Building2,
    prompt: "Analyze the current performance of all companies in my portfolio",
  },
  {
    title: "Document Search",
    description: "Find specific files and documents",
    icon: FileText,
    prompt: "Search for recent financial documents across all companies",
  },
  {
    title: "Trend Analysis",
    description: "Identify patterns and trends",
    icon: TrendingUp,
    prompt: "Show me trending issues or opportunities across my projects",
  },
  {
    title: "Security Audit",
    description: "Review security and compliance",
    icon: Shield,
    prompt: "Run a security audit on recent document uploads and access logs",
  },
]

/**
 * Get relevance score color class
 */
export const getRelevanceScoreColor = (score: number): string => {
  if (score >= 80) return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
  if (score >= 60) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
  return "bg-red-100 text-red-800 dark:bg-red-950/30 dark:text-red-400"
}

/**
 * Format timestamp for messages
 */
export const formatMessageTimestamp = (): string => {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })
}

/**
 * Generate session ID for user
 */
export const generateSessionId = (userEmail: string): string => {
  const date = new Date().toISOString().split("T")[0]
  return `session_${userEmail}_${date}`
}

/**
 * Get message role display name
 */
export const getMessageRoleName = (role: "internal-z" | "external-z" | "user"): string => {
  if (role === "user") return "You"
  if (role === "internal-z") return "Z AI (Internal)"
  return "Z AI (External)"
}

/**
 * Get message role color class
 */
export const getMessageRoleColor = (role: "internal-z" | "external-z" | "user"): string => {
  if (role === "user") return "text-stone-600 dark:text-stone-400"
  if (role === "internal-z") return "text-accent-cyan"
  return "text-violet-600 dark:text-violet-400"
}

/**
 * Get message avatar background class
 */
export const getMessageAvatarBg = (role: "internal-z" | "external-z" | "user"): string => {
  if (role === "user") return "bg-stone-200 dark:bg-stone-700"
  if (role === "internal-z") return "bg-accent-cyan"
  return "bg-violet-600 dark:bg-violet-500"
}

/**
 * Get message content background class
 */
export const getMessageContentBg = (role: "internal-z" | "external-z" | "user"): string => {
  if (role === "user") return "bg-stone-50 border-stone-200 dark:bg-stone-800/50 dark:border-stone-700"
  return "bg-white border-stone-200 dark:bg-stone-800/50 dark:border-stone-700"
}
