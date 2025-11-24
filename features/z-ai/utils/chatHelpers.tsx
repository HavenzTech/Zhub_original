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
  if (score >= 80) return "bg-green-100 text-green-800"
  if (score >= 60) return "bg-yellow-100 text-yellow-800"
  return "bg-red-100 text-red-800"
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
  if (role === "user") return "text-gray-600"
  if (role === "internal-z") return "text-blue-600"
  return "text-purple-600"
}

/**
 * Get message avatar background class
 */
export const getMessageAvatarBg = (role: "internal-z" | "external-z" | "user"): string => {
  if (role === "user") return "bg-gray-200"
  if (role === "internal-z") return "bg-blue-600"
  return "bg-purple-600"
}

/**
 * Get message content background class
 */
export const getMessageContentBg = (role: "internal-z" | "external-z" | "user"): string => {
  if (role === "user") return "bg-gray-50 border-gray-200"
  return "bg-blue-50 border-blue-200"
}
