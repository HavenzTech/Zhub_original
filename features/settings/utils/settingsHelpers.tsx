/**
 * Helper functions for settings page
 * Extracted from app/settings/page.tsx
 */

/**
 * Get badge color class for security level
 */
export const getLevelColor = (level: string) => {
  switch (level) {
    case "critical":
      return "bg-red-100 text-red-800"
    case "high":
      return "bg-orange-100 text-orange-800"
    case "medium":
      return "bg-yellow-100 text-yellow-800"
    case "low":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get badge color class for integration status
 */
export const getIntegrationStatusColor = (status: string) => {
  switch (status) {
    case "connected":
      return "bg-green-100 text-green-800"
    case "disconnected":
      return "bg-gray-100 text-gray-800"
    case "error":
      return "bg-red-100 text-red-800"
    case "pending":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}
