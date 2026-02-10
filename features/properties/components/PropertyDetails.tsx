import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Building2, DollarSign, TrendingUp, Square, Calendar, Edit, ArrowLeft } from "lucide-react"
import type { Property } from "@/types/bms"
import { formatCurrency, formatDate, getStatusColor, getTypeIcon } from "../utils/propertyHelpers"

interface PropertyDetailsProps {
  property: Property
  companyName?: string
  onBack: () => void
  onEdit: (property: Property) => void
}

export function PropertyDetails({ property, companyName, onBack, onEdit }: PropertyDetailsProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Properties
      </Button>

      {/* Property Header */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-accent-cyan/10 rounded-xl flex items-center justify-center">
              {getTypeIcon(property.type)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50 mb-2">{property.name}</h1>
              {property.description && (
                <p className="text-stone-600 dark:text-stone-400 mb-4">{property.description}</p>
              )}

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
                {property.type && <Badge variant="secondary" className="capitalize">{property.type}</Badge>}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Total Area:</span>
                  <div className="font-medium text-stone-900 dark:text-stone-50">
                    {property.sizeTotalArea ? `${property.sizeTotalArea.toLocaleString()} sq ft` : 'N/A'}
                  </div>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Floors:</span>
                  <div className="font-medium text-stone-900 dark:text-stone-50">{property.sizeFloors || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-stone-500 dark:text-stone-400">Company:</span>
                  <div className="font-medium text-stone-900 dark:text-stone-50">{companyName || 'N/A'}</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onEdit(property)} className="border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {formatCurrency(property.currentValue)}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Current Value</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-cyan/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {formatCurrency(property.monthlyOperatingCosts)}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Monthly Costs</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 dark:bg-violet-950/30 rounded-lg flex items-center justify-center">
              <Square className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <div className="text-lg font-bold text-stone-900 dark:text-stone-50">
                {property.sizeTotalArea ? property.sizeTotalArea.toLocaleString() : 'N/A'}
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Total Sq Ft</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-950/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <div className="text-sm font-bold text-stone-900 dark:text-stone-50">{formatDate(property.createdAt)}</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Created</div>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
            <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
              <MapPin className="w-5 h-5" />
              Location
            </h3>
          </div>
          <div className="p-5 space-y-3">
            {property.locationAddress && (
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Address:</span>
                <div className="font-medium text-stone-900 dark:text-stone-50">{property.locationAddress}</div>
              </div>
            )}
            <div>
              <span className="text-sm text-stone-500 dark:text-stone-400">City:</span>
              <div className="font-medium text-stone-900 dark:text-stone-50">{property.locationCity || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-stone-500 dark:text-stone-400">Province:</span>
              <div className="font-medium text-stone-900 dark:text-stone-50">{property.locationProvince || 'N/A'}</div>
            </div>
            <div>
              <span className="text-sm text-stone-500 dark:text-stone-400">Country:</span>
              <div className="font-medium text-stone-900 dark:text-stone-50">{property.locationCountry || 'N/A'}</div>
            </div>
            {property.locationPostalCode && (
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Postal Code:</span>
                <div className="font-medium text-stone-900 dark:text-stone-50">{property.locationPostalCode}</div>
              </div>
            )}
            {(property.locationLatitude && property.locationLongitude) && (
              <div>
                <span className="text-sm text-stone-500 dark:text-stone-400">Coordinates:</span>
                <div className="font-medium font-mono text-xs text-stone-900 dark:text-stone-50">
                  {property.locationLatitude.toFixed(6)}, {property.locationLongitude.toFixed(6)}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
          <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
            <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
              <Building2 className="w-5 h-5" />
              Property Details
            </h3>
          </div>
          <div className="p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400">Property</span>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{property.name || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400">Company</span>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{companyName || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400">Type</span>
              <Badge variant="secondary" className="capitalize">{property.type || 'N/A'}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400">Status</span>
              <Badge className={getStatusColor(property.status)}>{property.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400">Created</span>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatDate(property.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-500 dark:text-stone-400">Last Updated</span>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-50">{formatDate(property.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
