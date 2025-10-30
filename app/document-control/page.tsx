// app/document-control/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { Document } from "@/types/bms"
import { toast } from "sonner"
import {
  FileText,
  Upload,
  Search,
  Download,
  Eye,
  Edit,
  Trash2,
  Plus,
  Lock,
  Unlock,
  History,
  Calendar,
  User,
  Building2,
  Shield,
  CheckCircle,
  Clock,
  Loader2,
  RefreshCw,
  File,
  FolderOpen
} from 'lucide-react'

export default function DocumentControlPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await bmsApi.documents.getAll()
      setDocuments(data as Document[])
      toast.success(`Loaded ${(data as Document[]).length} documents`)
    } catch (err) {
      const errorMessage = err instanceof BmsApiError
        ? err.message
        : 'Failed to load documents'
      setError(errorMessage)
      toast.error(errorMessage)
      console.error('Error loading documents:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredDocuments = documents.filter(doc =>
    doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.fileType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.category?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A"
    const mb = bytes / (1024 * 1024)
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`
    return `${mb.toFixed(2)} MB`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case "public": return "bg-blue-100 text-blue-800"
      case "private": return "bg-orange-100 text-orange-800"
      case "restricted": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case "public": return <Unlock className="w-4 h-4" />
      case "private": return <Lock className="w-4 h-4" />
      case "restricted": return <Shield className="w-4 h-4" />
      default: return <Lock className="w-4 h-4" />
    }
  }

  const getFileTypeIcon = (type?: string) => {
    const lowerType = type?.toLowerCase() || ''
    if (lowerType.includes('pdf')) return <FileText className="w-6 h-6 text-red-600" />
    if (lowerType.includes('doc')) return <FileText className="w-6 h-6 text-blue-600" />
    if (lowerType.includes('xls') || lowerType.includes('sheet')) return <FileText className="w-6 h-6 text-green-600" />
    if (lowerType.includes('ppt')) return <FileText className="w-6 h-6 text-orange-600" />
    if (lowerType.includes('txt')) return <File className="w-6 h-6 text-gray-600" />
    return <FileText className="w-6 h-6 text-gray-600" />
  }

  const DocumentCard = ({ document }: { document: Document }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDocument(document)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileTypeIcon(document.fileType)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{document.name}</CardTitle>
              <p className="text-sm text-gray-600">v{document.version}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-2">
            <Badge className={getStatusColor(document.status)} className="text-xs">
              {document.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium uppercase">{document.fileType || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">{formatFileSize(document.fileSizeBytes)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              {getAccessLevelIcon(document.accessLevel)} Access:
            </span>
            <Badge className={getAccessLevelColor(document.accessLevel)} className="text-xs capitalize">
              {document.accessLevel}
            </Badge>
          </div>
          {document.category && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Category:</span>
              <Badge variant="secondary" className="text-xs capitalize">{document.category}</Badge>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
          Updated {formatDate(document.updatedAt)}
        </div>
      </CardContent>
    </Card>
  )

  const DocumentDetails = ({ document }: { document: Document }) => (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => setSelectedDocument(null)}>
        ← Back to Documents
      </Button>

      {/* Document Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center">
              {getFileTypeIcon(document.fileType)}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{document.name}</h1>
              <p className="text-gray-600 mb-4">Version {document.version}</p>

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                <Badge className={getAccessLevelColor(document.accessLevel)} className="flex items-center gap-1">
                  {getAccessLevelIcon(document.accessLevel)}
                  {document.accessLevel}
                </Badge>
                {document.category && (
                  <Badge variant="secondary" className="capitalize">{document.category}</Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File Type:</span>
                  <div className="font-medium uppercase">{document.fileType || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-gray-600">File Size:</span>
                  <div className="font-medium">{formatFileSize(document.fileSizeBytes)}</div>
                </div>
                <div>
                  <span className="text-gray-600">Document ID:</span>
                  <div className="font-medium font-mono text-xs">{document.id.slice(0, 8)}...</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Document Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Status</span>
              <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Access Level</span>
              <Badge className={getAccessLevelColor(document.accessLevel)} className="flex items-center gap-1">
                {getAccessLevelIcon(document.accessLevel)}
                {document.accessLevel}
              </Badge>
            </div>
            {document.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <Badge variant="secondary" className="capitalize">{document.category}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium">v{document.version}</span>
            </div>
            {document.contentHash && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Hash</span>
                <span className="text-sm font-mono text-xs">{document.contentHash.slice(0, 16)}...</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Timestamps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Created</span>
              <span className="text-sm font-medium">{formatDate(document.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">{formatDate(document.updatedAt)}</span>
            </div>
            {document.deletedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deleted</span>
                <span className="text-sm font-medium text-red-600">{formatDate(document.deletedAt)}</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Company ID</span>
              <Badge variant="secondary" className="font-mono text-xs">{document.companyId.slice(0, 8)}...</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uploaded By</span>
              <Badge variant="secondary" className="font-mono text-xs">{document.uploadedByUserId.slice(0, 8)}...</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Storage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <span className="text-sm text-gray-600">Storage Path:</span>
              <div className="font-medium font-mono text-xs mt-1 break-all">
                {document.storagePath || 'N/A'}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Size</span>
              <span className="text-sm font-medium">{formatFileSize(document.fileSizeBytes)}</span>
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
          <h3 className="text-lg font-medium text-gray-900 mb-2">Loading documents...</h3>
          <p className="text-gray-600">Please wait while we fetch your data</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <FileText className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading documents</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={loadDocuments}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {!selectedDocument ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Control</h1>
              <p className="text-gray-600">Manage and track all organizational documents</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={loadDocuments}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                    <div className="text-sm text-gray-600">Total Documents</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter(d => d.status === 'approved').length}
                    </div>
                    <div className="text-sm text-gray-600">Approved</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter(d => d.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FolderOpen className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-gray-900">
                      {formatFileSize(documents.reduce((sum, d) => sum + (d.fileSizeBytes || 0), 0))}
                    </div>
                    <div className="text-sm text-gray-600">Total Size</div>
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
                placeholder="Search documents..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="secondary">
              {filteredDocuments.length} {filteredDocuments.length === 1 ? 'document' : 'documents'}
            </Badge>
          </div>

          {/* Documents Grid */}
          {filteredDocuments.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredDocuments.map((document) => (
                <DocumentCard key={document.id} document={document} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? 'Try adjusting your search criteria' : 'Get started by uploading your first document'}
              </p>
              <Button>
                <Upload className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          )}
        </>
      ) : (
        <DocumentDetails document={selectedDocument} />
      )}
    </div>
  )
}
