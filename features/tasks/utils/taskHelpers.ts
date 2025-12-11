/**
 * Utility functions for task-related operations
 */

/**
 * Get badge color based on task status
 */
export const getTaskStatusColor = (status?: string | null) => {
  switch (status) {
    case "todo":
      return "bg-gray-100 text-gray-800"
    case "in_progress":
      return "bg-blue-100 text-blue-800"
    case "in_review":
      return "bg-purple-100 text-purple-800"
    case "completed":
      return "bg-green-100 text-green-800"
    case "cancelled":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get display label for task status
 */
export const getTaskStatusLabel = (status?: string | null) => {
  switch (status) {
    case "todo":
      return "To Do"
    case "in_progress":
      return "In Progress"
    case "in_review":
      return "In Review"
    case "completed":
      return "Completed"
    case "cancelled":
      return "Cancelled"
    default:
      return status || "Unknown"
  }
}

/**
 * Get badge color based on task priority
 */
export const getTaskPriorityColor = (priority?: string | null) => {
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
 * Get display label for task priority
 */
export const getTaskPriorityLabel = (priority?: string | null) => {
  switch (priority) {
    case "critical":
      return "Critical"
    case "high":
      return "High"
    case "medium":
      return "Medium"
    case "low":
      return "Low"
    default:
      return priority || "None"
  }
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
 * Format date for date input (yyyy-MM-dd format)
 * Extracts the date portion directly from ISO string to prevent timezone shift
 * When backend returns "2025-01-31T00:00:00Z", we want "2025-01-31" not the local equivalent
 */
export const formatDateForInput = (dateString?: string | null) => {
  if (!dateString) return ""

  // If it's already in yyyy-MM-dd format, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString
  }

  // If it's an ISO string with time component, extract just the date part
  // This avoids timezone conversion issues
  if (dateString.includes('T')) {
    return dateString.split('T')[0]
  }

  // Fallback: try to parse and format (for other date formats)
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parse date string to local Date object without timezone shift
 */
const parseLocalDate = (dateString: string): Date => {
  let datePart = dateString
  if (dateString.includes('T')) {
    datePart = dateString.split('T')[0]
  }
  const [year, month, day] = datePart.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/**
 * Check if a task is overdue
 */
export const isOverdue = (dueDate?: string | null, status?: string | null) => {
  if (!dueDate || status === "completed" || status === "cancelled") return false
  const due = parseLocalDate(dueDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return due < today
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 */
export const getRelativeTime = (dateString?: string | null) => {
  if (!dateString) return null

  const date = parseLocalDate(dateString)
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  date.setHours(0, 0, 0, 0)

  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return "Today"
  if (diffDays === 1) return "Tomorrow"
  if (diffDays === -1) return "Yesterday"
  if (diffDays > 0) return `in ${diffDays} days`
  return `${Math.abs(diffDays)} days ago`
}

/**
 * Status options for forms/filters
 */
export const TASK_STATUS_OPTIONS = [
  { value: "todo", label: "To Do" },
  { value: "in_progress", label: "In Progress" },
  { value: "in_review", label: "In Review" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
]

/**
 * Priority options for forms/filters
 */
export const TASK_PRIORITY_OPTIONS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
]
