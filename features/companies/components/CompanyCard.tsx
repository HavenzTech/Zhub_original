import { memo } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Calendar, Eye } from "lucide-react"
import Image from "next/image"
import type { Company } from "@/types/bms"
import {
  getStatusColor,
  formatCurrency,
  formatDate,
  getTimeAgo,
} from "../utils/companyHelpers"

interface CompanyCardProps {
  company: Company
  onViewDetails: (company: Company) => void
}

export const CompanyCard = memo(function CompanyCard({ company, onViewDetails }: CompanyCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onViewDetails(company)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <Image
                src={company.logoUrl}
                alt={company.name}
                className="w-12 h-12 rounded-lg object-cover"
                height={48}
                width={48}
              />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <p className="text-sm text-gray-600">
                {company.industry || "N/A"}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(company.status)}>
            {company.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {formatCurrency(company.annualRevenue)}
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">
              {company.status === "active" ? "✓" : "—"}
            </div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {(company.locationCity || company.locationProvince) && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {[company.locationCity, company.locationProvince]
                .filter(Boolean)
                .join(", ")}
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Created {formatDate(company.createdAt)}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Updated: {getTimeAgo(company.updatedAt)}
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onViewDetails(company)
              }}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
})
