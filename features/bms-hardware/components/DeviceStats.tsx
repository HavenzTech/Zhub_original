import { Card, CardContent } from "@/components/ui/card"
import { Settings, Activity, Gauge } from "lucide-react"
import type { BmsDevice } from "@/types/bms"

interface DeviceStatsProps {
  devices: BmsDevice[]
}

export function DeviceStats({ devices }: DeviceStatsProps) {
  const onlineCount = devices.filter((d) => d.status === "online").length
  const maintenanceCount = devices.filter(
    (d) => d.status === "maintenance"
  ).length
  const avgUptime =
    devices.length > 0
      ? Math.round(
          devices.reduce((sum, d) => sum + (d.uptimePercentage || 0), 0) /
            devices.length
        )
      : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {devices.length}
              </div>
              <div className="text-sm text-gray-600">Total Devices</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {onlineCount}
              </div>
              <div className="text-sm text-gray-600">Online</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Settings className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {maintenanceCount}
              </div>
              <div className="text-sm text-gray-600">Maintenance</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Gauge className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900">
                {avgUptime}%
              </div>
              <div className="text-sm text-gray-600">Avg Uptime</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
