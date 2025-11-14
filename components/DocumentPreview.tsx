// components/DocumentPreview.tsx
"use client"

import { useState } from "react"
import { Document } from "@/types/bms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileText,
  Image as ImageIcon,
  File,
  Loader2
} from "lucide-react"

interface DocumentPreviewProps {
  document: Document | null
  onDownload?: (document: Document) => void
}

export default function DocumentPreview({ document, onDownload }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)

  if (!document) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No document selected</h3>
            <p className="text-sm text-gray-500">
              Select a document from the tree to preview it here
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50))
  const handleResetZoom = () => setZoom(100)

  const getFileTypeIcon = (type?: string) => {
    const lowerType = type?.toLowerCase() || ''
    if (lowerType.includes('pdf')) return <FileText className="w-5 h-5 text-red-600" />
    if (lowerType.includes('image') || lowerType.includes('png') || lowerType.includes('jpg')) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />
    }
    if (lowerType.includes('xls') || lowerType.includes('sheet')) {
      return <FileText className="w-5 h-5 text-green-600" />
    }
    return <File className="w-5 h-5 text-gray-600" />
  }

  const renderPreview = () => {
    const fileType = document.fileType?.toLowerCase() || ''

    // PDF Preview
    if (fileType.includes('pdf')) {
      // Construct filename with extension
      const fileName = document.name.includes('.') ? document.name : `${document.name}.pdf`
      const previewUrl = `/api/preview-document?name=${encodeURIComponent(fileName)}`

      // Only show 2 synced files for now (Get_Started_With_Smallpdf.pdf and sample.pdf)
      const syncedFiles = ['Get_Started_With_Smallpdf.pdf', 'sample.pdf', 'Get_Started_With_Smallpdf', 'sample']
      const isFileSynced = syncedFiles.some(f => fileName.includes(f) || f.includes(fileName))

      if (!isFileSynced) {
        return (
          <div className="flex items-center justify-center h-full bg-gray-50">
            <div className="text-center max-w-md p-8">
              <FileText className="w-20 h-20 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{document.name}</h3>
              <Badge variant="secondary" className="mb-4">PDF Document</Badge>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-orange-800 mb-2">
                  <strong>⚠️ Preview Not Available</strong>
                </p>
                <p className="text-xs text-orange-700">
                  This document hasn't been synced to the AI system yet.
                  Only documents in the Google Drive folder can be analyzed.
                </p>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Available for analysis:</strong><br/>
                • Get_Started_With_Smallpdf.pdf<br/>
                • sample.pdf
              </p>
              <Button onClick={() => onDownload?.(document)} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
            </div>
          </div>
        )
      }

      return (
        <div className="h-full bg-gray-50 relative">
          <iframe
            key={document.id}
            src={`${previewUrl}#view=FitH`}
            className="w-full h-full border-0"
            title={document.name}
          />
        </div>
      )
    }

    // Image Preview
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg')) {
      const fileName = document.name
      const previewUrl = `/api/preview-document?name=${encodeURIComponent(fileName)}&id=${document.id}`

      return (
        <div className="flex items-center justify-center h-full bg-gray-50 overflow-auto p-4">
          <img
            key={document.id} // Force remount when document changes
            src={previewUrl}
            alt={document.name}
            style={{ transform: `scale(${zoom / 100})` }}
            className="max-w-full h-auto shadow-lg"
            onError={(e) => {
              console.error('Image load error for:', document.name)
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>
      )
    }

    // Excel/Spreadsheet Preview (placeholder)
    if (fileType.includes('xls') || fileType.includes('sheet')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Spreadsheet Preview</h3>
            <p className="text-sm text-gray-500 mb-4">
              Excel preview coming soon
            </p>
            <Button onClick={() => onDownload?.(document)}>
              <Download className="w-4 h-4 mr-2" />
              Download to view
            </Button>
          </div>
        </div>
      )
    }

    // Default: No preview available
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Preview not available</h3>
          <p className="text-sm text-gray-500 mb-4">
            This file type cannot be previewed in the browser
          </p>
          <Button onClick={() => onDownload?.(document)}>
            <Download className="w-4 h-4 mr-2" />
            Download file
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileTypeIcon(document.fileType)}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">{document.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  v{document.version}
                </Badge>
                <span className="text-xs text-gray-500">
                  {document.fileType?.toUpperCase()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleZoomOut} disabled={zoom <= 50}>
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">{zoom}%</span>
            <Button variant="ghost" size="sm" onClick={handleZoomIn} disabled={zoom >= 200}>
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetZoom}>
              <Maximize className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => onDownload?.(document)}>
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          renderPreview()
        )}
      </CardContent>
    </Card>
  )
}
