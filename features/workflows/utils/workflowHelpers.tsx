import { CheckCircle, Pause, AlertTriangle, Clock, Workflow } from "lucide-react"

/**
 * Helper functions for workflows page
 * Extracted from app/workflows/page.tsx
 */

/**
 * Get badge color class for workflow status
 */
export const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "error":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get badge color class for workflow type
 */
export const getTypeColor = (type: string) => {
  switch (type) {
    case "automation":
      return "bg-blue-100 text-blue-800"
    case "integration":
      return "bg-purple-100 text-purple-800"
    case "notification":
      return "bg-orange-100 text-orange-800"
    case "data-sync":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get icon for workflow status
 */
export const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "inactive":
      return <Pause className="w-4 h-4 text-gray-600" />
    case "error":
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />
    default:
      return <Workflow className="w-4 h-4 text-gray-600" />
  }
}
