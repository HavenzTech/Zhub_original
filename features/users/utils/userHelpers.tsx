export const getRoleBadgeColor = (role?: string) => {
  switch (role) {
    case "super_admin":
      return "bg-purple-100 text-purple-800"
    case "admin":
      return "bg-blue-100 text-blue-800"
    case "member":
      return "bg-green-100 text-green-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getRoleLabel = (role?: string) => {
  switch (role) {
    case "super_admin":
      return "Super Admin"
    case "admin":
      return "Admin"
    case "member":
      return "Member"
    default:
      return "Unknown"
  }
}

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}
