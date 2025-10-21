// app/secure-datacenter/page.tsx - Secure On-Site Premises Data Centre
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Server, 
  Shield, 
  Zap, 
  Thermometer,
  Activity,
  Eye,
  Settings,
  TrendingUp,
  BarChart3,
  Clock,
  Users,
  Building2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Gauge,
  Wifi,
  Database,
  HardDrive,
  Cpu,
  MemoryStick,
  Network,
  Lock,
  Camera,
  PlayCircle,
  FileText,
  Calendar,
  Star,
  Award,
  Globe,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react'
import { DataCenterResource, Property } from '../../types'
import { StatsGrid, CompanyLogo } from '../../components/shared/index'

export default function SecureDataCenterPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedResource, setSelectedResource] = useState<string | null>(null)
  const [showVideoFeed, setShowVideoFeed] = useState(false)

  // Data Center Property (Denvr Secure Data Center)
  const dataCenter: Property = {
    id: "PROP-003",
    name: "Denvr Secure Data Center",
    description: "Enterprise-grade secure data center facility with military-grade security, redundant power systems, and advanced environmental controls",
    type: "datacenter",
    status: "active",
    location: {
      address: "890 Data Center Way",
      city: "Edmonton",
      province: "Alberta",
      country: "Canada",
      postalCode: "T6E 2R7",
      coordinates: { lat: 53.5461, lng: -113.4938 }
    },
    specifications: {
      size: {
        totalArea: 45000,
        usableArea: 32000,
        floors: 2
      },
      capacity: {
        employees: 25,
        parkingSpots: 35,
        serverRacks: 485
      },
      utilities: {
        power: {
          capacity: 8500,
          backup: true,
          renewable: true
        },
        cooling: {
          type: "Precision Air Cooling",
          capacity: 750000,
          efficiency: "96.1%"
        },
        connectivity: {
          fiber: true,
          redundant: true,
          bandwidth: "100 Gbps"
        }
      }
    },
    companyIds: ["denvr-dataworks"],
    departmentIds: ["datacenter-ops", "security", "network-engineering"],
    projectIds: ["capacity-expansion", "gpu-cluster-upgrade"],
    financials: {
      currentValue: 15800000,
      monthlyOperatingCosts: 225000,
      insuranceValue: 18500000,
      taxAssessment: 14200000
    },
    security: {
      accessControl: true,
      cameraSystem: true,
      alarmSystem: true,
      securityPersonnel: true,
      bmsIntegrated: true
    },
    certifications: ["SOC 2 Type II", "ISO 27001", "SSAE 18", "HIPAA Compliant", "PCI DSS Level 1"],
    documents: ["security-audit", "compliance-reports", "disaster-recovery"],
    createdDate: "2023-01-10",
    lastUpdated: "2025-01-13"
  }

  // Data Center Resources with pricing tiers
  const resources: DataCenterResource[] = [
    {
      id: "DCR-001",
      name: "NVIDIA H100 GPU Cluster - Premium",
      type: "gpu-hours",
      propertyId: "PROP-003",
      specifications: {
        gpuType: "NVIDIA H100",
        gpuCount: 64,
        memory: 5120,
        storage: 100,
        bandwidth: 25,
        redundancy: "2n"
      },
      pricing: {
        hourly: 3.77,
        currency: "CAD"
      },
      availability: {
        total: 1536,
        allocated: 892,
        available: 534,
        reserved: 110
      },
      performance: {
        utilizationRate: 87.2,
        uptime: 99.97,
        averageLatency: 0.8
      },
      clientAllocations: [
        { companyId: "havenz-tech", allocated: 256, startDate: "2024-11-01", billingRate: 3.77 },
        { companyId: "agritech-haven-intl", allocated: 128, startDate: "2024-12-15", billingRate: 3.50 }
      ],
      createdDate: "2024-10-15",
      lastUpdated: "2025-01-13"
    },
    {
      id: "DCR-002",
      name: "AMD MI300X GPU Cluster - Performance",
      type: "gpu-hours",
      propertyId: "PROP-003",
      specifications: {
        gpuType: "AMD MI300X",
        gpuCount: 128,
        memory: 16384,
        storage: 200,
        bandwidth: 20,
        redundancy: "n+1"
      },
      pricing: {
        hourly: 2.95,
        currency: "CAD"
      },
      availability: {
        total: 3072,
        allocated: 1856,
        available: 1024,
        reserved: 192
      },
      performance: {
        utilizationRate: 79.5,
        uptime: 99.94,
        averageLatency: 1.2
      },
      clientAllocations: [
        { companyId: "energy-haven-lp", allocated: 512, startDate: "2024-10-01", billingRate: 2.95 },
        { companyId: "havenz-smart-communities", allocated: 256, startDate: "2024-11-15", billingRate: 2.75 }
      ],
      createdDate: "2024-09-20",
      lastUpdated: "2025-01-13"
    },
    {
      id: "DCR-003",
      name: "Enterprise Compute Cluster - Standard",
      type: "compute-cluster",
      propertyId: "PROP-003",
      specifications: {
        gpuCount: 32,
        memory: 2048,
        storage: 500,
        bandwidth: 10,
        redundancy: "n+1"
      },
      pricing: {
        monthly: 8500,
        currency: "CAD"
      },
      availability: {
        total: 48,
        allocated: 32,
        available: 14,
        reserved: 2
      },
      performance: {
        utilizationRate: 85.3,
        uptime: 99.92,
        averageLatency: 2.1
      },
      clientAllocations: [
        { companyId: "ahi-management", allocated: 16, startDate: "2024-08-01", billingRate: 8500 }
      ],
      createdDate: "2024-08-01",
      lastUpdated: "2025-01-13"
    },
    {
      id: "DCR-004",
      name: "Wholesale Denvr Module - Enterprise",
      type: "compute-cluster",
      propertyId: "PROP-003",
      specifications: {
        gpuType: "Custom Denvr Architecture",
        gpuCount: 256,
        memory: 32768,
        storage: 2000,
        bandwidth: 100,
        redundancy: "2n"
      },
      pricing: {
        monthly: 45000,
        setup: 15000,
        currency: "CAD"
      },
      availability: {
        total: 12,
        allocated: 8,
        available: 3,
        reserved: 1
      },
      performance: {
        utilizationRate: 92.8,
        uptime: 99.99,
        averageLatency: 0.3
      },
      clientAllocations: [
        { companyId: "energy-haven-lp", allocated: 4, startDate: "2024-06-01", billingRate: 45000 },
        { companyId: "agritech-haven-lp", allocated: 2, startDate: "2024-09-01", billingRate: 42000 }
      ],
      createdDate: "2024-06-01",
      lastUpdated: "2025-01-13"
    }
  ]

  // Real-time metrics simulation
  const liveMetrics = {
    powerUsage: 6420, // kW
    powerCapacity: 8500,
    temperature: 22.5, // °C
    humidity: 45, // %
    activeRacks: 432,
    totalRacks: 485,
    networkThroughput: 78.3, // Gbps
    securityStatus: "SECURE",
    incidentCount: 0,
    maintenanceScheduled: 3
  }

  const ResourceCard = ({ resource }: { resource: DataCenterResource }) => (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        selectedResource === resource.id ? 'ring-2 ring-blue-500' : ''
      }`}
      onClick={() => setSelectedResource(selectedResource === resource.id ? null : resource.id)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              {resource.type === 'gpu-hours' ? (
                <Cpu className="w-6 h-6 text-purple-600" />
              ) : (
                <Server className="w-6 h-6 text-purple-600" />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{resource.name}</CardTitle>
              <p className="text-sm text-gray-600">
                {resource.specifications.gpuCount} × {resource.specifications.gpuType || 'Compute Units'}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              ${resource.pricing.hourly?.toFixed(2) || (resource.pricing.monthly! / 730).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">
              {resource.pricing.hourly ? 'per hour' : 'per hour avg'}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Memory</span>
              <div className="font-semibold">{resource.specifications.memory} GB</div>
            </div>
            <div>
              <span className="text-gray-600">Storage</span>
              <div className="font-semibold">{resource.specifications.storage} TB</div>
            </div>
            <div>
              <span className="text-gray-600">Uptime</span>
              <div className="font-semibold">{resource.performance.uptime}%</div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Capacity Utilization</span>
              <span>{((resource.availability.allocated / resource.availability.total) * 100).toFixed(1)}%</span>
            </div>
            <Progress 
              value={(resource.availability.allocated / resource.availability.total) * 100} 
              className="h-2"
            />
          </div>

          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800">
              {resource.availability.available} Available
            </Badge>
            <Badge variant="outline">
              {resource.specifications.redundancy} Redundancy
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const SecurityFeedCard = () => (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Camera className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Live Security Feed</CardTitle>
              <p className="text-sm text-gray-600">24/7 Monitoring • 127 Cameras Active</p>
            </div>
          </div>
                      <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowVideoFeed(!showVideoFeed)}
          >
            <PlayCircle className="w-4 h-4 mr-2" />
            {showVideoFeed ? 'Hide' : 'View'} Feed
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showVideoFeed ? (
          <div className="space-y-4">
            <div className="bg-black rounded-lg aspect-video flex items-center justify-center">
              <div className="text-white text-center">
                <Camera className="w-12 h-12 mx-auto mb-2 opacity-75" />
                <p className="text-sm">Live Security Feed - Perimeter View</p>
                <p className="text-xs text-gray-400">Encrypted Stream • 4K Resolution</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {['Main Entrance', 'Server Floor A', 'Server Floor B', 'Loading Dock'].map((location, i) => (
                <div key={i} className="bg-gray-900 rounded aspect-video flex items-center justify-center text-white text-xs">
                  {location}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Status</span>
              <Badge className="bg-green-100 text-green-800">ALL SECURE</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Access Points</span>
              <span className="font-semibold">12 Monitored</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Motion Detection</span>
              <Badge className="bg-blue-100 text-blue-800">ACTIVE</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Incident</span>
              <span className="font-semibold">None (47 days)</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )

  const statsData = [
    {
      title: "Total Capacity",
      value: `${resources.reduce((sum, r) => sum + r.availability.total, 0)}`,
      icon: Server,
      color: 'blue' as const,
      subtitle: "compute units"
    },
    {
      title: "Utilization Rate",
      value: `${Math.round(resources.reduce((sum, r) => sum + r.performance.utilizationRate, 0) / resources.length)}%`,
      icon: Gauge,
      color: 'green' as const,
      trend: { value: 5.2, isPositive: true }
    },
    {
      title: "Monthly Revenue",
      value: `${Math.round(resources.reduce((sum, r) => {
        const hourlyRate = r.pricing.hourly || (r.pricing.monthly! / 730);
        return sum + (r.availability.allocated * hourlyRate * 730);
      }, 0) / 1000)}K`,
      icon: DollarSign,
      color: 'purple' as const,
      trend: { value: 18.7, isPositive: true }
    },
    {
      title: "Uptime Average",
      value: `${(resources.reduce((sum, r) => sum + r.performance.uptime, 0) / resources.length).toFixed(2)}%`,
      icon: CheckCircle,
      color: 'orange' as const,
      subtitle: "SLA target: 99.9%"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Secure On-Site Premises Data Centre</h1>
          <p className="text-gray-600">Enterprise-grade secure data center with GPU clusters and wholesale Denvr modules</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Remote Access
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Facility Controls
          </Button>
        </div>
      </div>

      {/* Denvr Dataworks Branding */}
      <Card className="bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <CompanyLogo company="Denvr Dataworks" size="lg" />
              <div>
                <h2 className="text-2xl font-bold mb-2">Denvr Dataworks Secure Facility</h2>
                <p className="text-gray-300 mb-4">Military-grade security • Redundant infrastructure • 24/7 monitoring</p>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Operational</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>ISO 27001 Certified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    <span>100% Uptime SLA</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{dataCenter.specifications.capacity.serverRacks}</div>
              <div className="text-sm text-gray-300">Server Racks</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <StatsGrid stats={statsData} />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gpu-hours">GPU Hours</TabsTrigger>
          <TabsTrigger value="enterprise-clusters">Enterprise Clusters</TabsTrigger>
          <TabsTrigger value="security">Security & Monitoring</TabsTrigger>
          <TabsTrigger value="capacity">Capacity Planning</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Live Metrics Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {liveMetrics.powerUsage.toLocaleString()} kW
                    </div>
                    <div className="text-sm text-gray-600">Power Usage</div>
                    <div className="text-xs text-gray-500">
                      {Math.round((liveMetrics.powerUsage / liveMetrics.powerCapacity) * 100)}% of capacity
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Thermometer className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{liveMetrics.temperature}°C</div>
                    <div className="text-sm text-gray-600">Temperature</div>
                    <div className="text-xs text-green-600">Optimal Range</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Network className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{liveMetrics.networkThroughput} Gbps</div>
                    <div className="text-sm text-gray-600">Network Load</div>
                    <div className="text-xs text-gray-500">Peak: 95.2 Gbps</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Server className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">{liveMetrics.activeRacks}</div>
                    <div className="text-sm text-gray-600">Active Racks</div>
                    <div className="text-xs text-gray-500">of {liveMetrics.totalRacks} total</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Facility Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  Facility Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Area</span>
                    <span className="font-semibold">{dataCenter.specifications.size.totalArea.toLocaleString()} sq ft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Server Floors</span>
                    <span className="font-semibold">{dataCenter.specifications.size.floors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Power Capacity</span>
                    <span className="font-semibold">{dataCenter.specifications.utilities.power.capacity} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Cooling Efficiency</span>
                    <span className="font-semibold">{dataCenter.specifications.utilities.cooling.efficiency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Network Capacity</span>
                    <span className="font-semibold">{dataCenter.specifications.utilities.connectivity.bandwidth}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Redundancy</span>
                    <span className="font-semibold">Tier IV (2N)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <SecurityFeedCard />
          </div>

          {/* Certifications & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications & Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {dataCenter.certifications.map((cert, index) => (
                  <Badge key={index} variant="outline" className="px-3 py-1">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    {cert}
                  </Badge>
                ))}
              </div>
              <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-800">
                  <Shield className="w-4 h-4" />
                  <span className="font-medium">Security Audit Status: PASSED</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Last audit completed January 2025. Next scheduled audit: July 2025.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="gpu-hours" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">GPU-Hour Options</h2>
              <p className="text-gray-600">Flexible GPU computing for smaller users starting at $3.77/hour</p>
            </div>
            <Button>
              <ExternalLink className="w-4 h-4 mr-2" />
              Request Quote
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.filter(r => r.type === 'gpu-hours').map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {selectedResource && (
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader>
                <CardTitle>Resource Details</CardTitle>
              </CardHeader>
              <CardContent>
                {(() => {
                  const resource = resources.find(r => r.id === selectedResource)!;
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Performance Metrics</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Utilization Rate</span>
                            <span className="font-semibold">{resource.performance.utilizationRate}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Average Latency</span>
                            <span className="font-semibold">{resource.performance.averageLatency}ms</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Uptime</span>
                            <span className="font-semibold text-green-600">{resource.performance.uptime}%</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Current Allocations</h4>
                        <div className="space-y-2">
                          {resource.clientAllocations.map((allocation, i) => (
                            <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div className="flex items-center gap-2">
                                <CompanyLogo company={allocation.companyId === 'havenz-tech' ? 'Havenz Tech' : 'Agritech Haven International Inc.'} size="sm" />
                                <span className="text-sm font-medium">{allocation.allocated} units</span>
                              </div>
                              <Badge variant="outline">${allocation.billingRate}/hr</Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="enterprise-clusters" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Enterprise Leasing & Wholesale Denvr Modules</h2>
              <p className="text-gray-600">Dedicated clusters and wholesale options for enterprise customers</p>
            </div>
            <Button>
              <Building2 className="w-4 h-4 mr-2" />
              Enterprise Sales
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.filter(r => r.type === 'compute-cluster').map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* Denvr Modules Showcase */}
          <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Wholesale Denvr Modules</h3>
                  <p className="text-purple-100 mb-4">
                    Custom-designed compute modules with proprietary Denvr architecture for maximum performance
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-bold">256</div>
                      <div className="text-purple-200">GPU Cores</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">32TB</div>
                      <div className="text-purple-200">Memory</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">2PB</div>
                      <div className="text-purple-200">Storage</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold">99.99%</div>
                      <div className="text-purple-200">Uptime SLA</div>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold mb-1">$45K</div>
                  <div className="text-sm text-purple-200">per month</div>
                  <div className="text-xs text-purple-300">Enterprise pricing available</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SecurityFeedCard />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Status
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Threat Level</span>
                    <Badge className="bg-green-100 text-green-800">LOW</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Active Alerts</span>
                    <span className="font-semibold">{liveMetrics.incidentCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Access Attempts</span>
                    <span className="font-semibold">247 (authorized)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Security Personnel</span>
                    <Badge className="bg-blue-100 text-blue-800">ON-SITE</Badge>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600 mb-2">Recent Security Events</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Scheduled maintenance access - Bay 7 (2 hours ago)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Client facility tour completed (6 hours ago)</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Fire suppression system test (1 day ago)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Environmental Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="w-5 h-5" />
                Environmental Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">{liveMetrics.temperature}°C</div>
                  <div className="text-sm text-gray-600 mb-2">Temperature</div>
                  <Progress value={((liveMetrics.temperature - 18) / (26 - 18)) * 100} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Optimal: 18-26°C</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">{liveMetrics.humidity}%</div>
                  <div className="text-sm text-gray-600 mb-2">Humidity</div>
                  <Progress value={liveMetrics.humidity} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Target: 40-55%</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">0.02</div>
                  <div className="text-sm text-gray-600 mb-2">Air Quality (ppm)</div>
                  <Progress value={5} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Excellent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 mb-1">Normal</div>
                  <div className="text-sm text-gray-600 mb-2">Vibration</div>
                  <Progress value={15} className="h-2" />
                  <div className="text-xs text-gray-500 mt-1">Within limits</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="capacity" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Current Capacity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-gray-900 mb-1">
                    {Math.round((resources.reduce((sum, r) => sum + r.availability.allocated, 0) / resources.reduce((sum, r) => sum + r.availability.total, 0)) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Overall Utilization</div>
                </div>
                <Progress value={Math.round((resources.reduce((sum, r) => sum + r.availability.allocated, 0) / resources.reduce((sum, r) => sum + r.availability.total, 0)) * 100)} className="mb-4" />
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Allocated Units</span>
                    <span className="font-semibold">{resources.reduce((sum, r) => sum + r.availability.allocated, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Units</span>
                    <span className="font-semibold">{resources.reduce((sum, r) => sum + r.availability.available, 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Capacity</span>
                    <span className="font-semibold">{resources.reduce((sum, r) => sum + r.availability.total, 0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Projections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Q1 2025 Projection</span>
                      <span>95% capacity</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Q2 2025 Projection</span>
                      <span>105% (expansion needed)</span>
                    </div>
                    <Progress value={100} className="h-2 [&>div]:bg-red-500" />
                  </div>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center gap-2 text-yellow-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium text-sm">Expansion Planning Required</span>
                    </div>
                    <p className="text-yellow-700 text-xs mt-1">
                      Recommend adding 200 additional units by Q2 2025
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Expansion Options
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">Phase 1 Expansion</div>
                    <div className="text-xs text-gray-600 mb-2">Add 100 GPU units</div>
                    <div className="flex justify-between text-sm">
                      <span>Timeline</span>
                      <span className="font-semibold">Q2 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Investment</span>
                      <span className="font-semibold">$2.5M</span>
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm mb-1">Phase 2 Expansion</div>
                    <div className="text-xs text-gray-600 mb-2">New server floor</div>
                    <div className="flex justify-between text-sm">
                      <span>Timeline</span>
                      <span className="font-semibold">Q4 2025</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Investment</span>
                      <span className="font-semibold">$8.5M</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" size="sm">
                    View Expansion Plans
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}