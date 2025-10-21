// app/properties/page.tsx - NEW 4th Category: Properties Management
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Home, 
  Plus, 
  Search, 
  Eye, 
  Edit, 
  MoreHorizontal,
  MapPin,
  Building2,
  Zap,
  Thermometer,
  Shield,
  Users,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
  Share,
  Settings,
  Camera,
  Lock,
  Wifi,
  Server,
  Gauge,
  Activity
} from 'lucide-react'
import { Property, BMSDevice, DataCenterResource } from '../../types'
import { EntityCard, StatsGrid, SearchAndFilter, EmptyState } from '../../components/shared/index'

export default function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  // Sample Properties Data - Including CHP as first property
  const properties: Property[] = [
    {
      id: "PROP-001",
      name: "CHP Combined Heat & Power Facility",
      description: "Primary combined heat and power facility featuring advanced cogeneration systems and renewable energy integration",
      type: "industrial",
      status: "active",
      location: {
        address: "1234 Industrial Park Drive",
        city: "Red Deer",
        province: "Alberta",
        country: "Canada",
        postalCode: "T4N 6V7",
        coordinates: { lat: 52.2681, lng: -113.8112 }
      },
      specifications: {
        size: {
          totalArea: 125000,
          usableArea: 98000,
          floors: 3
        },
        capacity: {
          employees: 45,
          parkingSpots: 60,
          serverRacks: 12
        },
        utilities: {
          power: {
            capacity: 15000,
            backup: true,
            renewable: true
          },
          cooling: {
            type: "Chilled Water System",
            capacity: 500000,
            efficiency: "94.2%"
          },
          connectivity: {
            fiber: true,
            redundant: true,
            bandwidth: "10 Gbps"
          }
        }
      },
      companyIds: ["agritech-haven-lp", "energy-haven-lp"],
      departmentIds: ["operations", "engineering", "maintenance"],
      projectIds: ["renewable-integration", "efficiency-upgrade"],
      financials: {
        currentValue: 12500000,
        monthlyOperatingCosts: 185000,
        insuranceValue: 15000000,
        taxAssessment: 11200000
      },
      security: {
        accessControl: true,
        cameraSystem: true,
        alarmSystem: true,
        securityPersonnel: true,
        bmsIntegrated: true
      },
      certifications: ["ISO 14001", "LEED Gold", "CHP Efficiency Standard"],
      documents: ["facility-blueprint", "safety-protocols", "maintenance-schedules"],
      createdDate: "2023-03-15",
      lastUpdated: "2025-01-10"
    },
    {
      id: "PROP-002", 
      name: "Havenz Tech Innovation Center",
      description: "Modern technology hub with advanced development labs, collaborative spaces, and integrated smart building systems",
      type: "office",
      status: "active",
      location: {
        address: "567 Innovation Boulevard",
        city: "Calgary",
        province: "Alberta", 
        country: "Canada",
        postalCode: "T2P 3M4",
        coordinates: { lat: 51.0447, lng: -114.0719 }
      },
      specifications: {
        size: {
          totalArea: 85000,
          usableArea: 72000,
          floors: 4
        },
        capacity: {
          employees: 180,
          parkingSpots: 120
        },
        utilities: {
          power: {
            capacity: 2500,
            backup: true,
            renewable: false
          },
          cooling: {
            type: "VRF System",
            capacity: 180000,
            efficiency: "92.8%"
          },
          connectivity: {
            fiber: true,
            redundant: true,
            bandwidth: "5 Gbps"
          }
        }
      },
      companyIds: ["havenz-tech", "havenz-smart-communities"],
      departmentIds: ["development", "design", "product-management"],
      projectIds: ["mobile-app-dev", "ai-integration"],
      financials: {
        currentValue: 8200000,
        monthlyOperatingCosts: 95000,
        insuranceValue: 9500000,
        taxAssessment: 7800000
      },
      security: {
        accessControl: true,
        cameraSystem: true,
        alarmSystem: true,
        securityPersonnel: false,
        bmsIntegrated: true
      },
      certifications: ["LEED Platinum", "BOMA BEST Gold"],
      documents: ["building-specs", "lease-agreement", "it-infrastructure"],
      createdDate: "2023-06-20",
      lastUpdated: "2025-01-08"
    },
    {
      id: "PROP-003",
      name: "Denvr Secure Data Center",
      description: "Enterprise-grade data center facility with redundant power, advanced cooling, and military-grade security systems",
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
      certifications: ["SOC 2 Type II", "ISO 27001", "SSAE 18", "HIPAA Compliant"],
      documents: ["security-audit", "compliance-reports", "disaster-recovery"],
      createdDate: "2023-01-10",
      lastUpdated: "2025-01-12"
    }
  ]

  // Sample BMS Devices Data
  const bmsDevices: BMSDevice[] = [
    {
      id: "BMS-001",
      name: "Main Entrance Authenticator",
      type: "authenticator-tablet",
      manufacturer: "samsung",
      model: "Galaxy Tab Active4 Pro BMS",
      propertyId: "PROP-001",
      location: { floor: 1, room: "Main Lobby", coordinates: { x: 10, y: 15 } },
      status: "online",
      specifications: {
        connectivity: "wifi",
        powerSource: "wired",
        operatingTemp: { min: -10, max: 50 },
        ipRating: "IP65"
      },
      capabilities: ["facial-recognition", "access-control", "visitor-management", "temperature-screening"],
      configuration: { timeout: 300, maxFailedAttempts: 3, alertThreshold: 5 },
      maintenance: {
        lastService: "2024-12-15",
        nextService: "2025-03-15", 
        warrantyExpires: "2026-01-10",
        serviceProvider: "Havenz Tech Services"
      },
      performance: {
        uptime: 99.8,
        lastOnline: "2025-01-13 09:15:00",
        signalStrength: 92
      },
      createdDate: "2024-01-10",
      lastUpdated: "2025-01-13"
    },
    {
      id: "BMS-002",
      name: "Data Center Perimeter Camera 01", 
      type: "camera",
      manufacturer: "avigilon",
      model: "H5A-H-DO1-IR",
      propertyId: "PROP-003",
      location: { floor: 1, room: "North Perimeter", coordinates: { x: 45, y: 78 } },
      status: "online",
      specifications: {
        connectivity: "ethernet",
        powerSource: "wired",
        operatingTemp: { min: -40, max: 55 },
        ipRating: "IP67"
      },
      capabilities: ["4k-recording", "night-vision", "motion-detection", "facial-recognition", "analytics"],
      configuration: { resolution: "4K", frameRate: 30, nightVision: true },
      maintenance: {
        lastService: "2024-11-20",
        nextService: "2025-05-20",
        warrantyExpires: "2025-12-01", 
        serviceProvider: "Avigilon Certified Installer"
      },
      performance: {
        uptime: 99.95,
        lastOnline: "2025-01-13 09:20:00"
      },
      createdDate: "2023-12-01",
      lastUpdated: "2025-01-13"
    }
  ]

  // Sample Data Center Resources
  const dataCenterResources: DataCenterResource[] = [
    {
      id: "DCR-001",
      name: "NVIDIA H100 GPU Cluster",
      type: "gpu-hours",
      propertyId: "PROP-003",
      specifications: {
        gpuType: "NVIDIA H100",
        gpuCount: 64,
        memory: 5120,
        storage: 100,
        bandwidth: 25,
        redundancy: "n+1"
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
        {
          companyId: "havenz-tech",
          allocated: 256,
          startDate: "2024-11-01",
          billingRate: 3.77
        },
        {
          companyId: "agritech-haven-intl",
          allocated: 128,
          startDate: "2024-12-15",
          billingRate: 3.50
        }
      ],
      createdDate: "2024-10-15",
      lastUpdated: "2025-01-13"
    }
  ]

  const filteredProperties = properties.filter(property => {
    const matchesSearch = property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         property.location.city.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (selectedFilter === "all") return matchesSearch
    return matchesSearch && property.type === selectedFilter
  })

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'office': return Building2
      case 'datacenter': return Server
      case 'industrial': return Gauge
      case 'warehouse': return Home
      default: return Home
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'under-construction': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const PropertyCard = ({ property }: { property: Property }) => {
    const TypeIcon = getTypeIcon(property.type)
    
    return (
      <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProperty(property)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TypeIcon className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <CardTitle className="text-lg">{property.name}</CardTitle>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {property.location.city}, {property.location.province}
                </p>
              </div>
            </div>
            <Badge className={getStatusColor(property.status)}>
              {property.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
          
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                {(property.specifications.size.totalArea / 1000).toFixed(1)}K
              </div>
              <div className="text-gray-600">Sq Ft</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">{property.companyIds.length}</div>
              <div className="text-gray-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="font-semibold text-gray-900">
                ${(property.financials.currentValue / 1000000).toFixed(1)}M
              </div>
              <div className="text-gray-600">Value</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {property.security.bmsIntegrated && <Shield className="w-4 h-4 text-green-600" />}
              {property.specifications.utilities.connectivity.fiber && <Wifi className="w-4 h-4 text-blue-600" />}
              {property.specifications.utilities.power.renewable && <Zap className="w-4 h-4 text-yellow-600" />}
            </div>
            <div className="text-xs text-gray-500">
              {property.certifications.length} certifications
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const PropertyDetails = ({ property }: { property: Property }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedProperty(null)}>
          ← Back to Properties
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit Property
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Manage BMS
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="bms">BMS & Security</TabsTrigger>
          <TabsTrigger value="datacenter">Data Center</TabsTrigger>
          <TabsTrigger value="financials">Financials</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Property Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Home className="w-10 h-10 text-orange-600" />
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">{property.name}</h1>
                    <Badge className={getStatusColor(property.status)}>
                      {property.status}
                    </Badge>
                  </div>
                  
                  <p className="text-gray-600 mb-4">{property.description}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <div className="font-medium capitalize">{property.type}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Area:</span>
                      <div className="font-medium">{property.specifications.size.totalArea.toLocaleString()} sq ft</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Companies:</span>
                      <div className="font-medium">{property.companyIds.length}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Projects:</span>
                      <div className="font-medium">{property.projectIds.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {property.specifications.utilities.power.capacity}kW
                    </div>
                    <div className="text-sm text-gray-600">Power Capacity</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {property.specifications.capacity.employees}
                    </div>
                    <div className="text-sm text-gray-600">Employee Capacity</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      ${(property.financials.monthlyOperatingCosts / 1000).toFixed(0)}K
                    </div>
                    <div className="text-sm text-gray-600">Monthly OpEx</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="specifications" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  Space Specifications
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Total Area</span>
                    <div className="font-semibold">{property.specifications.size.totalArea.toLocaleString()} sq ft</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Usable Area</span>
                    <div className="font-semibold">{property.specifications.size.usableArea.toLocaleString()} sq ft</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Floors</span>
                    <div className="font-semibold">{property.specifications.size.floors}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Parking</span>
                    <div className="font-semibold">{property.specifications.capacity.parkingSpots} spots</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Power & Utilities
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Power Capacity</span>
                    <span className="font-semibold">{property.specifications.utilities.power.capacity} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Backup Power</span>
                    <Badge variant={property.specifications.utilities.power.backup ? "default" : "secondary"}>
                      {property.specifications.utilities.power.backup ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Renewable Energy</span>
                    <Badge variant={property.specifications.utilities.power.renewable ? "default" : "secondary"}>
                      {property.specifications.utilities.power.renewable ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cooling Efficiency</span>
                    <span className="font-semibold">{property.specifications.utilities.cooling.efficiency}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wifi className="w-5 h-5" />
                  Connectivity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Fiber Connection</span>
                    <Badge variant={property.specifications.utilities.connectivity.fiber ? "default" : "secondary"}>
                      {property.specifications.utilities.connectivity.fiber ? "Available" : "Not Available"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Redundancy</span>
                    <Badge variant={property.specifications.utilities.connectivity.redundant ? "default" : "secondary"}>
                      {property.specifications.utilities.connectivity.redundant ? "Redundant" : "Single Path"}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bandwidth</span>
                    <span className="font-semibold">{property.specifications.utilities.connectivity.bandwidth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Certifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {property.certifications.map((cert, index) => (
                    <Badge key={index} variant="outline">
                      {cert}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Building Management System Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    property.security.accessControl ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Lock className={`w-6 h-6 ${property.security.accessControl ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-sm font-medium">Access Control</div>
                  <div className="text-xs text-gray-600">
                    {property.security.accessControl ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    property.security.cameraSystem ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Camera className={`w-6 h-6 ${property.security.cameraSystem ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-sm font-medium">CCTV System</div>
                  <div className="text-xs text-gray-600">
                    {property.security.cameraSystem ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    property.security.alarmSystem ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <AlertTriangle className={`w-6 h-6 ${property.security.alarmSystem ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-sm font-medium">Alarm System</div>
                  <div className="text-xs text-gray-600">
                    {property.security.alarmSystem ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    property.security.securityPersonnel ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Users className={`w-6 h-6 ${property.security.securityPersonnel ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-sm font-medium">Security Staff</div>
                  <div className="text-xs text-gray-600">
                    {property.security.securityPersonnel ? 'On-Site' : 'None'}
                  </div>
                </div>

                <div className="text-center">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2 ${
                    property.security.bmsIntegrated ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Settings className={`w-6 h-6 ${property.security.bmsIntegrated ? 'text-green-600' : 'text-gray-400'}`} />
                  </div>
                  <div className="text-sm font-medium">BMS Integration</div>
                  <div className="text-xs text-gray-600">
                    {property.security.bmsIntegrated ? 'Integrated' : 'Standalone'}
                  </div>
                </div>
              </div>

              {/* BMS Devices */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Connected Devices</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Device
                  </Button>
                </div>

                {bmsDevices
                  .filter(device => device.propertyId === property.id)
                  .map((device) => (
                    <Card key={device.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                              device.status === 'online' ? 'bg-green-100' : 'bg-red-100'
                            }`}>
                              {device.type === 'camera' && <Camera className={`w-5 h-5 ${device.status === 'online' ? 'text-green-600' : 'text-red-600'}`} />}
                              {device.type.includes('authenticator') && <Lock className={`w-5 h-5 ${device.status === 'online' ? 'text-green-600' : 'text-red-600'}`} />}
                              {device.type === 'sensor' && <Activity className={`w-5 h-5 ${device.status === 'online' ? 'text-green-600' : 'text-red-600'}`} />}
                            </div>
                            <div>
                              <div className="font-medium">{device.name}</div>
                              <div className="text-sm text-gray-600">
                                {device.manufacturer} {device.model} • {device.location.room}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={device.status === 'online' ? 'default' : 'destructive'}>
                              {device.status}
                            </Badge>
                            <div className="text-sm text-gray-600 mt-1">
                              Uptime: {device.performance.uptime}%
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="datacenter" className="space-y-6">
          {property.type === 'datacenter' ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Server className="w-5 h-5" />
                    Data Center Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {property.specifications.capacity.serverRacks}
                      </div>
                      <div className="text-sm text-gray-600">Server Racks</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {property.specifications.utilities.connectivity.bandwidth}
                      </div>
                      <div className="text-sm text-gray-600">Bandwidth</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {property.specifications.utilities.cooling.efficiency}
                      </div>
                      <div className="text-sm text-gray-600">Cooling Efficiency</div>
                    </div>
                  </div>

                  {/* GPU Resources */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Available Resources</h3>
                    {dataCenterResources
                      .filter(resource => resource.propertyId === property.id)
                      .map((resource) => (
                        <Card key={resource.id} className="border-l-4 border-l-purple-500">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <div className="font-semibold text-lg">{resource.name}</div>
                                <div className="text-sm text-gray-600">
                                  {resource.specifications.gpuCount} × {resource.specifications.gpuType}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-2xl font-bold text-purple-600">
                                  ${resource.pricing.hourly}
                                </div>
                                <div className="text-sm text-gray-600">per hour</div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div>
                                <span className="text-sm text-gray-600">Memory</span>
                                <div className="font-semibold">{resource.specifications.memory} GB</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Storage</span>
                                <div className="font-semibold">{resource.specifications.storage} TB</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Utilization</span>
                                <div className="font-semibold">{resource.performance.utilizationRate}%</div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Uptime</span>
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
                              <div className="flex justify-between text-xs text-gray-600">
                                <span>Allocated: {resource.availability.allocated}</span>
                                <span>Available: {resource.availability.available}</span>
                                <span>Total: {resource.availability.total}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="text-center py-12">
              <Server className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Not a Data Center</h3>
              <p className="text-gray-600">This property type doesn't have data center resources.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="financials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Property Valuation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Value</span>
                    <span className="font-semibold">${property.financials.currentValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Insurance Value</span>
                    <span className="font-semibold">${property.financials.insuranceValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tax Assessment</span>
                    <span className="font-semibold">${property.financials.taxAssessment.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Operating Costs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Monthly Operating</span>
                    <span className="font-semibold">${property.financials.monthlyOperatingCosts.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Annual Operating</span>
                    <span className="font-semibold">${(property.financials.monthlyOperatingCosts * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Cost per Sq Ft</span>
                    <span className="font-semibold">
                      ${((property.financials.monthlyOperatingCosts * 12) / property.specifications.size.totalArea).toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )

  if (selectedProperty) {
    return <PropertyDetails property={selectedProperty} />
  }

  const statsData = [
    {
      title: "Total Properties",
      value: properties.length,
      icon: Home,
      color: 'orange' as const,
      trend: { value: 12.5, isPositive: true }
    },
    {
      title: "Total Value",
      value: `${(properties.reduce((sum, p) => sum + p.financials.currentValue, 0) / 1000000).toFixed(1)}M`,
      icon: DollarSign,
      color: 'green' as const,
      trend: { value: 8.2, isPositive: true }
    },
    {
      title: "Monthly OpEx",
      value: `${(properties.reduce((sum, p) => sum + p.financials.monthlyOperatingCosts, 0) / 1000).toFixed(0)}K`,
      icon: TrendingUp,
      color: 'blue' as const,
      trend: { value: 3.1, isPositive: false }
    },
    {
      title: "BMS Integrated",
      value: properties.filter(p => p.security.bmsIntegrated).length,
      icon: Shield,
      color: 'purple' as const,
      subtitle: `of ${properties.length} properties`
    }
  ]

  const filterOptions = [
    { key: 'all', label: 'All Properties', value: 'all' },
    { key: 'office', label: 'Office', value: 'office' },
    { key: 'datacenter', label: 'Data Center', value: 'datacenter' },
    { key: 'industrial', label: 'Industrial', value: 'industrial' },
    { key: 'warehouse', label: 'Warehouse', value: 'warehouse' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="text-gray-600">Manage physical assets, facilities, and real estate across your organization</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Stats Grid */}
      <StatsGrid stats={statsData} />

      {/* Search and Filter */}
      <SearchAndFilter
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        filterValue={selectedFilter}
        onFilterChange={setSelectedFilter}
        filterOptions={filterOptions}
        placeholder="Search properties..."
        showExport={true}
        onExport={() => console.log('Export properties')}
      />

      {/* Properties Grid */}
      {filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Home}
          title="No properties found"
          description="No properties match your search criteria. Try adjusting your filters or add a new property."
          actionLabel="Add First Property"
          onAction={() => console.log('Add property')}
        />
      )}
    </div>
  )
}