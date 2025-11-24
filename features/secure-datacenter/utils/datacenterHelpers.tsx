import {
  Fingerprint,
  Shield,
  Lock,
  Activity,
  UserCheck,
  Thermometer,
  Droplets,
  Zap,
  Wind,
  Wifi,
  Gauge,
} from "lucide-react"

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export const getAccessTypeColor = (type: string) => {
  switch (type) {
    case "entry":
      return "bg-green-100 text-green-800"
    case "exit":
      return "bg-blue-100 text-blue-800"
    case "denied":
      return "bg-red-100 text-red-800"
    case "tailgate":
      return "bg-orange-100 text-orange-800"
    case "forced":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getVerificationIcon = (method: string) => {
  switch (method) {
    case "facial-recognition":
      return <Fingerprint className="w-4 h-4" />
    case "RfidCard":
      return <Shield className="w-4 h-4" />
    case "PinCode":
      return <Lock className="w-4 h-4" />
    case "QrCode":
      return <Activity className="w-4 h-4" />
    default:
      return <UserCheck className="w-4 h-4" />
  }
}

export const getAlertSeverityColor = (severity?: string) => {
  if (!severity) return "bg-gray-100 text-gray-800"
  switch (severity) {
    case "critical":
      return "bg-red-100 text-red-800"
    case "warning":
      return "bg-yellow-100 text-yellow-800"
    case "info":
      return "bg-blue-100 text-blue-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

export const getMetricIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case "temperature":
      return <Thermometer className="w-5 h-5" />
    case "humidity":
      return <Droplets className="w-5 h-5" />
    case "power":
      return <Zap className="w-5 h-5" />
    case "airflow":
      return <Wind className="w-5 h-5" />
    case "network":
      return <Wifi className="w-5 h-5" />
    default:
      return <Gauge className="w-5 h-5" />
  }
}
