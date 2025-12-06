import { Building2, Square, Home } from "lucide-react"

/**
 * Helper functions for properties page
 * Extracted from app/properties/page.tsx
 */

/**
 * Format currency value in CAD
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
 * Format date string to localized format
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

/**
 * Get badge color class for property status
 */
export const getStatusColor = (status?: string | null) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800"
    case "inactive":
      return "bg-gray-100 text-gray-800"
    case "under-construction":
      return "bg-blue-100 text-blue-800"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

/**
 * Get icon for property type
 */
export const getTypeIcon = (type?: string | null) => {
  switch (type) {
    case "office":
      return <Building2 className="w-6 h-6 text-blue-600" />
    case "warehouse":
      return <Square className="w-6 h-6 text-orange-600" />
    case "datacenter":
      return <Home className="w-6 h-6 text-purple-600" />
    case "industrial":
      return <Building2 className="w-6 h-6 text-red-600" />
    default:
      return <Home className="w-6 h-6 text-gray-600" />
  }
}
