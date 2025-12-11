/**
 * Utility functions for project-related operations
 */

/**
 * Format number as Canadian currency
 */
export const formatCurrency = (value?: number | null) => {
  if (value === undefined || value === null) return "N/A"
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format date string to readable format
 * Parses date without timezone conversion to prevent day shift
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A"

  // Extract date parts directly from ISO string to avoid timezone conversion
  // When backend returns "2025-01-31T00:00:00Z", we want "Jan 31, 2025" not the local equivalent
  let datePart = dateString
  if (dateString.includes('T')) {
    datePart = dateString.split('T')[0]
  }

  // Parse as local date (not UTC) by using the date parts directly
  const [year, month, day] = datePart.split('-').map(Number)
  const date = new Date(year, month - 1, day) // month is 0-indexed

  return date.toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Get badge color based on project status
 */
export const getStatusColor = (status?: string | null) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "planning":
      return "bg-blue-100 text-blue-800"
    case "on-hold":
      return "bg-yellow-100 text-yellow-800"
    case "completed":
      return "bg-gray-100 text-gray-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get badge color based on project priority
 */
export const getPriorityColor = (priority?: string | null) => {
  switch (priority) {
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
 * Get badge color based on schedule status
 */
export const getScheduleStatusColor = (scheduleStatus?: string | null) => {
  switch (scheduleStatus) {
    case "ahead":
      return "bg-green-100 text-green-800"
    case "on_track":
      return "bg-yellow-100 text-yellow-800"
    case "behind":
      return "bg-red-100 text-red-800"
    case "unknown":
    default:
      return "bg-gray-100 text-gray-800"
  }
}
