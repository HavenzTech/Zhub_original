import { Building2, Square, Home, Factory, Store, Zap, Server } from "lucide-react"

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
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-400"
    case "inactive":
      return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300"
    case "under-construction":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/30 dark:text-amber-400"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/30 dark:text-yellow-400"
    default:
      return "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300"
  }
}

/**
 * Get icon for property type
 */
export const getTypeIcon = (type?: string | null) => {
  switch (type) {
    case "office":
    case "office_building":
      return <Building2 className="w-6 h-6 text-accent-cyan" />
    case "warehouse":
      return <Square className="w-6 h-6 text-amber-600 dark:text-amber-400" />
    case "datacenter":
      return <Server className="w-6 h-6 text-violet-600 dark:text-violet-400" />
    case "residential":
      return <Home className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
    case "industrial":
      return <Factory className="w-6 h-6 text-red-600 dark:text-red-400" />
    case "retail":
      return <Store className="w-6 h-6 text-pink-600 dark:text-pink-400" />
    case "power_plant":
      return <Zap className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
    default:
      return <Building2 className="w-6 h-6 text-accent-cyan" />
  }
}
