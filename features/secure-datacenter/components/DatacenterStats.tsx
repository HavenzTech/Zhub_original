import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, XCircle, AlertTriangle, Activity } from "lucide-react"

interface DatacenterStatsProps {
  stats: {
    granted: number
    denied: number
    anomalies: number
    alerts: number
  }
}

export function DatacenterStats({ stats }: DatacenterStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.granted}
              </div>
              <div className="text-sm text-gray-600">Access Granted</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.denied}
              </div>
              <div className="text-sm text-gray-600">Access Denied</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.anomalies}
              </div>
              <div className="text-sm text-gray-600">Anomalies</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.alerts}
              </div>
              <div className="text-sm text-gray-600">IoT Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
