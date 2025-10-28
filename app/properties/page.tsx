// app/properties/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { Property } from "@/types/bms"
import { toast } from "sonner"
import {
  Home,
  Plus,
  Search,
  Edit,
  MapPin,
  Building2,
  DollarSign,
  Calendar,
  TrendingUp,
  Loader2,
  RefreshCw,
  Square
} from 'lucide-react'

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  useEffect(() => {
    loadProperties()
  }, [])

  const loadProperties = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.properties.getAll()
      setProperties(data as Property[])
      toast.success(`Loaded ${(data as Property[]).length} properties`)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load properties'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading properties:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredProperties = properties.filter(property =>
    property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    property.locationCity?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatCurrency = (value?: number) => {
    if (!value) return "N/A"
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "under-construction": return "bg-blue-100 text-blue-800"
      case "maintenance": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case "office": return <Building2 className="w-6 h-6 text-blue-600" />
      case "warehouse": return <Square className="w-6 h-6 text-orange-600" />
      case "datacenter": return <Home className="w-6 h-6 text-purple-600" />
      case "industrial": return <Building2 className="w-6 h-6 text-red-600" />
      default: return <Home className="w-6 h-6 text-gray-600" />
    }
  }

  const PropertyCard = ({ property }: { property: Property }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedProperty(property)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              {getTypeIcon(property.type)}
            </div>
            <div>
              <CardTitle className="text-lg">{property.name}</CardTitle>
              {property.type && (
                <p className="text-sm text-gray-600 capitalize">{property.type}</p>
              )}
            </div>
          </div>
          <Badge className={getStatusColor(property.status)}>
            {property.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {property.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {property.sizeTotalArea ? `${property.sizeTotalArea.toLocaleString()} sq ft` : 'N/A'}
            </div>
            <div className="text-xs text-gray-600">Total Area</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(property.currentValue)}
            </div>
            <div className="text-xs text-gray-600">Value</div>
          </div>
        </div>

        <div className="space-y-2">
          {(property.locationCity || property.locationProvince) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4" />
              {[property.locationCity, property.locationProvince].filter(Boolean).join(', ')}
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Operating Costs:</span>
            <span className="font-medium">{formatCurrency(property.monthlyOperatingCosts)}/mo</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const PropertyDetails = ({ property }: { property: Property }) => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setSelectedProperty(null)}>
        ← Back to Properties
      </Button>

      {/* Property Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              {getTypeIcon(property.type)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{property.name}</h1>
              {property.description && (
                <p className="text-gray-600 mb-4">{property.description}</p>
              )}

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                {property.type && <Badge variant="secondary" className="capitalize">{property.type}</Badge>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Total Area:</span>
                  <div className="font-medium">
                    {property.sizeTotalArea ? `${property.sizeTotalArea.toLocaleString()} sq ft` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Floors:</span>
                  <div className="font-medium">{property.sizeFloors || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">Property ID:</span>
                  <div className="font-medium font-mono text-xs">{property.id.slice(0, 8)}...</div>
                </div>
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(property.currentValue)}
                </div>
                <div className="text-sm text-gray-600">Current Value</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {formatCurrency(property.monthlyOperatingCosts)}
                </div>
                <div className="text-sm text-gray-600">Monthly Costs</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Square className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {property.sizeTotalArea ? property.sizeTotalArea.toLocaleString() : 'N/A'}
                </div>
                <div className="text-sm text-gray-600">Total Sq Ft</div>
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
                <div className="text-sm font-bold text-gray-900">{formatDate(property.createdAt)}</div>
                <div className="text-sm text-gray-600">Created</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Location & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {property.locationAddress && (
              <div>
                <span className="text-sm text-gray-600">Address:</span>
                <div className="font-medium">{property.locationAddress}</div>
              </div>
            )}
            <div>
              <span className="text-sm text-gray-600">City:</span>
              <div className="font-medium">{property.locationCity || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Province:</span>
              <div className="font-medium">{property.locationProvince || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-gray-600">Country:</span>
              <div className="font-medium">{property.locationCountry || 'N/A'}</div>
            </div>
            {property.locationPostalCode && (
              <div>
                <span className="text-sm text-gray-600">Postal Code:</span>
                <div className="font-medium">{property.locationPostalCode}</div>
              </div>
            )}
            {(property.locationLatitude && property.locationLongitude) && (
              <div>
                <span className="text-sm text-gray-600">Coordinates:</span>
                <div className="font-medium font-mono text-xs">
                  {property.locationLatitude.toFixed(6)}, {property.locationLongitude.toFixed(6)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Property ID</span>
              <Badge variant="secondary" className="font-mono text-xs">{property.id.slice(0, 8)}...</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company ID</span>
              <Badge variant="secondary" className="font-mono text-xs">{property.companyId.slice(0, 8)}...</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Type</span>
              <Badge variant="secondary" className="capitalize">{property.type || 'N/A'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium">{formatDate(property.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">{formatDate(property.updatedAt)}</span>
            </div>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading properties...</h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Home className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading properties</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadProperties}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedProperty ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
              <p className="text-gray-600">Manage all organizational properties and facilities</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadProperties}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Property
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Home className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
                    <div className="text-sm text-gray-600">Total Properties</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {properties.filter(p => p.status === 'active').length}
                    </div>
                    <div className="text-sm text-gray-600">Active</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-900">
                      {formatCurrency(properties.reduce((sum, p) => sum + (p.currentValue || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Value</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Square className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {properties.reduce((sum, p) => sum + (p.sizeTotalArea || 0), 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Total Sq Ft</div>
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
                placeholder="Search properties..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
            </Badge>
          </div>

          {/* Properties Grid */}
          {filteredProperties.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Home className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first property'}
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add First Property
              </Button>
            </div>
          )}
        </>
      ) : (
        <PropertyDetails property={selectedProperty} />
      )}
    </div>
  )
}
