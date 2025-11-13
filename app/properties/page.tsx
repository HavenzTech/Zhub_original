// app/properties/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { Property, PropertyType, PropertyStatus } from "@/types/bms"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

export default function PropertiesPage() {
  const router = useRouter()
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "" as PropertyType | "",
    status: "active" as PropertyStatus,
    locationAddress: "",
    locationCity: "",
    locationProvince: "",
    locationCountry: "",
    locationPostalCode: "",
    locationLatitude: "",
    locationLongitude: "",
    sizeTotalArea: "",
    sizeUsableArea: "",
    sizeFloors: "",
    currentValue: "",
    monthlyOperatingCosts: ""
  })

  // Initialize auth on mount
  useEffect(() => {
    const auth = authService.getAuth()
    if (!auth) {
      router.push('/login')
      return
    }

    const token = authService.getToken()
    const companyId = authService.getCurrentCompanyId()

    if (token) bmsApi.setToken(token)
    if (companyId) bmsApi.setCompanyId(companyId)

    loadProperties()
  }, [router])

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Property name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name: formData.name,
        status: formData.status
      }

      // Only add optional fields if they have values
      if (formData.description?.trim()) payload.description = formData.description
      if (formData.type) payload.type = formData.type
      if (formData.locationAddress?.trim()) payload.locationAddress = formData.locationAddress
      if (formData.locationCity?.trim()) payload.locationCity = formData.locationCity
      if (formData.locationProvince?.trim()) payload.locationProvince = formData.locationProvince
      if (formData.locationCountry?.trim()) payload.locationCountry = formData.locationCountry
      if (formData.locationPostalCode?.trim()) payload.locationPostalCode = formData.locationPostalCode
      if (formData.locationLatitude && !isNaN(parseFloat(formData.locationLatitude))) {
        payload.locationLatitude = parseFloat(formData.locationLatitude)
      }
      if (formData.locationLongitude && !isNaN(parseFloat(formData.locationLongitude))) {
        payload.locationLongitude = parseFloat(formData.locationLongitude)
      }
      if (formData.sizeTotalArea && !isNaN(parseFloat(formData.sizeTotalArea))) {
        payload.sizeTotalArea = parseFloat(formData.sizeTotalArea)
      }
      if (formData.sizeUsableArea && !isNaN(parseFloat(formData.sizeUsableArea))) {
        payload.sizeUsableArea = parseFloat(formData.sizeUsableArea)
      }
      if (formData.sizeFloors && !isNaN(parseInt(formData.sizeFloors))) {
        payload.sizeFloors = parseInt(formData.sizeFloors)
      }
      if (formData.currentValue && !isNaN(parseFloat(formData.currentValue))) {
        payload.currentValue = parseFloat(formData.currentValue)
      }
      if (formData.monthlyOperatingCosts && !isNaN(parseFloat(formData.monthlyOperatingCosts))) {
        payload.monthlyOperatingCosts = parseFloat(formData.monthlyOperatingCosts)
      }

      const newProperty = await bmsApi.properties.create(payload)

      setProperties(prev => [...prev, newProperty as Property])
      toast.success("Property created successfully!")
      setShowAddForm(false)
      setFormData({
        name: "",
        description: "",
        type: "" as PropertyType | "",
        status: "active" as PropertyStatus,
        locationAddress: "",
        locationCity: "",
        locationProvince: "",
        locationCountry: "",
        locationPostalCode: "",
        locationLatitude: "",
        locationLongitude: "",
        sizeTotalArea: "",
        sizeUsableArea: "",
        sizeFloors: "",
        currentValue: "",
        monthlyOperatingCosts: ""
      })
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to create property'
      toast.error(errorMessage)
      console.error('Error creating property:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProperty || !formData.name.trim()) {
      toast.error("Property name is required")
      return
    }

    setIsSubmitting(true)
    try {
      // Build payload using UpdatePropertyRequest DTO
      const payload: any = {
        id: selectedProperty.id,
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        type: formData.type?.trim() || null,
        status: formData.status,
        locationAddress: formData.locationAddress?.trim() || null,
        locationCity: formData.locationCity?.trim() || null,
        locationProvince: formData.locationProvince?.trim() || null,
        locationCountry: formData.locationCountry?.trim() || null,
        locationPostalCode: formData.locationPostalCode?.trim() || null,
        locationLatitude: null,
        locationLongitude: null,
        sizeTotalArea: null,
        sizeUsableArea: null,
        sizeFloors: null,
        currentValue: null,
        monthlyOperatingCosts: null
      }

      // Only set numeric fields if they have valid values
      const locationLatitude = formData.locationLatitude?.trim()
      if (locationLatitude && !isNaN(parseFloat(locationLatitude))) {
        payload.locationLatitude = parseFloat(locationLatitude)
      }

      const locationLongitude = formData.locationLongitude?.trim()
      if (locationLongitude && !isNaN(parseFloat(locationLongitude))) {
        payload.locationLongitude = parseFloat(locationLongitude)
      }

      const sizeTotalArea = formData.sizeTotalArea?.trim()
      if (sizeTotalArea && !isNaN(parseFloat(sizeTotalArea))) {
        payload.sizeTotalArea = parseFloat(sizeTotalArea)
      }

      const sizeUsableArea = formData.sizeUsableArea?.trim()
      if (sizeUsableArea && !isNaN(parseFloat(sizeUsableArea))) {
        payload.sizeUsableArea = parseFloat(sizeUsableArea)
      }

      const sizeFloors = formData.sizeFloors?.trim()
      if (sizeFloors && !isNaN(parseInt(sizeFloors))) {
        payload.sizeFloors = parseInt(sizeFloors)
      }

      const currentValue = formData.currentValue?.trim()
      if (currentValue && !isNaN(parseFloat(currentValue))) {
        payload.currentValue = parseFloat(currentValue)
      }

      const monthlyOperatingCosts = formData.monthlyOperatingCosts?.trim()
      if (monthlyOperatingCosts && !isNaN(parseFloat(monthlyOperatingCosts))) {
        payload.monthlyOperatingCosts = parseFloat(monthlyOperatingCosts)
      }

      console.log('Updating property with payload:', payload)
      await bmsApi.properties.update(selectedProperty.id, payload)

      // Update local state with the changed data (backend returns NoContent)
      const updatedProperty = {
        ...selectedProperty,
        ...payload,
        updatedAt: new Date().toISOString()
      }

      setProperties(prev => prev.map(p => p.id === selectedProperty.id ? updatedProperty : p))
      setSelectedProperty(updatedProperty)
      toast.success("Property updated successfully!")
      setShowEditForm(false)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to update property'
      toast.error(errorMessage)
      console.error('Error updating property:', err)
      if (err instanceof BmsApiError) {
        console.error('Error details:', {
          status: err.status,
          code: err.code,
          details: err.details,
          message: err.message
        })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEditForm = (property: Property) => {
    setFormData({
      name: property.name,
      description: property.description || "",
      type: property.type || "",
      status: property.status,
      locationAddress: property.locationAddress || "",
      locationCity: property.locationCity || "",
      locationProvince: property.locationProvince || "",
      locationCountry: property.locationCountry || "",
      locationPostalCode: property.locationPostalCode || "",
      locationLatitude: property.locationLatitude?.toString() || "",
      locationLongitude: property.locationLongitude?.toString() || "",
      sizeTotalArea: property.sizeTotalArea?.toString() || "",
      sizeUsableArea: property.sizeUsableArea?.toString() || "",
      sizeFloors: property.sizeFloors?.toString() || "",
      currentValue: property.currentValue?.toString() || "",
      monthlyOperatingCosts: property.monthlyOperatingCosts?.toString() || ""
    })
    setShowEditForm(true)
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
              <Button variant="outline" onClick={() => openEditForm(property)}>
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
              {authService.hasPermission('create', 'property') && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              )}
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
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Property
              </Button>
            </div>
          )}
        </>
      ) : (
        <PropertyDetails property={selectedProperty} />
      )}

      {/* Add Property Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Property</DialogTitle>
            <DialogDescription>
              Create a new property in the system. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid gap-2">
                <Label htmlFor="name">Property Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter property name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Property description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">Property Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as PropertyType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="datacenter">Data Center</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as PropertyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="under-construction">Under Construction</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Location Information</h3>

                <div className="grid gap-2 mb-4">
                  <Label htmlFor="locationAddress">Address</Label>
                  <Input
                    id="locationAddress"
                    value={formData.locationAddress}
                    onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="locationCity">City</Label>
                    <Input
                      id="locationCity"
                      value={formData.locationCity}
                      onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                      placeholder="City"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="locationProvince">Province/State</Label>
                    <Input
                      id="locationProvince"
                      value={formData.locationProvince}
                      onChange={(e) => setFormData({ ...formData, locationProvince: e.target.value })}
                      placeholder="Province or State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="locationCountry">Country</Label>
                    <Input
                      id="locationCountry"
                      value={formData.locationCountry}
                      onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                      placeholder="Country"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="locationPostalCode">Postal Code</Label>
                    <Input
                      id="locationPostalCode"
                      value={formData.locationPostalCode}
                      onChange={(e) => setFormData({ ...formData, locationPostalCode: e.target.value })}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="locationLatitude">Latitude</Label>
                    <Input
                      id="locationLatitude"
                      type="number"
                      step="any"
                      value={formData.locationLatitude}
                      onChange={(e) => setFormData({ ...formData, locationLatitude: e.target.value })}
                      placeholder="e.g., 43.6532"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="locationLongitude">Longitude</Label>
                    <Input
                      id="locationLongitude"
                      type="number"
                      step="any"
                      value={formData.locationLongitude}
                      onChange={(e) => setFormData({ ...formData, locationLongitude: e.target.value })}
                      placeholder="e.g., -79.3832"
                    />
                  </div>
                </div>
              </div>

              {/* Size Information */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Size Information</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="sizeTotalArea">Total Area (sq ft)</Label>
                    <Input
                      id="sizeTotalArea"
                      type="number"
                      value={formData.sizeTotalArea}
                      onChange={(e) => setFormData({ ...formData, sizeTotalArea: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sizeUsableArea">Usable Area (sq ft)</Label>
                    <Input
                      id="sizeUsableArea"
                      type="number"
                      value={formData.sizeUsableArea}
                      onChange={(e) => setFormData({ ...formData, sizeUsableArea: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="sizeFloors">Number of Floors</Label>
                    <Input
                      id="sizeFloors"
                      type="number"
                      value={formData.sizeFloors}
                      onChange={(e) => setFormData({ ...formData, sizeFloors: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Financial Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="currentValue">Current Value (CAD)</Label>
                    <Input
                      id="currentValue"
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="monthlyOperatingCosts">Monthly Operating Costs (CAD)</Label>
                    <Input
                      id="monthlyOperatingCosts"
                      type="number"
                      value={formData.monthlyOperatingCosts}
                      onChange={(e) => setFormData({ ...formData, monthlyOperatingCosts: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Property
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Property Modal */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Property</DialogTitle>
            <DialogDescription>
              Update property information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Property Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter property name"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Property description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-type">Property Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value) => setFormData({ ...formData, type: value as PropertyType })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="office">Office</SelectItem>
                      <SelectItem value="warehouse">Warehouse</SelectItem>
                      <SelectItem value="datacenter">Data Center</SelectItem>
                      <SelectItem value="residential">Residential</SelectItem>
                      <SelectItem value="industrial">Industrial</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as PropertyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="under-construction">Under Construction</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Location Information */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Location Information</h3>

                <div className="grid gap-2 mb-4">
                  <Label htmlFor="edit-locationAddress">Address</Label>
                  <Input
                    id="edit-locationAddress"
                    value={formData.locationAddress}
                    onChange={(e) => setFormData({ ...formData, locationAddress: e.target.value })}
                    placeholder="Street address"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationCity">City</Label>
                    <Input
                      id="edit-locationCity"
                      value={formData.locationCity}
                      onChange={(e) => setFormData({ ...formData, locationCity: e.target.value })}
                      placeholder="City"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationProvince">Province/State</Label>
                    <Input
                      id="edit-locationProvince"
                      value={formData.locationProvince}
                      onChange={(e) => setFormData({ ...formData, locationProvince: e.target.value })}
                      placeholder="Province or State"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationCountry">Country</Label>
                    <Input
                      id="edit-locationCountry"
                      value={formData.locationCountry}
                      onChange={(e) => setFormData({ ...formData, locationCountry: e.target.value })}
                      placeholder="Country"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationPostalCode">Postal Code</Label>
                    <Input
                      id="edit-locationPostalCode"
                      value={formData.locationPostalCode}
                      onChange={(e) => setFormData({ ...formData, locationPostalCode: e.target.value })}
                      placeholder="Postal Code"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationLatitude">Latitude</Label>
                    <Input
                      id="edit-locationLatitude"
                      type="number"
                      step="any"
                      value={formData.locationLatitude}
                      onChange={(e) => setFormData({ ...formData, locationLatitude: e.target.value })}
                      placeholder="e.g., 43.6532"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-locationLongitude">Longitude</Label>
                    <Input
                      id="edit-locationLongitude"
                      type="number"
                      step="any"
                      value={formData.locationLongitude}
                      onChange={(e) => setFormData({ ...formData, locationLongitude: e.target.value })}
                      placeholder="e.g., -79.3832"
                    />
                  </div>
                </div>
              </div>

              {/* Size Information */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Size Information</h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-sizeTotalArea">Total Area (sq ft)</Label>
                    <Input
                      id="edit-sizeTotalArea"
                      type="number"
                      value={formData.sizeTotalArea}
                      onChange={(e) => setFormData({ ...formData, sizeTotalArea: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-sizeUsableArea">Usable Area (sq ft)</Label>
                    <Input
                      id="edit-sizeUsableArea"
                      type="number"
                      value={formData.sizeUsableArea}
                      onChange={(e) => setFormData({ ...formData, sizeUsableArea: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-sizeFloors">Number of Floors</Label>
                    <Input
                      id="edit-sizeFloors"
                      type="number"
                      value={formData.sizeFloors}
                      onChange={(e) => setFormData({ ...formData, sizeFloors: e.target.value })}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              {/* Financial Information */}
              <div className="border-t pt-4 mt-2">
                <h3 className="font-medium text-sm mb-3">Financial Information</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="edit-currentValue">Current Value (CAD)</Label>
                    <Input
                      id="edit-currentValue"
                      type="number"
                      value={formData.currentValue}
                      onChange={(e) => setFormData({ ...formData, currentValue: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="edit-monthlyOperatingCosts">Monthly Operating Costs (CAD)</Label>
                    <Input
                      id="edit-monthlyOperatingCosts"
                      type="number"
                      value={formData.monthlyOperatingCosts}
                      onChange={(e) => setFormData({ ...formData, monthlyOperatingCosts: e.target.value })}
                      placeholder="0"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditForm(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Property
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
