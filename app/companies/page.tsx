// app/companies/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { Company } from "@/types/bms"
import { toast } from "sonner"
import {
  Building2,
  Plus,
  Search,
  Eye,
  Edit,
  MoreHorizontal,
  DollarSign,
  Users,
  FolderOpen,
  TrendingUp,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Link,
  FileText,
  Loader2,
  RefreshCw
} from 'lucide-react'

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.companies.getAll()
      setCompanies(data as Company[])
      toast.success(`Loaded ${(data as Company[]).length} companies`)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load companies'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading companies:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

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

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMs = now.getTime() - date.getTime()
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
    const diffInDays = Math.floor(diffInHours / 24)

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hours ago`
    if (diffInDays === 1) return "1 day ago"
    return `${diffInDays} days ago`
  }

  const CompanyCard = ({ company }: { company: Company }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCompany(company)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img src={company.logoUrl} alt={company.name} className="w-12 h-12 rounded-lg object-cover" />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <p className="text-sm text-gray-600">{company.industry || "N/A"}</p>
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
            <div className="text-xl font-bold text-gray-900">{formatCurrency(company.annualRevenue)}</div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-gray-900">{company.status === 'active' ? '✓' : '—'}</div>
            <div className="text-xs text-gray-600">Status</div>
          </div>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          {(company.locationCity || company.locationProvince) && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {[company.locationCity, company.locationProvince].filter(Boolean).join(', ')}
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
            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setSelectedCompany(company); }}>
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const CompanyDetails = ({ company }: { company: Company }) => (
    <div className="space-y-6">
      {/* Company Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {company.logoUrl ? (
                <img src={company.logoUrl} alt={company.name} className="w-16 h-16 rounded-xl object-cover" />
              ) : (
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.industry || "N/A"}</p>
                <Badge className={getStatusColor(company.status)}>
                  {company.status}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Company
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{formatCurrency(company.annualRevenue)}</div>
              <div className="text-sm text-gray-600">Annual Revenue</div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Building2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{company.status}</div>
              <div className="text-sm text-gray-600">Status</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Calendar className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{formatDate(company.createdAt)}</div>
              <div className="text-sm text-gray-600">Created</div>
            </div>

            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-xl font-bold text-gray-900">{getTimeAgo(company.updatedAt)}</div>
              <div className="text-sm text-gray-600">Last Updated</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {company.contactEmail && (
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{company.contactEmail}</span>
              </div>
            )}
            {company.contactPhone && (
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm">{company.contactPhone}</span>
              </div>
            )}
            {company.locationAddress && (
              <div className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span className="text-sm">
                  {[
                    company.locationAddress,
                    company.locationCity,
                    company.locationProvince,
                    company.locationPostalCode,
                    company.locationCountry
                  ].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Company Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company ID</span>
              <Badge variant="secondary" className="font-mono text-xs">{company.id.slice(0, 8)}...</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Industry</span>
              <span className="text-sm font-medium">{company.industry || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created At</span>
              <span className="text-sm font-medium">{formatDate(company.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">{formatDate(company.updatedAt)}</span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading companies...</h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building2 className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading companies</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadCompanies}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedCompany ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
              <p className="text-gray-600">Manage your organization's companies and their operations</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadCompanies}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Company
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search companies..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredCompanies.length} {filteredCompanies.length === 1 ? 'company' : 'companies'}
            </Badge>
          </div>

          {/* Companies Grid */}
          {filteredCompanies.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCompanies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by adding your first company'}
              </p>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Company
              </Button>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Back Button */}
          <Button variant="ghost" onClick={() => setSelectedCompany(null)}>
            ← Back to Companies
          </Button>

          {/* Company Details */}
          <CompanyDetails company={selectedCompany} />
        </>
      )}
    </div>
  )
}
