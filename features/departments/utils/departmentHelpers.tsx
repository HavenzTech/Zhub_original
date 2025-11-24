/**
 * Utility functions for department-related operations
 */

/**
 * Format number as Canadian currency
 */
export const formatCurrency = (value?: number) => {
  if (!value) return "N/A"
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

/**
 * Format date string to readable format
 */
export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Get relative time string (e.g., "2 hours ago", "3 days ago")
 */
export const getTimeAgo = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInHours / 24)

  if (diffInHours < 1) return "Just now"
  if (diffInHours < 24) return `${diffInHours} hours ago`
  if (diffInDays === 1) return "1 day ago"
  return `${diffInDays} days ago`
}

/**
 * Calculate budget utilization percentage
 */
export const getBudgetUtilization = (allocated?: number, spent?: number) => {
  if (!allocated || !spent) return 0
  return Math.round((spent / allocated) * 100)
}
