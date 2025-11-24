import { memo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin } from "lucide-react"
import type { Property } from "@/types/bms"
import { formatCurrency, getStatusColor, getTypeIcon } from "../utils/propertyHelpers"

interface PropertyCardProps {
  property: Property
  onClick: (property: Property) => void
}

export const PropertyCard = memo(function PropertyCard({ property, onClick }: PropertyCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(property)}
    >
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
          <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {property.description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">{property.description}</p>
        )}

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {property.sizeTotalArea
                ? `${property.sizeTotalArea.toLocaleString()} sq ft`
                : "N/A"}
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
              {[property.locationCity, property.locationProvince].filter(Boolean).join(", ")}
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Operating Costs:</span>
            <span className="font-medium">
              {formatCurrency(property.monthlyOperatingCosts)}/mo
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
