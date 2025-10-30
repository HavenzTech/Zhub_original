// app/bms-hardware/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { BmsDevice } from "@/types/bms"
import { toast } from "sonner"
import {
  Shield,
  Smartphone,
  Tablet,
  Camera,
  Plus,
  Search,
  Edit,
  Battery,
  Wifi,
  Activity,
  MapPin,
  Building2,
  Settings,
  Loader2,
  RefreshCw,
  Calendar,
  Gauge
} from 'lucide-react'

export default function BMSHardwarePage() {
  const [devices, setDevices] = useState<BmsDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDevice, setSelectedDevice] = useState<BmsDevice | null>(null)

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.bmsDevices.getAll()
      setDevices(data as BmsDevice[])
      toast.success(`Loaded ${(data as BmsDevice[]).length} devices`)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load BMS devices'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading devices:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    device.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-green-100 text-green-800"
      case "offline": return "bg-gray-100 text-gray-800"
      case "maintenance": return "bg-yellow-100 text-yellow-800"
      case "error": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "authenticator-phone": return <Smartphone className="w-6 h-6 text-blue-600" />
      case "authenticator-tablet": return <Tablet className="w-6 h-6 text-purple-600" />
      case "camera": return <Camera className="w-6 h-6 text-green-600" />
      case "sensor": return <Activity className="w-6 h-6 text-orange-600" />
      case "access-control": return <Shield className="w-6 h-6 text-red-600" />
      default: return <Settings className="w-6 h-6 text-gray-600" />
    }
  }

  const DeviceCard = ({ device }: { device: BmsDevice }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDevice(device)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {getTypeIcon(device.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{device.name}</CardTitle>
              {device.manufacturer && (
                <p className="text-sm text-gray-600">{device.manufacturer} {device.model}</p>
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
          <p className="text-sm text-gray-600 mb-4 capitalize">{device.type.replace('-', ' ')}</p>
        )}

        <div className="space-y-3">
          {device.serialNumber && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Serial Number:</span>
              <span className="font-medium font-mono text-xs">{device.serialNumber}</span>
            </div>
          )}

          {device.batteryLevel !== null && device.batteryLevel !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Battery className="w-4 h-4" /> Battery:
              </span>
              <span className="font-medium">{device.batteryLevel}%</span>
            </div>
          )}

          {device.signalStrength !== null && device.signalStrength !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Wifi className="w-4 h-4" /> Signal:
              </span>
              <span className="font-medium">{device.signalStrength}%</span>
            </div>
          )}

          {device.uptimePercentage !== null && device.uptimePercentage !== undefined && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <Gauge className="w-4 h-4" /> Uptime:
              </span>
              <span className="font-medium">{device.uptimePercentage.toFixed(1)}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  const DeviceDetails = ({ device }: { device: BmsDevice }) => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setSelectedDevice(null)}>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{device.name}</h1>
              {device.manufacturer && (
                <p className="text-gray-600 mb-2">{device.manufacturer} {device.model}</p>
              )}

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
                {device.type && <Badge variant="secondary" className="capitalize">{device.type.replace('-', ' ')}</Badge>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                {device.serialNumber && (
                  <div>
                    <span className="text-gray-600">Serial Number:</span>
                    <div className="font-medium font-mono text-xs">{device.serialNumber}</div>
                  </div>
                )}
                {device.macAddress && (
                  <div>
                    <span className="text-gray-600">MAC Address:</span>
                    <div className="font-medium font-mono text-xs">{device.macAddress}</div>
                  </div>
                )}
                {device.ipAddress && (
                  <div>
                    <span className="text-gray-600">IP Address:</span>
                    <div className="font-medium font-mono text-xs">{device.ipAddress}</div>
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
                  {device.batteryLevel ?? 'N/A'}{device.batteryLevel !== null ? '%' : ''}
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
                  {device.signalStrength ?? 'N/A'}{device.signalStrength !== null ? '%' : ''}
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
                  {device.uptimePercentage !== null ? device.uptimePercentage.toFixed(1) + '%' : 'N/A'}
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
                <div className="text-sm font-bold text-gray-900">{formatDate(device.lastHeartbeat)}</div>
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
                <span className="text-sm font-medium">{formatDate(device.installationDate)}</span>
              </div>
            )}
            {device.lastMaintenanceDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Maintenance</span>
                <span className="text-sm font-medium">{formatDate(device.lastMaintenanceDate)}</span>
              </div>
            )}
            {device.warrantyExpiryDate && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Warranty Expires</span>
                <span className="text-sm font-medium">{formatDate(device.warrantyExpiryDate)}</span>
              </div>
            )}
            {device.maintenanceSchedule && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Maintenance Schedule</span>
                <span className="text-sm font-medium">{device.maintenanceSchedule}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading BMS devices...</h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading devices</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDevices}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedDevice ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">BMS Hardware</h1>
              <p className="text-gray-600">Manage building management system devices and equipment</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDevices}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Device
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Settings className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{devices.length}</div>
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
                      {devices.filter(d => d.status === 'online').length}
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
                      {devices.filter(d => d.status === 'maintenance').length}
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
                      {devices.length > 0
                        ? Math.round(devices.reduce((sum, d) => sum + (d.uptimePercentage || 0), 0) / devices.length)
                        : 0}%
                    </div>
                    <div className="text-sm text-gray-600">Avg Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search devices..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredDevices.length} {filteredDevices.length === 1 ? 'device' : 'devices'}
            </Badge>
          </div>

          {/* Devices Grid */}
          {filteredDevices.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDevices.map((device) => (
                <DeviceCard key={device.id} device={device} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No devices found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first device'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Device
              </Button>
            </div>
          )}
        </>
      ) : (
        <DeviceDetails device={selectedDevice} />
      )}
    </div>
  )
}
