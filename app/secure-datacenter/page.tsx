// app/secure-datacenter/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { AccessLog, IotMetric } from "@/types/bms"
import { toast } from "sonner"
import {
  Server,
  Shield,
  Thermometer,
  Activity,
  Eye,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Database,
  Lock,
  Loader2,
  RefreshCw,
  Fingerprint,
  UserCheck,
  XCircle,
  Zap,
  Droplets,
  Wind,
  Wifi
} from 'lucide-react'

export default function SecureDataCenterPage() {
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([])
  const [iotMetrics, setIotMetrics] = useState<IotMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [logsData, metricsData] = await Promise.all([
        bmsApi.accessLogs.getAll(),
        bmsApi.iotMetrics.getAll()
      ])

      setAccessLogs(logsData as AccessLog[])
      setIotMetrics(metricsData as IotMetric[])
      toast.success(`Loaded ${(logsData as AccessLog[]).length} access logs and ${(metricsData as IotMetric[]).length} IoT metrics`)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load datacenter data'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading data:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  const getAccessTypeColor = (type: string) => {
    switch (type) {
      case "entry": return "bg-green-100 text-green-800"
      case "exit": return "bg-blue-100 text-blue-800"
      case "denied": return "bg-red-100 text-red-800"
      case "tailgate": return "bg-orange-100 text-orange-800"
      case "forced": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getVerificationIcon = (method: string) => {
    switch (method) {
      case "facial-recognition": return <Fingerprint className="w-4 h-4" />
      case "RfidCard": return <Shield className="w-4 h-4" />
      case "PinCode": return <Lock className="w-4 h-4" />
      case "QrCode": return <Activity className="w-4 h-4" />
      default: return <UserCheck className="w-4 h-4" />
    }
  }

  const getAlertSeverityColor = (severity?: string) => {
    if (!severity) return "bg-gray-100 text-gray-800"
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800"
      case "warning": return "bg-yellow-100 text-yellow-800"
      case "info": return "bg-blue-100 text-blue-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getMetricIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "temperature": return <Thermometer className="w-5 h-5" />
      case "humidity": return <Droplets className="w-5 h-5" />
      case "power": return <Zap className="w-5 h-5" />
      case "airflow": return <Wind className="w-5 h-5" />
      case "network": return <Wifi className="w-5 h-5" />
      default: return <Gauge className="w-5 h-5" />
    }
  }

  // Calculate statistics
  const stats = {
    totalAccess: accessLogs.length,
    granted: accessLogs.filter(log => log.accessGranted).length,
    denied: accessLogs.filter(log => !log.accessGranted).length,
    anomalies: accessLogs.filter(log => log.anomalyDetected).length,
    totalMetrics: iotMetrics.length,
    alerts: iotMetrics.filter(m => m.alertTriggered).length,
    avgConfidence: accessLogs.length > 0
      ? (accessLogs.reduce((sum, log) => sum + (log.confidenceScore || 0), 0) / accessLogs.length * 100).toFixed(1)
      : 0
  }

  // Group metrics by type
  const metricsByType = iotMetrics.reduce((acc, metric) => {
    if (!acc[metric.metricType]) {
      acc[metric.metricType] = []
    }
    acc[metric.metricType].push(metric)
    return acc
  }, {} as Record<string, IotMetric[]>)

  // Get latest metrics by type
  const latestMetrics = Object.entries(metricsByType).map(([type, metrics]) => {
    const latest = metrics.sort((a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    )[0]
    return { type, ...latest }
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading datacenter monitoring...</h3>
          <p className="text-gray-600">Please wait while we fetch live data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Server className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading datacenter data</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure Datacenter Monitoring</h1>
          <p className="text-gray-600">Real-time access control and environmental monitoring</p>
        </div>
        <Button variant="outline" onClick={loadData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.granted}</div>
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
                <div className="text-2xl font-bold text-gray-900">{stats.denied}</div>
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
                <div className="text-2xl font-bold text-gray-900">{stats.anomalies}</div>
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
                <div className="text-2xl font-bold text-gray-900">{stats.alerts}</div>
                <div className="text-sm text-gray-600">IoT Alerts</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="access-logs">Access Logs ({stats.totalAccess})</TabsTrigger>
          <TabsTrigger value="iot-metrics">IoT Metrics ({stats.totalMetrics})</TabsTrigger>
          <TabsTrigger value="alerts">Alerts ({stats.alerts + stats.anomalies})</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Latest Environmental Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Thermometer className="w-5 h-5" />
                Environmental Conditions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {latestMetrics.slice(0, 4).map((metric, index) => (
                  <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-center mb-2 text-gray-600">
                      {getMetricIcon(metric.metricType)}
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {metric.value.toFixed(2)} {metric.unit}
                    </div>
                    <div className="text-sm text-gray-600 capitalize">{metric.metricType}</div>
                    {metric.alertTriggered && (
                      <Badge className="mt-2 bg-red-100 text-red-800 text-xs">Alert</Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Access Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Recent Access Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        log.accessGranted ? 'bg-green-100' : 'bg-red-100'
                      }`}>
                        {log.accessGranted ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge className={getAccessTypeColor(log.accessType)} className="text-xs capitalize">
                            {log.accessType}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-gray-600">
                            {getVerificationIcon(log.verificationMethod)}
                            {log.verificationMethod}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Confidence: {((log.confidenceScore || 0) * 100).toFixed(1)}%
                          {log.anomalyDetected && (
                            <Badge className="ml-2 bg-orange-100 text-orange-800 text-xs">Anomaly</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500">{formatDate(log.timestamp)}</div>
                      {log.verificationDurationMs && (
                        <div className="text-xs text-gray-400">{log.verificationDurationMs}ms</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Access Logs Tab */}
        <TabsContent value="access-logs" className="space-y-4">
          <div className="relative max-w-md">
            <Input
              placeholder="Search access logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {accessLogs
              .filter(log =>
                !searchTerm ||
                log.accessType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.verificationMethod.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((log) => (
                <Card key={log.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          log.accessGranted ? 'bg-green-100' : 'bg-red-100'
                        }`}>
                          {log.accessGranted ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <XCircle className="w-6 h-6 text-red-600" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getAccessTypeColor(log.accessType)} className="capitalize">
                              {log.accessType}
                            </Badge>
                            <span className="flex items-center gap-1 text-sm text-gray-600">
                              {getVerificationIcon(log.verificationMethod)}
                              {log.verificationMethod}
                            </span>
                            {log.anomalyDetected && (
                              <Badge className="bg-orange-100 text-orange-800">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Anomaly: {log.anomalyType}
                              </Badge>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                            <div>
                              <span className="text-gray-600">Confidence:</span>
                              <span className="ml-1 font-medium">{((log.confidenceScore || 0) * 100).toFixed(1)}%</span>
                            </div>
                            {log.direction && (
                              <div>
                                <span className="text-gray-600">Direction:</span>
                                <span className="ml-1 font-medium capitalize">{log.direction}</span>
                              </div>
                            )}
                            {log.verificationDurationMs && (
                              <div>
                                <span className="text-gray-600">Duration:</span>
                                <span className="ml-1 font-medium">{log.verificationDurationMs}ms</span>
                              </div>
                            )}
                            {log.locationZone && (
                              <div>
                                <span className="text-gray-600">Zone:</span>
                                <span className="ml-1 font-medium">{log.locationZone}</span>
                              </div>
                            )}
                          </div>
                          {!log.accessGranted && log.denialReason && (
                            <div className="mt-2 text-sm text-red-600">
                              Reason: {log.denialReason}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        {/* IoT Metrics Tab */}
        <TabsContent value="iot-metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(metricsByType).map(([type, metrics]) => {
              const latest = metrics[0]
              const avg = metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
              const hasAlerts = metrics.some(m => m.alertTriggered)

              return (
                <Card key={type}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2 capitalize">
                        {getMetricIcon(type)}
                        {type}
                      </span>
                      {hasAlerts && (
                        <Badge className="bg-red-100 text-red-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Alerts
                        </Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                          {latest.value.toFixed(2)} {latest.unit}
                        </div>
                        <div className="text-sm text-gray-600">Current Value</div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Average:</span>
                          <div className="font-medium">{avg.toFixed(2)} {latest.unit}</div>
                        </div>
                        <div>
                          <span className="text-gray-600">Samples:</span>
                          <div className="font-medium">{metrics.length}</div>
                        </div>
                        {latest.thresholdMin !== null && (
                          <div>
                            <span className="text-gray-600">Min Threshold:</span>
                            <div className="font-medium">{latest.thresholdMin} {latest.unit}</div>
                          </div>
                        )}
                        {latest.thresholdMax !== null && (
                          <div>
                            <span className="text-gray-600">Max Threshold:</span>
                            <div className="font-medium">{latest.thresholdMax} {latest.unit}</div>
                          </div>
                        )}
                      </div>
                      {latest.qualityIndicator && (
                        <div className="text-center">
                          <Badge variant="secondary" className="capitalize">
                            Quality: {latest.qualityIndicator}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          {/* IoT Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                IoT Metric Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {iotMetrics
                  .filter(m => m.alertTriggered)
                  .map((metric) => (
                    <div key={metric.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-600" />
                        <div>
                          <div className="font-medium capitalize">{metric.metricType} Alert</div>
                          <div className="text-sm text-gray-600">
                            Value: {metric.value.toFixed(2)} {metric.unit}
                            {metric.alertSeverity && (
                              <Badge className={`ml-2 ${getAlertSeverityColor(metric.alertSeverity)}`}>
                                {metric.alertSeverity}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDate(metric.timestamp)}
                      </div>
                    </div>
                  ))}
                {iotMetrics.filter(m => m.alertTriggered).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    No IoT metric alerts
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Access Anomalies */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Access Anomalies
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs
                  .filter(log => log.anomalyDetected)
                  .map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <div>
                          <div className="font-medium">
                            {log.anomalyType || 'Anomaly Detected'}
                          </div>
                          <div className="text-sm text-gray-600">
                            Access Type: {log.accessType} | Method: {log.verificationMethod}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        {formatDate(log.timestamp)}
                      </div>
                    </div>
                  ))}
                {accessLogs.filter(log => log.anomalyDetected).length === 0 && (
                  <div className="text-center py-6 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    No access anomalies detected
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
