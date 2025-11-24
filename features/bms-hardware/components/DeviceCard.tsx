import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Battery, Wifi, Gauge } from "lucide-react"
import type { BmsDevice } from "@/types/bms"
import { getStatusColor, getTypeIcon } from "../utils/deviceHelpers"

interface DeviceCardProps {
  device: BmsDevice
  onViewDetails: (device: BmsDevice) => void
}

export function DeviceCard({ device, onViewDetails }: DeviceCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onViewDetails(device)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {getTypeIcon(device.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              {device.manufacturer && (
                <p className="text-sm text-gray-600">
                  {device.manufacturer} {device.model}
                </p>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(device.status)}>
            {device.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {device.type && (
          <p className="text-sm text-gray-600 mb-4 capitalize">
            {device.type.replace("-", " ")}
          </p>
        )}

        <div className="space-y-3">
          {device.serialNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Serial Number:</span>
              <span className="font-medium font-mono text-xs">
                {device.serialNumber}
              </span>
            </div>
          )}

          {device.batteryLevel !== null &&
            device.batteryLevel !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Battery className="w-4 h-4" /> Battery:
                </span>
                <span className="font-medium">{device.batteryLevel}%</span>
              </div>
            )}

          {device.signalStrength !== null &&
            device.signalStrength !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Wifi className="w-4 h-4" /> Signal:
                </span>
                <span className="font-medium">{device.signalStrength}%</span>
              </div>
            )}

          {device.uptimePercentage !== null &&
            device.uptimePercentage !== undefined && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600 flex items-center gap-1">
                  <Gauge className="w-4 h-4" /> Uptime:
                </span>
                <span className="font-medium">
                  {device.uptimePercentage.toFixed(1)}%
                </span>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
