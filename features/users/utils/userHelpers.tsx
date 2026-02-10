/**
 * Get badge color based on user role
 * Role hierarchy: super_admin > admin > dept_manager > project_lead > employee
 */
export const getRoleBadgeColor = (role?: string | null) => {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-400"
    case "admin":
      return "bg-accent-cyan/10 text-accent-cyan"
    case "dept_manager":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
    case "project_lead":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
    case "employee":
      return "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
    default:
      return "bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300"
  }
}

/**
 * Get display label for user role
 */
export const getRoleLabel = (role?: string | null) => {
  switch (role) {
    case "super_admin":
      return "Super Admin"
    case "admin":
      return "Admin"
    case "dept_manager":
      return "Dept Manager"
    case "project_lead":
      return "Project Lead"
    case "employee":
      return "Employee"
    default:
      return role || "Unknown"
  }
}

/**
 * Format date string to readable format
 * Parses date without timezone conversion to prevent day shift
 */
export const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A"

  // Extract date parts directly from ISO string to avoid timezone conversion
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

export const getInitials = (name?: string | null) => {
  if (!name) return "?"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
