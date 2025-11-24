import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, DollarSign, TrendingUp, Square, Calendar, Edit } from "lucide-react"
import type { Property } from "@/types/bms"
import { formatCurrency, formatDate, getStatusColor, getTypeIcon } from "../utils/propertyHelpers"

interface PropertyDetailsProps {
  property: Property
  onBack: () => void
  onEdit: (property: Property) => void
}

export function PropertyDetails({ property, onBack, onEdit }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
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
              <Button variant="outline" onClick={() => onEdit(property)}>
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
}
