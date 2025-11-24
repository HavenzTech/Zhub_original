import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Edit,
  Battery,
  Wifi,
  Gauge,
  Calendar,
  Settings,
} from "lucide-react"
import type { BmsDevice } from "@/types/bms"
import { formatDate, getStatusColor, getTypeIcon } from "../utils/deviceHelpers"

interface DeviceDetailsProps {
  device: BmsDevice
  onBack: () => void
}

export function DeviceDetails({ device, onBack }: DeviceDetailsProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        ← Back to Devices
      </Button>

      {/* Device Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              {getTypeIcon(device.type)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {device.name}
              </h1>
              {device.manufacturer && (
                <p className="text-gray-600 mb-2">
                  {device.manufacturer} {device.model}
                </p>
              )}

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(device.status)}>
                  {device.status}
                </Badge>
                {device.type && (
                  <Badge variant="secondary" className="capitalize">
                    {device.type.replace("-", " ")}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {device.serialNumber && (
                  <div>
                    <span className="text-gray-600">Serial Number:</span>
                    <div className="font-medium font-mono text-xs">
                      {device.serialNumber}
                    </div>
                  </div>
                )}
                {device.macAddress && (
                  <div>
                    <span className="text-gray-600">MAC Address:</span>
                    <div className="font-medium font-mono text-xs">
                      {device.macAddress}
                    </div>
                  </div>
                )}
                {device.ipAddress && (
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <div className="font-medium font-mono text-xs">
                      {device.ipAddress}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Device Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Battery className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {device.batteryLevel ?? "N/A"}
                  {device.batteryLevel !== null ? "%" : ""}
                </div>
                <div className="text-sm text-gray-600">Battery Level</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Wifi className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {device.signalStrength ?? "N/A"}
                  {device.signalStrength !== null ? "%" : ""}
                </div>
                <div className="text-sm text-gray-600">Signal Strength</div>
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
                <div className="text-lg font-bold text-gray-900">
                  {/* {device.uptimePercentage !== null ? device.uptimePercentage.toFixed(1) + '%' : 'N/A'} */}
                </div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-gray-900">
                  {formatDate(device.lastHeartbeat)}
                </div>
                <div className="text-sm text-gray-600">Last Heartbeat</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Device Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Device Specifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {device.firmwareVersion && (
              <div>
                <span className="text-sm text-gray-600">Firmware Version:</span>
                <div className="font-medium">{device.firmwareVersion}</div>
              </div>
            )}
            {device.locationZone && (
              <div>
                <span className="text-sm text-gray-600">Location Zone:</span>
                <div className="font-medium">{device.locationZone}</div>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-600">Device ID:</span>
              <div className="font-medium font-mono text-xs">{device.id}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Maintenance & Warranty
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {device.installationDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Installed</span>
                <span className="text-sm font-medium">
                  {formatDate(device.installationDate)}
                </span>
              </div>
            )}
            {device.lastMaintenanceDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Maintenance</span>
                <span className="text-sm font-medium">
                  {formatDate(device.lastMaintenanceDate)}
                </span>
              </div>
            )}
            {device.warrantyExpiryDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warranty Expires</span>
                <span className="text-sm font-medium">
                  {formatDate(device.warrantyExpiryDate)}
                </span>
              </div>
            )}
            {device.maintenanceSchedule && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Maintenance Schedule
                </span>
                <span className="text-sm font-medium">
                  {device.maintenanceSchedule}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
