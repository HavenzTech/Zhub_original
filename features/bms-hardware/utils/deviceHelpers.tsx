import {
  Smartphone,
  Tablet,
  Camera,
  Activity,
  Shield,
  Settings,
} from "lucide-react"

export const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A"
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case "online":
      return "bg-green-100 text-green-800"
    case "offline":
      return "bg-gray-100 text-gray-800"
    case "maintenance":
      return "bg-yellow-100 text-yellow-800"
    case "error":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getTypeIcon = (type?: string) => {
  switch (type) {
    case "authenticator-phone":
      return <Smartphone className="w-6 h-6 text-blue-600" />
    case "authenticator-tablet":
      return <Tablet className="w-6 h-6 text-purple-600" />
    case "camera":
      return <Camera className="w-6 h-6 text-green-600" />
    case "sensor":
      return <Activity className="w-6 h-6 text-orange-600" />
    case "access-control":
      return <Shield className="w-6 h-6 text-red-600" />
    default:
      return <Settings className="w-6 h-6 text-gray-600" />
  }
}
