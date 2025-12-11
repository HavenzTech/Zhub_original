/**
 * Get badge color based on user role
 * Role hierarchy: super_admin > admin > dept_manager > project_lead > employee
 */
export const getRoleBadgeColor = (role?: string | null) => {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-800"
    case "admin":
      return "bg-blue-100 text-blue-800"
    case "dept_manager":
      return "bg-teal-100 text-teal-800"
    case "project_lead":
      return "bg-green-100 text-green-800"
    case "employee":
      return "bg-gray-100 text-gray-800"
    default:
      return "bg-gray-100 text-gray-800"
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
