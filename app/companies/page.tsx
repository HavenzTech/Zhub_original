// app/companies/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { Company, CompanyStatus, IotMetric } from "@/types/bms"
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
  RefreshCw,
  Activity,
  Zap,
  Thermometer,
  Droplets,
  Wind,
  AlertTriangle,
  CheckCircle2,
  Info,
  Gauge
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'
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

export default function CompaniesPage() {
  const router = useRouter()
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [iotMetrics, setIotMetrics] = useState<IotMetric[]>([])
  const [loadingMetrics, setLoadingMetrics] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    status: "active" as CompanyStatus,
    locationAddress: "",
    locationCity: "",
    locationProvince: "",
    locationCountry: "",
    locationPostalCode: "",
    contactEmail: "",
    contactPhone: "",
    annualRevenue: "",
    logoUrl: ""
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
    const role = authService.getCurrentRole()

    console.log('🔐 Auth Debug:', {
      hasAuth: !!auth,
      hasToken: !!token,
      companyId,
      role,
      isSuperAdmin: authService.isSuperAdmin(),
      email: auth?.email
    })

    if (token) bmsApi.setToken(token)
    if (companyId) bmsApi.setCompanyId(companyId)

    loadCompanies()
  }, [router])

  const loadCompanies = async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to get companies - if 403, try getting user's companies instead
      try {
        const data = await bmsApi.companies.getAll()
        setCompanies(data as Company[])
      } catch (getAllError) {
        // If getAll fails with 403, try getting companies by user
        if (getAllError instanceof BmsApiError && getAllError.status === 403) {
          console.log('⚠️ GET /company returned 403, trying to get user companies...')
          const auth = authService.getAuth()
          if (auth?.userId) {
            const data = await bmsApi.companies.getByUser(auth.userId)
            setCompanies(data as Company[])
          } else {
            throw getAllError
          }
        } else {
          throw getAllError
        }
      }
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load companies'
      setError(errorMessage)

      console.error('❌ Error loading companies:', {
        error: err,
        message: errorMessage,
        status: err instanceof BmsApiError ? err.status : 'unknown',
        details: err instanceof BmsApiError ? err.details : null
      })

      // Show specific error message for 403
      if (err instanceof BmsApiError && err.status === 403) {
        toast.error('Access denied. The GET /company endpoint may not be implemented on the backend.')
      } else {
        toast.error(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  const loadIotMetrics = async (companyId: string) => {
    try {
      setLoadingMetrics(true)
      const data = await bmsApi.iotMetrics.getByCompany(companyId)
      setIotMetrics(data as IotMetric[])
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load IoT metrics'
      toast.error(errorMessage)
      console.error('Error loading IoT metrics:', err)
    } finally {
      setLoadingMetrics(false)
    }
  }

  // Load IoT metrics when a company is selected
  useEffect(() => {
    if (selectedCompany) {
      loadIotMetrics(selectedCompany.id)
    } else {
      setIotMetrics([])
    }
  }, [selectedCompany])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      toast.error("Company name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        name: formData.name,
        status: formData.status
      }

      // Only add optional fields if they have values
      if (formData.industry?.trim()) payload.industry = formData.industry
      if (formData.locationAddress?.trim()) payload.locationAddress = formData.locationAddress
      if (formData.locationCity?.trim()) payload.locationCity = formData.locationCity
      if (formData.locationProvince?.trim()) payload.locationProvince = formData.locationProvince
      if (formData.locationCountry?.trim()) payload.locationCountry = formData.locationCountry
      if (formData.locationPostalCode?.trim()) payload.locationPostalCode = formData.locationPostalCode
      if (formData.contactEmail?.trim()) payload.contactEmail = formData.contactEmail
      if (formData.contactPhone?.trim()) payload.contactPhone = formData.contactPhone
      if (formData.logoUrl?.trim()) payload.logoUrl = formData.logoUrl
      if (formData.annualRevenue && !isNaN(parseFloat(formData.annualRevenue))) {
        payload.annualRevenue = parseFloat(formData.annualRevenue)
      }

      console.log('Creating company with payload:', payload)
      const newCompany = await bmsApi.companies.create(payload)

      setCompanies(prev => [...prev, newCompany as Company])
      toast.success("Company created successfully!")
      setShowAddForm(false)
      setFormData({
        name: "",
        industry: "",
        status: "active" as CompanyStatus,
        locationAddress: "",
        locationCity: "",
        locationProvince: "",
        locationCountry: "",
        locationPostalCode: "",
        contactEmail: "",
        contactPhone: "",
        annualRevenue: "",
        logoUrl: ""
      })
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to create company'
      toast.error(errorMessage)
      console.error('Error creating company:', err)
      if (err instanceof BmsApiError) {
        console.error('Error details:', { status: err.status, code: err.code, details: err.details })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditClick = (company: Company) => {
    setEditingCompany(company)
    setFormData({
      name: company.name,
      industry: company.industry || "",
      status: company.status,
      locationAddress: company.locationAddress || "",
      locationCity: company.locationCity || "",
      locationProvince: company.locationProvince || "",
      locationCountry: company.locationCountry || "",
      locationPostalCode: company.locationPostalCode || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      annualRevenue: company.annualRevenue?.toString() || "",
      logoUrl: company.logoUrl || ""
    })
    setShowEditForm(true)
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingCompany || !formData.name.trim()) {
      toast.error("Company name is required")
      return
    }

    setIsSubmitting(true)
    try {
      const payload: any = {
        id: editingCompany.id,
        name: formData.name,
        status: formData.status
      }

      // Only add optional fields if they have values
      if (formData.industry?.trim()) payload.industry = formData.industry
      if (formData.locationAddress?.trim()) payload.locationAddress = formData.locationAddress
      if (formData.locationCity?.trim()) payload.locationCity = formData.locationCity
      if (formData.locationProvince?.trim()) payload.locationProvince = formData.locationProvince
      if (formData.locationCountry?.trim()) payload.locationCountry = formData.locationCountry
      if (formData.locationPostalCode?.trim()) payload.locationPostalCode = formData.locationPostalCode
      if (formData.contactEmail?.trim()) payload.contactEmail = formData.contactEmail
      if (formData.contactPhone?.trim()) payload.contactPhone = formData.contactPhone
      if (formData.logoUrl?.trim()) payload.logoUrl = formData.logoUrl
      if (formData.annualRevenue && !isNaN(parseFloat(formData.annualRevenue))) {
        payload.annualRevenue = parseFloat(formData.annualRevenue)
      }

      await bmsApi.companies.update(editingCompany.id, payload)

      // Update the company in the list
      setCompanies(prev => prev.map(c =>
        c.id === editingCompany.id ? { ...c, ...payload } : c
      ))

      // Update selected company if it's the one being edited
      if (selectedCompany?.id === editingCompany.id) {
        setSelectedCompany({ ...selectedCompany, ...payload })
      }

      toast.success("Company updated successfully!")
      setShowEditForm(false)
      setEditingCompany(null)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to update company'
      toast.error(errorMessage)
      console.error('Error updating company:', err)
      if (err instanceof BmsApiError) {
        console.error('Error details:', { status: err.status, code: err.code, details: err.details })
      }
    } finally {
      setIsSubmitting(false)
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

  // IoT Metrics Helper Functions
  const getMetricIcon = (metricType: string) => {
    const type = metricType.toLowerCase()
    if (type.includes('temp')) return <Thermometer className="w-5 h-5" />
    if (type.includes('humidity') || type.includes('moisture')) return <Droplets className="w-5 h-5" />
    if (type.includes('power') || type.includes('energy') || type.includes('voltage')) return <Zap className="w-5 h-5" />
    if (type.includes('air') || type.includes('wind')) return <Wind className="w-5 h-5" />
    return <Activity className="w-5 h-5" />
  }

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-200"
      case "warning": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "info": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityIcon = (severity?: string) => {
    switch (severity) {
      case "critical": return <AlertTriangle className="w-4 h-4" />
      case "warning": return <Info className="w-4 h-4" />
      case "info": return <CheckCircle2 className="w-4 h-4" />
      default: return null
    }
  }

  // Group metrics by type for better organization
  const groupMetricsByType = (metrics: IotMetric[]) => {
    const grouped: { [key: string]: IotMetric[] } = {}
    metrics.forEach(metric => {
      const type = metric.metricType
      if (!grouped[type]) {
        grouped[type] = []
      }
      grouped[type].push(metric)
    })
    return grouped
  }

  // Get latest metric by type
  const getLatestMetricByType = (type: string) => {
    const filtered = iotMetrics.filter(m => m.metricType.toLowerCase().includes(type.toLowerCase()))
    if (filtered.length === 0) return null
    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0]
  }

  // Prepare chart data for trends
  const prepareChartData = (metricType: string) => {
    return iotMetrics
      .filter(m => m.metricType === metricType)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      .slice(-20) // Last 20 data points
      .map(m => ({
        time: new Date(m.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        value: m.value,
        alert: m.alertTriggered
      }))
  }

  // Gauge Chart Component
  const GaugeChart = ({ value, max = 100, label, unit, color = "#3b82f6" }: {
    value: number, max?: number, label: string, unit?: string, color?: string
  }) => {
    const percentage = (value / max) * 100
    const data = [
      { name: 'value', value: percentage, fill: color },
      { name: 'empty', value: 100 - percentage, fill: '#e5e7eb' }
    ]

    return (
      <div className="relative w-full h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="90%"
              paddingAngle={0}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-3xl font-bold text-gray-900">{value.toFixed(1)}</div>
          {unit && <div className="text-sm text-gray-600">{unit}</div>}
          <div className="text-xs text-gray-500 mt-1">{label}</div>
        </div>
      </div>
    )
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
              {authService.hasPermission('update', 'company') && (
                <Button variant="outline" onClick={() => handleEditClick(company)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Company
                </Button>
              )}
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

      {/* IoT Metrics Dashboard */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">IoT Metrics Dashboard</h2>
              <p className="text-sm text-gray-600">Real-time monitoring and analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {iotMetrics.length} metrics
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadIotMetrics(company.id)}
              disabled={loadingMetrics}
            >
              {loadingMetrics ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {loadingMetrics ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 text-blue-600 mx-auto mb-2 animate-spin" />
                <p className="text-sm text-gray-600">Loading IoT metrics...</p>
              </div>
            </CardContent>
          </Card>
        ) : iotMetrics.length > 0 ? (
          <>
            {/* Alert Summary Banner */}
            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold text-gray-900">System Status Overview</CardTitle>
                <p className="text-sm text-gray-600">Current alert status across all IoT devices</p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500 rounded-xl">
                      <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Total Metrics</div>
                      <div className="text-2xl font-bold text-gray-900">{iotMetrics.length}</div>
                      <div className="text-xs text-gray-600">Data Points</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-green-500 rounded-xl">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Normal Status</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {iotMetrics.filter(m => !m.alertTriggered).length}
                      </div>
                      <div className="text-xs text-gray-600">No Issues</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-500 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Warning Alerts</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {iotMetrics.filter(m => m.alertSeverity === 'warning').length}
                      </div>
                      <div className="text-xs text-gray-600">Requires Attention</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-red-500 rounded-xl">
                      <AlertTriangle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Critical Alerts</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {iotMetrics.filter(m => m.alertSeverity === 'critical').length}
                      </div>
                      <div className="text-xs text-gray-600">Immediate Action</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Key Metrics - Large Display Cards */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Current Readings</h3>
                <p className="text-sm text-gray-600">Latest values from IoT sensors</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const temp = getLatestMetricByType('temp')
                const humidity = getLatestMetricByType('humidity')
                const power = getLatestMetricByType('power')
                const pressure = getLatestMetricByType('pressure')

                return (
                  <>
                    {temp && (
                      <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Thermometer className="w-5 h-5 text-orange-600" />
                              <span className="text-xs font-medium text-orange-700 uppercase tracking-wide">Temperature</span>
                            </div>
                            {temp.alertTriggered && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                Alert
                              </Badge>
                            )}
                          </div>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {temp.value.toFixed(1)}
                            <span className="text-lg text-gray-600 ml-1">{temp.unit || '°C'}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700">{temp.metricType}</div>
                          <div className="text-xs text-gray-500 mt-2">Last Updated: {getTimeAgo(temp.timestamp)}</div>
                        </CardContent>
                      </Card>
                    )}

                    {humidity && (
                      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Droplets className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-medium text-blue-700 uppercase tracking-wide">Humidity</span>
                            </div>
                            {humidity.alertTriggered && (
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-700 border-yellow-300">
                                Alert
                              </Badge>
                            )}
                          </div>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {humidity.value.toFixed(1)}
                            <span className="text-lg text-gray-600 ml-1">{humidity.unit || '%'}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700">{humidity.metricType}</div>
                          <div className="text-xs text-gray-500 mt-2">Last Updated: {getTimeAgo(humidity.timestamp)}</div>
                        </CardContent>
                      </Card>
                    )}

                    {power && (
                      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Zap className="w-5 h-5 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-700 uppercase tracking-wide">Power</span>
                            </div>
                            {power.alertTriggered && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                Alert
                              </Badge>
                            )}
                          </div>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {power.value.toFixed(1)}
                            <span className="text-lg text-gray-600 ml-1">{power.unit || 'W'}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700">{power.metricType}</div>
                          <div className="text-xs text-gray-500 mt-2">Last Updated: {getTimeAgo(power.timestamp)}</div>
                        </CardContent>
                      </Card>
                    )}

                    {pressure && (
                      <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Wind className="w-5 h-5 text-purple-600" />
                              <span className="text-xs font-medium text-purple-700 uppercase tracking-wide">Pressure</span>
                            </div>
                            {pressure.alertTriggered && (
                              <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                                Alert
                              </Badge>
                            )}
                          </div>
                          <div className="text-4xl font-bold text-gray-900 mb-1">
                            {pressure.value.toFixed(1)}
                            <span className="text-lg text-gray-600 ml-1">{pressure.unit || 'Pa'}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-700">{pressure.metricType}</div>
                          <div className="text-xs text-gray-500 mt-2">Last Updated: {getTimeAgo(pressure.timestamp)}</div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )
              })()}
              </div>
            </div>

            {/* Charts Section */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Visual Analytics</h3>
                <p className="text-sm text-gray-600">Gauge meters and trend analysis</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gauge Charts */}
              {(() => {
                const uniqueTypes = [...new Set(iotMetrics.map(m => m.metricType))].slice(0, 2)
                return uniqueTypes.map(type => {
                  const latest = getLatestMetricByType(type)
                  if (!latest) return null

                  const max = latest.thresholdMax || 100
                  const color = latest.alertTriggered
                    ? (latest.alertSeverity === 'critical' ? '#ef4444' : '#f59e0b')
                    : '#3b82f6'

                  return (
                    <Card key={type}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          {getMetricIcon(type)}
                          {type} - Gauge Meter
                        </CardTitle>
                        <p className="text-sm text-gray-600">Current value: {latest.value.toFixed(1)} {latest.unit}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <GaugeChart
                            value={latest.value}
                            max={max}
                            label="Current Value"
                            unit={latest.unit}
                            color={color}
                          />
                        </div>
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Min: 0</span>
                            <span className="text-gray-600">Max: {max}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              })()}

              {/* Line Chart - Trends */}
              {(() => {
                const metricTypes = [...new Set(iotMetrics.map(m => m.metricType))]
                const primaryType = metricTypes[0]

                if (!primaryType) return null

                const chartData = prepareChartData(primaryType)

                return (
                  <Card className="lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Trend Analysis - {primaryType}
                      </CardTitle>
                      <p className="text-sm text-gray-600">Historical data showing last 20 readings over time</p>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Time Period</span>
                          <span className="font-medium text-gray-900">Last {chartData.length} readings</span>
                        </div>
                      </div>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis
                            dataKey="time"
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Time', position: 'insideBottom', offset: -5 }}
                          />
                          <YAxis
                            stroke="#6b7280"
                            style={{ fontSize: '12px' }}
                            label={{ value: 'Value', angle: -90, position: 'insideLeft' }}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#fff',
                              border: '1px solid #e5e7eb',
                              borderRadius: '8px',
                              padding: '8px'
                            }}
                            formatter={(value: any) => [value, 'Value']}
                            labelFormatter={(label) => `Time: ${label}`}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#colorValue)"
                            name="Metric Value"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )
              })()}
              </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Detailed Metrics List</h3>
                <p className="text-sm text-gray-600">Complete information for all sensor readings</p>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    All Metrics Details
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {iotMetrics.slice(0, 10).map((metric) => (
                    <div
                      key={metric.id}
                      className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                        metric.alertTriggered
                          ? metric.alertSeverity === 'critical'
                            ? 'bg-red-50 border-red-200'
                            : 'bg-yellow-50 border-yellow-200'
                          : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${
                            metric.alertTriggered ? 'bg-white' : 'bg-gray-100'
                          }`}>
                            {getMetricIcon(metric.metricType)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Metric Type:</span>
                              <span className="font-semibold text-gray-900">{metric.metricType}</span>
                              {metric.alertTriggered && (
                                <Badge variant="outline" className={
                                  metric.alertSeverity === 'critical'
                                    ? 'bg-red-100 text-red-700 border-red-300'
                                    : 'bg-yellow-100 text-yellow-700 border-yellow-300'
                                }>
                                  {getSeverityIcon(metric.alertSeverity)}
                                  <span className="ml-1 uppercase text-xs">{metric.alertSeverity}</span>
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Device ID:</span> {metric.deviceId.slice(0, 8)}... • <span className="font-medium">Recorded:</span> {getTimeAgo(metric.timestamp)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Current Value</div>
                          <div className="text-3xl font-bold text-gray-900">
                            {metric.value.toFixed(2)}
                          </div>
                          {metric.unit && (
                            <div className="text-sm text-gray-600 font-medium">{metric.unit}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {iotMetrics.length > 10 && (
                  <div className="text-center pt-4 mt-4 border-t">
                    <p className="text-sm text-gray-600">
                      Showing 10 of {iotMetrics.length} metrics
                    </p>
                  </div>
                )}
              </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No IoT Metrics Available</h3>
              <p className="text-gray-600">
                This company doesn't have any IoT metrics recorded yet.
              </p>
            </CardContent>
          </Card>
        )}
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
              {authService.hasPermission('create', 'company') && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Company
                </Button>
              )}
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
              {authService.hasPermission('create', 'company') && (
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Company
                </Button>
              )}
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

      {/* Add Company Modal */}
      <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Company</DialogTitle>
            <DialogDescription>
              Create a new company in the system. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid gap-2">
                <Label htmlFor="name">Company Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CompanyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="contactEmail">Contact Email</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="company@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="contactPhone">Contact Phone</Label>
                  <Input
                    id="contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid gap-2">
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

              <div className="grid grid-cols-2 gap-4">
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

              {/* Financial */}
              <div className="grid gap-2">
                <Label htmlFor="annualRevenue">Annual Revenue (CAD)</Label>
                <Input
                  id="annualRevenue"
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
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
                    Create Company
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Company</DialogTitle>
            <DialogDescription>
              Update company information. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              {/* Basic Information */}
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Company Name *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter company name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-industry">Industry</Label>
                  <Input
                    id="edit-industry"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="e.g., Technology, Healthcare"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as CompanyStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="edit-contactEmail">Contact Email</Label>
                  <Input
                    id="edit-contactEmail"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="company@example.com"
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="edit-contactPhone">Contact Phone</Label>
                  <Input
                    id="edit-contactPhone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid gap-2">
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

              <div className="grid grid-cols-2 gap-4">
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

              {/* Financial */}
              <div className="grid gap-2">
                <Label htmlFor="edit-annualRevenue">Annual Revenue (CAD)</Label>
                <Input
                  id="edit-annualRevenue"
                  type="number"
                  value={formData.annualRevenue}
                  onChange={(e) => setFormData({ ...formData, annualRevenue: e.target.value })}
                  placeholder="0"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-logoUrl">Logo URL</Label>
                <Input
                  id="edit-logoUrl"
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                  placeholder="https://example.com/logo.png"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowEditForm(false)
                  setEditingCompany(null)
                }}
                disabled={isSubmitting}
              >
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
                    Update Company
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
