// app/document-control/page.tsx
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi"
import { authService } from "@/lib/services/auth"
import { Document, DocumentStatus, DocumentAccessLevel, DocumentCategory } from "@/types/bms"
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
  FolderOpen,
  X
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

export default function DocumentControlPage() {
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    status: "draft" as DocumentStatus,
    accessLevel: "private" as DocumentAccessLevel,
    category: "" as DocumentCategory | "",
    tags: ""
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

    loadDocuments()
  }, [router])

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-populate the document name from filename if not set
      if (!formData.name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "")
        setFormData({ ...formData, name: nameWithoutExt })
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }

    if (!formData.name.trim()) {
      toast.error("Document name is required")
      return
    }

    setIsUploading(true)
    try {
      // Calculate file hash
      const arrayBuffer = await selectedFile.arrayBuffer()
      const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer)
      const hashArray = Array.from(new Uint8Array(hashBuffer))
      const contentHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

      // Build payload - companyId and uploadedByUserId are set automatically from headers
      const payload: any = {
        name: formData.name,
        fileType: selectedFile.type || selectedFile.name.split('.').pop() || 'unknown',
        fileSizeBytes: selectedFile.size,
        contentHash,
        storagePath: `/uploads/${selectedFile.name}`,
        version: 1,
        status: formData.status,
        accessLevel: formData.accessLevel
      }

      // Only add optional fields if they have values
      if (formData.category) payload.category = formData.category
      if (formData.tags?.trim()) payload.tags = formData.tags.split(',').map(t => t.trim())

      payload.metadata = {
        originalFileName: selectedFile.name,
        uploadDate: new Date().toISOString()
      }

      const newDocument = await bmsApi.documents.create(payload)

      setDocuments(prev => [...prev, newDocument as Document])
      toast.success("Document uploaded successfully!")
      setShowUploadModal(false)

      // Reset form
      setSelectedFile(null)
      setFormData({
        name: "",
        status: "draft" as DocumentStatus,
        accessLevel: "private" as DocumentAccessLevel,
        category: "" as DocumentCategory | "",
        tags: ""
      })
    } catch (err) {
      const errorMessage = err instanceof BmsApiError ? err.message : 'Failed to upload document'
      toast.error(errorMessage)
      console.error('Error uploading document:', err)
    } finally {
      setIsUploading(false)
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
              {authService.hasPermission('create', 'document') && (
                <Button onClick={() => setShowUploadModal(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
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
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload First Document
              </Button>
            </div>
          )}
        </>
      ) : (
        <DocumentDetails document={selectedDocument} />
      )}

      {/* Upload Document Modal */}
      <Dialog open={showUploadModal} onOpenChange={setShowUploadModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Document</DialogTitle>
            <DialogDescription>
              Upload a new document to the system. Fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              {/* File Upload */}
              <div className="grid gap-2">
                <Label htmlFor="file">File *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    onChange={handleFileChange}
                    className="cursor-pointer"
                    required
                  />
                  {selectedFile && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(null)
                        const fileInput = document.getElementById('file') as HTMLInputElement
                        if (fileInput) fileInput.value = ''
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {selectedFile && (
                  <div className="text-sm text-gray-600">
                    <p>Selected: {selectedFile.name}</p>
                    <p>Size: {formatFileSize(selectedFile.size)}</p>
                    <p>Type: {selectedFile.type || 'Unknown'}</p>
                  </div>
                )}
              </div>

              {/* Document Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">Document Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter document name"
                  required
                />
              </div>

              {/* Status and Access Level */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value as DocumentStatus })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="accessLevel">Access Level</Label>
                  <Select
                    value={formData.accessLevel}
                    onValueChange={(value) => setFormData({ ...formData, accessLevel: value as DocumentAccessLevel })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="private">Private</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Category */}
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value as DocumentCategory })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="financial">Financial</SelectItem>
                    <SelectItem value="technical">Technical</SelectItem>
                    <SelectItem value="legal">Legal</SelectItem>
                    <SelectItem value="hr">HR</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tags */}
              <div className="grid gap-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., important, 2024, budget"
                />
                <p className="text-xs text-gray-500">Separate multiple tags with commas</p>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowUploadModal(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
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
