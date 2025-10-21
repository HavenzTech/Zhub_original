// app/document-control/page.tsx
"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  FolderOpen,
  Download,
  Eye,
  Edit,
  Trash2,
  Share,
  Lock,
  Unlock,
  History,
  Tag,
  Calendar,
  User,
  Building2,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MoreHorizontal,
  Plus,
  Star,
  Copy,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  Folder,
  FolderPlus,
  X,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedBy: string
  uploadDate: string
  lastModified: string
  company: string
  project?: string
  department: string
  status: "approved" | "pending" | "rejected" | "draft"
  version: string
  tags: string[]
  accessLevel: "public" | "private" | "restricted"
  auditTrail: {
    action: string
    user: string
    timestamp: string
  }[]
}

interface TreeNode {
  id: string
  name: string
  type: "folder" | "file"
  path?: string
  size?: number
  lastModified?: string
  children?: TreeNode[]
  document?: Document
  isExpanded?: boolean
}

export default function DocumentControlPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list" | "tree">("tree")
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [treeNodes, setTreeNodes] = useState<TreeNode[]>([])
  const [selectedNode, setSelectedNode] = useState<string | null>(null)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle')
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<TreeNode | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchDebounceTimer, setSearchDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const [previewFile, setPreviewFile] = useState<TreeNode | null>(null)
  const [previewData, setPreviewData] = useState<any>(null)
  const [isPreviewLoading, setIsPreviewLoading] = useState(false)
  const [showPreviewPanel, setShowPreviewPanel] = useState(false)
  const [previewPanelCollapsed, setPreviewPanelCollapsed] = useState(false)

  const documents: Document[] = [
    {
      id: "DOC-001",
      name: "Service_Agreement_2025.pdf",
      type: "PDF",
      size: "2.4 MB",
      uploadedBy: "John Smith",
      uploadDate: "2025-01-15",
      lastModified: "2025-01-15",
      company: "AHI Red Deer",
      project: "Infrastructure Upgrade",
      department: "Legal",
      status: "approved",
      version: "1.0",
      tags: ["contract", "legal", "2025"],
      accessLevel: "restricted",
      auditTrail: [
        { action: "Uploaded", user: "John Smith", timestamp: "2025-01-15 09:30" },
        { action: "Reviewed", user: "Legal Team", timestamp: "2025-01-15 14:20" },
        { action: "Approved", user: "Sarah Johnson", timestamp: "2025-01-15 16:45" }
      ]
    },
    {
      id: "DOC-002",
      name: "Budget_Q1_Report.xlsx",
      type: "Excel",
      size: "1.8 MB",
      uploadedBy: "Mike Chen",
      uploadDate: "2025-01-14",
      lastModified: "2025-01-14",
      company: "Havenz Tech",
      department: "Finance",
      status: "pending",
      version: "2.1",
      tags: ["budget", "financial", "Q1"],
      accessLevel: "private",
      auditTrail: [
        { action: "Uploaded", user: "Mike Chen", timestamp: "2025-01-14 11:15" },
        { action: "Modified", user: "Mike Chen", timestamp: "2025-01-14 15:30" }
      ]
    },
    {
      id: "DOC-003",
      name: "Security_Audit_Report.docx",
      type: "Word",
      size: "3.2 MB",
      uploadedBy: "Security Team",
      uploadDate: "2025-01-13",
      lastModified: "2025-01-13",
      company: "Denvr Dataworks",
      department: "Security",
      status: "approved",
      version: "1.3",
      tags: ["security", "audit", "compliance"],
      accessLevel: "restricted",
      auditTrail: [
        { action: "Uploaded", user: "Security Team", timestamp: "2025-01-13 08:00" },
        { action: "Reviewed", user: "CISO", timestamp: "2025-01-13 12:30" },
        { action: "Approved", user: "Management", timestamp: "2025-01-13 17:00" }
      ]
    },
    {
      id: "DOC-004",
      name: "Employee_Handbook_2025.pdf",
      type: "PDF",
      size: "4.1 MB",
      uploadedBy: "HR Department",
      uploadDate: "2025-01-12",
      lastModified: "2025-01-12",
      company: "Havenz Tech",
      department: "Human Resources",
      status: "approved",
      version: "3.0",
      tags: ["handbook", "HR", "policies"],
      accessLevel: "public",
      auditTrail: [
        { action: "Uploaded", user: "HR Department", timestamp: "2025-01-12 10:00" },
        { action: "Approved", user: "HR Manager", timestamp: "2025-01-12 14:00" }
      ]
    },
    {
      id: "DOC-005",
      name: "Project_Proposal_DataCenter.docx",
      type: "Word",
      size: "2.7 MB",
      uploadedBy: "Michael Torres",
      uploadDate: "2025-01-11",
      lastModified: "2025-01-11",
      company: "Denvr Dataworks",
      project: "Data Center Expansion",
      department: "Operations",
      status: "draft",
      version: "0.9",
      tags: ["proposal", "datacenter", "expansion"],
      accessLevel: "private",
      auditTrail: [
        { action: "Created", user: "Michael Torres", timestamp: "2025-01-11 08:30" },
        { action: "Modified", user: "Michael Torres", timestamp: "2025-01-11 16:45" }
      ]
    }
  ]

  // Initialize tree structure
  const initializeTree = () => {
    const tree: TreeNode[] = [
      {
        id: "root-companies",
        name: "Companies",
        type: "folder",
        isExpanded: true,
        children: [
          {
            id: "ahi-red-deer",
            name: "AHI Red Deer",
            type: "folder",
            isExpanded: false,
            children: [
              {
                id: "ahi-legal",
                name: "Legal",
                type: "folder",
                isExpanded: false,
                children: [
                  {
                    id: "DOC-001",
                    name: "Service_Agreement_2025.pdf",
                    type: "file",
                    document: documents.find(d => d.id === "DOC-001")
                  }
                ]
              }
            ]
          },
          {
            id: "havenz-tech",
            name: "Havenz Tech",
            type: "folder",
            isExpanded: false,
            children: [
              {
                id: "havenz-finance",
                name: "Finance",
                type: "folder",
                isExpanded: false,
                children: [
                  {
                    id: "DOC-002",
                    name: "Budget_Q1_Report.xlsx",
                    type: "file",
                    document: documents.find(d => d.id === "DOC-002")
                  }
                ]
              },
              {
                id: "havenz-hr",
                name: "Human Resources",
                type: "folder",
                isExpanded: false,
                children: [
                  {
                    id: "DOC-004",
                    name: "Employee_Handbook_2025.pdf",
                    type: "file",
                    document: documents.find(d => d.id === "DOC-004")
                  }
                ]
              }
            ]
          },
          {
            id: "denvr-dataworks",
            name: "Denvr Dataworks",
            type: "folder",
            isExpanded: false,
            children: [
              {
                id: "denvr-security",
                name: "Security",
                type: "folder",
                isExpanded: false,
                children: [
                  {
                    id: "DOC-003",
                    name: "Security_Audit_Report.docx",
                    type: "file",
                    document: documents.find(d => d.id === "DOC-003")
                  }
                ]
              },
              {
                id: "denvr-operations",
                name: "Operations",
                type: "folder",
                isExpanded: false,
                children: [
                  {
                    id: "DOC-005",
                    name: "Project_Proposal_DataCenter.docx",
                    type: "file",
                    document: documents.find(d => d.id === "DOC-005")
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
    setTreeNodes(tree)
  }

  // Load tree structure from backend
  const loadTreeStructure = async (search?: string) => {
    try {
      setIsSearching(true)
      const url = search ? `/api/files?search=${encodeURIComponent(search)}` : '/api/files'
      const response = await fetch(url)
      const data = await response.json()

      if (data.success && data.tree) {
        setTreeNodes(data.tree)
      } else {
        // Fallback to static tree if API fails
        initializeTree()
      }
    } catch (error) {
      console.error('Error loading tree structure:', error)
      // Fallback to static tree if API fails
      initializeTree()
    } finally {
      setIsSearching(false)
    }
  }

  // Initialize tree on component mount
  useEffect(() => {
    loadTreeStructure()
  }, [])

  // Debounced search handler
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)

    // Clear existing timer
    if (searchDebounceTimer) {
      clearTimeout(searchDebounceTimer)
    }

    // Set new timer for debounced search
    const newTimer = setTimeout(() => {
      if (value.trim() === '') {
        // Empty search - load full tree
        loadTreeStructure()
      } else {
        // Search with term
        loadTreeStructure(value.trim())
      }
    }, 300) // 300ms debounce

    setSearchDebounceTimer(newTimer)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer)
      }
    }
  }, [searchDebounceTimer])

  // Helper function to highlight search matches in text
  const highlightSearchTerm = (text: string, searchTerm: string) => {
    if (!searchTerm.trim()) return text

    const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi')
    const parts = text.split(regex)

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 text-yellow-900 px-1 rounded">
          {part}
        </span>
      ) : part
    )
  }

  const toggleNode = (nodeId: string, nodes: TreeNode[] = treeNodes): TreeNode[] => {
    return nodes.map(node => {
      if (node.id === nodeId) {
        return { ...node, isExpanded: !node.isExpanded }
      }
      if (node.children) {
        return { ...node, children: toggleNode(nodeId, node.children) }
      }
      return node
    })
  }

  const handleNodeToggle = (nodeId: string) => {
    setTreeNodes(toggleNode(nodeId))
  }

  const handleNodeClick = (node: TreeNode) => {
    if (node.type === "folder") {
      // For folders, toggle expansion and set as selected
      handleNodeToggle(node.id)
      setSelectedNode(node.id)
      // Close preview when clicking folders
      if (showPreviewPanel) {
        closePreview()
      }
    } else {
      // For files, select the node and load preview
      setSelectedNode(node.id)
      if (node.document) {
        setSelectedDocument(node.document)
      } else {
        // Load preview for dynamic files
        loadFilePreview(node)
      }
    }
  }

  // Upload functionality
  const handleFileUpload = async (files: File[], targetNodeId?: string) => {
    setUploadStatus('uploading')
    setUploadProgress(0)

    try {
      const formData = new FormData()
      files.forEach((file, index) => {
        formData.append(`file${index}`, file)
        formData.append(`path${index}`, file.webkitRelativePath || file.name)
      })

      if (targetNodeId) {
        // Find the selected node to get its path
        const findNodePath = (nodes: TreeNode[], nodeId: string): string | null => {
          for (const node of nodes) {
            if (node.id === nodeId) {
              return node.path || ''
            }
            if (node.children) {
              const childPath = findNodePath(node.children, nodeId)
              if (childPath !== null) return childPath
            }
          }
          return null
        }

        const nodePath = findNodePath(treeNodes, targetNodeId)
        formData.append('targetNode', targetNodeId)
        formData.append('targetPath', nodePath || '')
      }

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(interval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      // TODO: Replace with actual API call
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(interval)
      setUploadProgress(100)

      if (response.ok) {
        setUploadStatus('success')
        // Refresh tree structure after successful upload
        await loadTreeStructure()
        setTimeout(() => {
          setIsUploadDialogOpen(false)
          setUploadStatus('idle')
          setUploadProgress(0)
          setUploadedFiles([])
        }, 2000)
      } else {
        setUploadStatus('error')
      }

    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus('error')
    }
  }

  const handleFolderSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(files)
      handleFileUpload(files, selectedNode || undefined)
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(files)
      handleFileUpload(files, selectedNode || undefined)
    }
  }

  const openUploadDialog = () => {
    setIsUploadDialogOpen(true)
    setUploadStatus('idle')
    setUploadProgress(0)
    setUploadedFiles([])
  }

  // Delete functionality
  const handleDeleteClick = (node: TreeNode, event: React.MouseEvent) => {
    event.stopPropagation()
    setItemToDelete(node)
    setDeleteConfirmOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!itemToDelete || !itemToDelete.path) return

    try {
      const response = await fetch(`/api/delete?path=${encodeURIComponent(itemToDelete.path)}&type=${itemToDelete.type}`, {
        method: 'DELETE'
      })

      const result = await response.json()

      if (result.success) {
        // Refresh tree structure after successful deletion
        await loadTreeStructure()
        console.log(result.message)
      } else {
        console.error('Delete failed:', result.error)
        alert(`Delete failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Delete error:', error)
      alert('Delete operation failed')
    } finally {
      setDeleteConfirmOpen(false)
      setItemToDelete(null)
    }
  }

  // Preview functionality
  const loadFilePreview = async (file: TreeNode) => {
    if (!file.path || file.type !== 'file') return

    setIsPreviewLoading(true)
    setPreviewFile(file)
    setShowPreviewPanel(true)

    try {
      const response = await fetch(`/api/preview?path=${encodeURIComponent(file.path)}`)
      const data = await response.json()

      if (data.success) {
        setPreviewData(data)
      } else {
        setPreviewData({ error: data.error || 'Failed to load preview' })
      }
    } catch (error) {
      console.error('Preview error:', error)
      setPreviewData({ error: 'Failed to load file preview' })
    } finally {
      setIsPreviewLoading(false)
    }
  }

  const closePreview = () => {
    setShowPreviewPanel(false)
    setPreviewFile(null)
    setPreviewData(null)
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "approved" && doc.status === "approved") ||
                         (selectedFilter === "pending" && doc.status === "pending") ||
                         (selectedFilter === "recent" && new Date(doc.uploadDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "bg-green-100 text-green-800"
      case "pending": return "bg-yellow-100 text-yellow-800"
      case "rejected": return "bg-red-100 text-red-800"
      case "draft": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-4 h-4 text-green-600" />
      case "pending": return <Clock className="w-4 h-4 text-yellow-600" />
      case "rejected": return <AlertTriangle className="w-4 h-4 text-red-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const getAccessIcon = (level: string) => {
    switch (level) {
      case "restricted": return <Lock className="w-4 h-4 text-red-600" />
      case "private": return <Shield className="w-4 h-4 text-yellow-600" />
      case "public": return <Unlock className="w-4 h-4 text-green-600" />
      default: return <Lock className="w-4 h-4 text-gray-600" />
    }
  }

  const getFileTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf": return <FileText className="w-5 h-5 text-red-600" />
      case "excel": case "xlsx": return <FileText className="w-5 h-5 text-green-600" />
      case "word": case "docx": return <FileText className="w-5 h-5 text-blue-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  const TreeNodeComponent = ({ node, depth = 0 }: { node: TreeNode; depth?: number }) => {
    const indent = depth * 20

    return (
      <div>
        <div
          className={`group flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer transition-colors duration-150 ${
            selectedNode === node.id ? "bg-blue-50 border border-blue-200" : ""
          }`}
          style={{ paddingLeft: `${12 + indent}px` }}
          onClick={() => handleNodeClick(node)}
        >
          {/* Chevron icon - only show for folders */}
          <div className="w-4 h-4 flex items-center justify-center">
            {node.type === "folder" ? (
              node.isExpanded ? (
                <ChevronDown className="w-3 h-3 text-gray-600" />
              ) : (
                <ChevronRight className="w-3 h-3 text-gray-600" />
              )
            ) : null}
          </div>
          
          {/* Folder/File icon */}
          <div className="w-4 h-4 flex items-center justify-center">
            {node.type === "folder" ? (
              node.isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-600" />
              ) : (
                <Folder className="w-4 h-4 text-blue-600" />
              )
            ) : (
              getFileTypeIcon(node.document?.type || "file")
            )}
          </div>
          
          {/* Node name */}
          <span className="text-sm text-gray-900 truncate flex-1 select-none">
            {highlightSearchTerm(node.name, searchTerm)}
          </span>
          
          {/* File metadata (only for files) */}
          {node.type === "file" && (
            <div className="flex items-center gap-2 ml-auto">
              {/* Show size from either document or direct node properties */}
              <span className="text-xs text-gray-500">
                {node.document?.size || (node.size ? `${(node.size / 1024).toFixed(1)}KB` : '')}
              </span>
              {/* Show status icons only if document exists (for legacy data) */}
              {node.document && (
                <>
                  {getStatusIcon(node.document.status)}
                  {getAccessIcon(node.document.accessLevel)}
                </>
              )}
            </div>
          )}

          {/* Action buttons for files and folders */}
          <div className="flex items-center gap-1 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
            {node.type === "folder" && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedNode(node.id)
                  openUploadDialog()
                }}
                className="h-6 px-2 text-xs"
              >
                <Upload className="w-3 h-3 mr-1" />
                Upload
              </Button>
            )}

            {/* Delete button for both files and folders */}
            {node.path && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => handleDeleteClick(node, e)}
                className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>
        
        {/* Render children if folder is expanded */}
        {node.type === "folder" && node.isExpanded && node.children && (
          <div>
            {node.children.map((child) => (
              <TreeNodeComponent
                key={child.id}
                node={child}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  const DocumentRow = ({ document }: { document: Document }) => (
    <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4 flex-1">
        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
          {getFileTypeIcon(document.type)}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-gray-900 truncate">{document.name}</h3>
            {getStatusIcon(document.status)}
            {getAccessIcon(document.accessLevel)}
          </div>
          
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>{document.size}</span>
            <span className="flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              {document.company}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {document.uploadedBy}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {document.uploadDate}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(document.status)}>
            {document.status}
          </Badge>
          <span className="text-xs text-gray-500">v{document.version}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setSelectedDocument(document)}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Download className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Share className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )

  const PreviewPanel = () => (
    <div className={`${previewPanelCollapsed ? 'w-12' : 'w-1/3'} border-l border-gray-200 bg-white transition-all duration-300`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!previewPanelCollapsed && (
            <h3 className="font-semibold text-gray-900">File Preview</h3>
          )}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewPanelCollapsed(!previewPanelCollapsed)}
              title={previewPanelCollapsed ? 'Expand preview' : 'Collapse preview'}
            >
              {previewPanelCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
            {!previewPanelCollapsed && (
              <Button variant="ghost" size="sm" onClick={closePreview} title="Close preview">
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {previewPanelCollapsed ? (
        <div className="p-2 flex flex-col items-center gap-2">
          {previewFile && (
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              {getFileTypeIcon(previewFile.name.split('.').pop() || '')}
            </div>
          )}
        </div>
      ) : (
        <div className="p-4">
          {isPreviewLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">Loading preview...</span>
          </div>
        ) : previewFile && previewData ? (
          <div className="space-y-4">
            {/* File Header */}
            <div className="border-b border-gray-200 pb-4">
              <h4 className="font-medium text-gray-900 truncate">{previewFile.name}</h4>
              <div className="text-sm text-gray-500 mt-1">
                {previewData.metadata && (
                  <>
                    <div>Size: {(previewData.metadata.size / 1024).toFixed(1)} KB</div>
                    <div>Modified: {new Date(previewData.metadata.lastModified).toLocaleDateString()}</div>
                  </>
                )}
              </div>
            </div>

            {/* Preview Content */}
            {previewData.error ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-600 mb-4">{previewData.error}</p>
                {previewData.downloadUrl && (
                  <Button variant="outline" asChild>
                    <a href={previewData.downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                )}
              </div>
            ) : previewData.type === 'text' && previewData.content ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Text File</span>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(previewData.content)}>
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
                <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 border">
                  {previewData.content}
                </pre>
              </div>
            ) : previewData.type === 'pdf' && previewData.downloadUrl ? (
              <div className="space-y-4">
                <div className="text-sm text-gray-600">PDF Document</div>
                <iframe
                  src={previewData.downloadUrl}
                  className="w-full h-96 border rounded-lg"
                  title="PDF Preview"
                />
                <Button variant="outline" asChild className="w-full">
                  <a href={previewData.downloadUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="w-4 h-4 mr-2" />
                    Open in New Tab
                  </a>
                </Button>
              </div>
            ) : previewData.type === 'docx' ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">DOCX files require download to view</p>
                {previewData.note && (
                  <p className="text-sm text-gray-500 mb-4">{previewData.note}</p>
                )}
                {previewData.downloadUrl && (
                  <Button variant="outline" asChild>
                    <a href={previewData.downloadUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download DOCX
                    </a>
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">File type not supported for preview</p>
                {previewData.downloadUrl && (
                  <Button variant="outline" asChild>
                    <a href={previewData.downloadUrl} download>
                      <Download className="w-4 h-4 mr-2" />
                      Download File
                    </a>
                  </Button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Select a file to preview</p>
          </div>
        )}
        </div>
      )}
    </div>
  )

  const DocumentDetails = ({ document }: { document: Document }) => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedDocument(null)}>
          ← Back to Documents
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button variant="outline">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button variant="outline">
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>

      {/* Document Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-blue-50 rounded-xl flex items-center justify-center">
              {getFileTypeIcon(document.type)}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
                {getStatusIcon(document.status)}
                {getAccessIcon(document.accessLevel)}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                <div>
                  <span className="text-gray-600">Type:</span>
                  <div className="font-medium">{document.type}</div>
                </div>
                <div>
                  <span className="text-gray-600">Size:</span>
                  <div className="font-medium">{document.size}</div>
                </div>
                <div>
                  <span className="text-gray-600">Version:</span>
                  <div className="font-medium">v{document.version}</div>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button size="sm">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
                <Button variant="outline" size="sm">
                  <Star className="w-4 h-4 mr-2" />
                  Favorite
                </Button>
                <Button variant="outline" size="sm">
                  <History className="w-4 h-4 mr-2" />
                  Version History
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Document Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Document Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Company:</span>
              <span className="font-medium">{document.company}</span>
            </div>
            {document.project && (
              <div className="flex justify-between">
                <span className="text-gray-600">Project:</span>
                <span className="font-medium">{document.project}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Department:</span>
              <span className="font-medium">{document.department}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Uploaded By:</span>
              <span className="font-medium">{document.uploadedBy}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Upload Date:</span>
              <span className="font-medium">{new Date(document.uploadDate).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Modified:</span>
              <span className="font-medium">{new Date(document.lastModified).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Access Level:</span>
              <div className="flex items-center gap-2">
                {getAccessIcon(document.accessLevel)}
                <span className="font-medium capitalize">{document.accessLevel}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Tags & Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {document.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="cursor-pointer hover:bg-blue-100">
                  {tag}
                </Badge>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <Tag className="w-4 h-4 mr-2" />
              Manage Tags
            </Button>
            
            {/* Document Stats */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h4 className="font-medium text-gray-900 mb-3">Document Statistics</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Views:</span>
                  <span className="font-medium">47</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Downloads:</span>
                  <span className="font-medium">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shares:</span>
                  <span className="font-medium">3</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Blockchain Audit Trail
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {document.auditTrail.map((entry, index) => (
              <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <History className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{entry.action}</span>
                    <Badge variant="outline" className="text-xs">
                      Verified
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">by {entry.user}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">{entry.timestamp}</div>
                  <div className="text-xs text-blue-600">Block #4A7B9C2</div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 text-green-800 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Blockchain Verified</span>
            </div>
            <p className="text-xs text-green-700 mt-1">
              All document activities are recorded on an immutable blockchain ledger for complete audit transparency.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="space-y-6">
      {!selectedDocument ? (
        <>
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Control</h1>
              <p className="text-gray-600">Centralized document management with blockchain audit trails</p>
            </div>
            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openUploadDialog}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Files or Folders</DialogTitle>
                  <DialogDescription>
                    Choose files or an entire folder to upload. Folder structure will be preserved.
                    {selectedNode && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                        Uploading to: <span className="font-medium">{selectedNode}</span>
                      </div>
                    )}
                  </DialogDescription>
                </DialogHeader>

                {uploadStatus === 'idle' && (
                  <div className="space-y-4">
                    {/* Hidden file inputs */}
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <input
                      ref={folderInputRef}
                      type="file"
                      {...({ webkitdirectory: "" } as any)}
                      onChange={handleFolderSelect}
                      className="hidden"
                    />

                    {/* Upload Options */}
                    <div className="grid grid-cols-2 gap-4">
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="cursor-pointer p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
                      >
                        <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="font-medium text-gray-900">Upload Files</div>
                        <div className="text-sm text-gray-500">Select individual files</div>
                      </div>

                      <div
                        onClick={() => folderInputRef.current?.click()}
                        className="cursor-pointer p-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-center"
                      >
                        <Folder className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="font-medium text-gray-900">Upload Folder</div>
                        <div className="text-sm text-gray-500">Select entire folder with structure</div>
                      </div>
                    </div>
                  </div>
                )}

                {uploadStatus === 'uploading' && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <Upload className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
                      <div className="font-medium text-gray-900 mb-2">Uploading files...</div>
                      <Progress value={uploadProgress} className="w-full" />
                      <div className="text-sm text-gray-500 mt-2">{uploadProgress}% complete</div>
                    </div>
                    {uploadedFiles.length > 0 && (
                      <div className="max-h-32 overflow-y-auto">
                        <div className="text-sm font-medium text-gray-700 mb-2">Files being uploaded:</div>
                        {uploadedFiles.slice(0, 5).map((file, index) => (
                          <div key={index} className="text-xs text-gray-600 truncate">
                            {file.webkitRelativePath || file.name}
                          </div>
                        ))}
                        {uploadedFiles.length > 5 && (
                          <div className="text-xs text-gray-500">
                            ... and {uploadedFiles.length - 5} more files
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {uploadStatus === 'success' && (
                  <div className="text-center py-6">
                    <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                    <div className="font-medium text-gray-900 mb-2">Upload Successful!</div>
                    <div className="text-sm text-gray-500">
                      {uploadedFiles.length} file(s) uploaded successfully
                    </div>
                  </div>
                )}

                {uploadStatus === 'error' && (
                  <div className="text-center py-6">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <div className="font-medium text-gray-900 mb-2">Upload Failed</div>
                    <div className="text-sm text-gray-500">Please try again</div>
                  </div>
                )}

                <DialogFooter>
                  {uploadStatus === 'error' && (
                    <Button variant="outline" onClick={() => setUploadStatus('idle')}>
                      Try Again
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)}>
                    {uploadStatus === 'uploading' ? 'Cancel' : 'Close'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats Cards */}
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
                      {documents.filter(d => d.status === "approved").length}
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
                      {documents.filter(d => d.status === "pending").length}
                    </div>
                    <div className="text-sm text-gray-600">Pending Review</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-red-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {documents.filter(d => d.accessLevel === "restricted").length}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              {isSearching ? (
                <div className="w-4 h-4 absolute left-3 top-3 text-gray-400 animate-spin">
                  <div className="w-full h-full border-2 border-gray-300 border-t-blue-500 rounded-full"></div>
                </div>
              ) : (
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              )}
              <Input
                placeholder="Search files and folders..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange('')}
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="flex gap-2">
              {["all", "approved", "pending", "recent"].map((filter) => (
                <Button
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedFilter(filter)}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
            
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Advanced
            </Button>

            {/* View Mode Toggle */}
            <div className="flex gap-1 border border-gray-300 rounded-lg p-1">
              <Button
                variant={viewMode === "tree" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("tree")}
                className="px-2"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="px-2"
              >
                <FileText className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex gap-6">
            <div className={`${showPreviewPanel ? (previewPanelCollapsed ? 'w-full' : 'w-2/3') : 'w-full'} transition-all duration-300`}>
              {viewMode === "tree" ? (
                <div className="bg-white border border-gray-200 rounded-lg">
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">Document Tree</h3>
                      <div className="flex gap-2">
                        {showPreviewPanel && (
                          <Button variant="outline" size="sm" onClick={closePreview}>
                            <X className="w-4 h-4 mr-2" />
                            Close Preview
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <FolderPlus className="w-4 h-4 mr-2" />
                          New Folder
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    {treeNodes.map((node) => (
                      <TreeNodeComponent key={node.id} node={node} />
                    ))}
                  </div>
                  {treeNodes.length === 0 && (
                    <div className="text-center py-12">
                      <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No folders found</h3>
                      <p className="text-gray-600 mb-4">Create your first folder to organize documents</p>
                      <Button>
                        <FolderPlus className="w-4 h-4 mr-2" />
                        Create Folder
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredDocuments.map((document) => (
                    <DocumentRow key={document.id} document={document} />
                  ))}
                  {filteredDocuments.length === 0 && (
                    <div className="text-center py-12">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
                      <p className="text-gray-600 mb-4">Try adjusting your search criteria or upload a new document</p>
                      <Button>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload First Document
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview Panel */}
            {showPreviewPanel && <PreviewPanel />}
          </div>
        </>
      ) : (
        <DocumentDetails document={selectedDocument} />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {itemToDelete?.type === 'folder' ? 'Folder' : 'File'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-medium">"{itemToDelete?.name}"</span>?
              {itemToDelete?.type === 'folder' && (
                <span className="block mt-2 text-red-600 font-medium">
                  ⚠️ This will permanently delete the folder and all its contents.
                </span>
              )}
              <span className="block mt-2 text-sm text-gray-500">
                This action cannot be undone.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete {itemToDelete?.type === 'folder' ? 'Folder' : 'File'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}