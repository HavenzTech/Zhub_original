// app/companies/page.tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  FileText
} from 'lucide-react'

interface Company {
  id: number
  name: string
  revenue: string
  projects: number
  status: "active" | "inactive" | "pending"
  industry: string
  location: string
  employees: number
  founded: string
  contact: {
    email: string
    phone: string
    website: string
  }
  recentActivity: {
    uploads: number
    tasks: number
    lastUpdate: string
  }
  kpis: {
    quarterlyGrowth: string
    activeContracts: number
    pendingPayments: string
  }
}

export default function CompaniesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)

  const companies: Company[] = [
    {
      id: 1,
      name: "AHI Red Deer",
      revenue: "$2.4M",
      projects: 8,
      status: "active",
      industry: "Healthcare Infrastructure",
      location: "Red Deer, Alberta",
      employees: 145,
      founded: "2018",
      contact: {
        email: "contact@ahireddeer.com",
        phone: "+1 (403) 555-0123",
        website: "www.ahireddeer.com"
      },
      recentActivity: {
        uploads: 12,
        tasks: 5,
        lastUpdate: "2 hours ago"
      },
      kpis: {
        quarterlyGrowth: "+15%",
        activeContracts: 7,
        pendingPayments: "$125K"
      }
    },
    {
      id: 2,
      name: "Havenz Tech",
      revenue: "$1.8M",
      projects: 12,
      status: "active",
      industry: "Technology Solutions",
      location: "Calgary, Alberta",
      employees: 89,
      founded: "2020",
      contact: {
        email: "info@havenztech.com",
        phone: "+1 (403) 555-0456",
        website: "www.havenztech.com"
      },
      recentActivity: {
        uploads: 8,
        tasks: 12,
        lastUpdate: "4 hours ago"
      },
      kpis: {
        quarterlyGrowth: "+23%",
        activeContracts: 12,
        pendingPayments: "$87K"
      }
    },
    {
      id: 3,
      name: "Denvr Dataworks",
      revenue: "$950K",
      projects: 5,
      status: "active",
      industry: "Data Center Operations",
      location: "Edmonton, Alberta",
      employees: 34,
      founded: "2019",
      contact: {
        email: "operations@denvrdataworks.com",
        phone: "+1 (780) 555-0789",
        website: "www.denvrdataworks.com"
      },
      recentActivity: {
        uploads: 15,
        tasks: 3,
        lastUpdate: "1 day ago"
      },
      kpis: {
        quarterlyGrowth: "+8%",
        activeContracts: 5,
        pendingPayments: "$45K"
      }
    }
  ]

  const filteredCompanies = companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.industry.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800"
      case "inactive": return "bg-gray-100 text-gray-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const CompanyCard = ({ company }: { company: Company }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedCompany(company)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{company.name}</CardTitle>
              <p className="text-sm text-gray-600">{company.industry}</p>
            </div>
          </div>
          <Badge className={getStatusColor(company.status)}>
            {company.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{company.revenue}</div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{company.projects}</div>
            <div className="text-xs text-gray-600">Projects</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{company.employees}</div>
            <div className="text-xs text-gray-600">Employees</div>
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            {company.location}
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Est. {company.founded}
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Last update: {company.recentActivity.lastUpdate}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Edit className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
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
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
                <p className="text-gray-600">{company.industry}</p>
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
              <Button>
                <Eye className="w-4 h-4 mr-2" />
                View Dashboard
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{company.revenue}</div>
              <div className="text-sm text-gray-600">Annual Revenue</div>
              <div className="text-xs text-green-600 mt-1">{company.kpis.quarterlyGrowth} this quarter</div>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <FolderOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{company.projects}</div>
              <div className="text-sm text-gray-600">Active Projects</div>
              <div className="text-xs text-blue-600 mt-1">{company.kpis.activeContracts} contracts</div>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{company.employees}</div>
              <div className="text-sm text-gray-600">Employees</div>
              <div className="text-xs text-purple-600 mt-1">Since {company.founded}</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{company.kpis.pendingPayments}</div>
              <div className="text-sm text-gray-600">Pending Payments</div>
              <div className="text-xs text-orange-600 mt-1">Awaiting collection</div>
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
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{company.contact.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{company.contact.phone}</span>
            </div>
            <div className="flex items-center gap-3">
              <Link className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-blue-600">{company.contact.website}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-sm">{company.location}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Document Uploads</span>
              <Badge variant="secondary">{company.recentActivity.uploads} this week</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Active Tasks</span>
              <Badge variant="secondary">{company.recentActivity.tasks} pending</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Update</span>
              <span className="text-sm font-medium">{company.recentActivity.lastUpdate}</span>
            </div>
            <div className="pt-2">
              <Button className="w-full" variant="outline">
                View Full Activity Log
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

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
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
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
            <Button variant="outline">Filter</Button>
            <Button variant="outline">Export</Button>
          </div>

          {/* Companies Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCompanies.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>

          {filteredCompanies.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No companies found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Button>
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