// components/DocumentPreview.tsx
"use client"

import { useState, useEffect } from "react"
import { Document } from "@/types/bms"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { authService } from "@/lib/services/auth"
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

// Spreadsheet Preview Component
function SpreadsheetPreview({ document, onDownload }: { document: Document, onDownload?: (doc: Document) => void }) {
  const [spreadsheetData, setSpreadsheetData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSpreadsheetData = async () => {
      try {
        setLoading(true)
        const response = await fetch('http://localhost:8001/preview-document', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            document_id: document.id,
            storage_path: document.storagePath,
            max_rows: 100
          })
        })

        const data = await response.json()

        if (data.error) {
          setError(data.error)
        } else {
          setSpreadsheetData(data)
        }
      } catch (err) {
        setError('Failed to load spreadsheet data')
      } finally {
        setLoading(false)
      }
    }

    fetchSpreadsheetData()
  }, [document.id, document.storagePath])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    )
  }

  if (error || !spreadsheetData) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center max-w-md px-6">
          <FileText className="w-20 h-20 text-green-600 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Excel Spreadsheet</h3>
          <p className="text-sm text-red-600 mb-4">{error || 'Could not load preview'}</p>
          <Button onClick={() => onDownload?.(document)}>
            <Download className="w-4 h-4 mr-2" />
            Download to view in Excel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white overflow-auto">
      <div className="p-4 border-b bg-green-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{document.name}</h3>
            <p className="text-sm text-gray-600">
              Showing {spreadsheetData.row_count} of {spreadsheetData.total_rows} rows • {spreadsheetData.columns.length} columns
            </p>
          </div>
          <Button onClick={() => onDownload?.(document)} size="sm">
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>
      <div className="overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {spreadsheetData.columns.map((col: string, idx: number) => (
                <th key={idx} className="px-4 py-2 text-left font-semibold text-gray-700 border-b">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {spreadsheetData.data.map((row: any, rowIdx: number) => (
              <tr key={rowIdx} className="hover:bg-gray-50">
                {spreadsheetData.columns.map((col: string, colIdx: number) => (
                  <td key={colIdx} className="px-4 py-2 border-b text-gray-900">
                    {row[col] !== null && row[col] !== undefined ? String(row[col]) : ''}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function DocumentPreview({ document, onDownload }: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100)
  const [loading, setLoading] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)

  // Fetch document with authentication and create blob URL
  useEffect(() => {
    if (!document) return

    const fetchDocument = async () => {
      try {
        setLoading(true)
        console.log('[DocumentPreview] Document object:', document)
        console.log('[DocumentPreview] Document ID:', document.id)
        const token = authService.getToken()
        const companyId = authService.getCurrentCompanyId()

        const response = await fetch(`/api/document-download/${document.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'X-Company-Id': companyId || ''
          }
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error('[DocumentPreview] Failed to fetch document:', errorText)
          console.error('[DocumentPreview] Status:', response.status)
          setPreviewError(true)
          return
        }

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        setBlobUrl(url)
      } catch (error) {
        console.error('Error fetching document:', error)
        setPreviewError(true)
      } finally {
        setLoading(false)
      }
    }

    fetchDocument()

    // Cleanup blob URL when component unmounts or document changes
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl)
      }
    }
  }, [document?.id])

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
    if (lowerType.includes('xls') || lowerType.includes('sheet') || lowerType.includes('csv')) {
      return <FileText className="w-5 h-5 text-green-600" />
    }
    if (lowerType.includes('doc') || lowerType.includes('word')) {
      return <FileText className="w-5 h-5 text-blue-600" />
    }
    if (lowerType.includes('txt') || lowerType.includes('text')) {
      return <File className="w-5 h-5 text-gray-600" />
    }
    return <File className="w-5 h-5 text-gray-600" />
  }

  const renderPreview = () => {
    if (!blobUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )
    }

    if (previewError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading preview</h3>
            <p className="text-sm text-gray-500 mb-4">
              Unable to load the document preview
            </p>
            <Button onClick={() => onDownload?.(document)}>
              <Download className="w-4 h-4 mr-2" />
              Download file
            </Button>
          </div>
        </div>
      )
    }

    const fileType = document.fileType?.toLowerCase() || ''

    // PDF Preview
    if (fileType.includes('pdf')) {
      return (
        <div className="h-full bg-gray-50 relative">
          <iframe
            key={document.id}
            src={`${blobUrl}#view=FitH`}
            className="w-full h-full border-0"
            title={document.name}
          />
        </div>
      )
    }

    // Image Preview
    if (fileType.includes('image') || fileType.includes('png') || fileType.includes('jpg') || fileType.includes('jpeg')) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 overflow-auto p-4">
          <img
            key={document.id}
            src={blobUrl}
            alt={document.name}
            style={{ transform: `scale(${zoom / 100})` }}
            className="max-w-full h-auto shadow-lg"
            onError={(e) => {
              console.error('Image load error for:', document.name)
              setPreviewError(true)
            }}
          />
        </div>
      )
    }

    // TXT File Preview
    if (fileType.includes('txt') || fileType.includes('text/plain')) {
      return (
        <div className="h-full bg-gray-50 overflow-auto p-6">
          <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800 bg-white p-4 rounded border">
            {/* Content loaded from blobUrl */}
            <iframe
              key={document.id}
              src={blobUrl}
              className="w-full h-full border-0"
              title={document.name}
              style={{ minHeight: '600px' }}
            />
          </pre>
        </div>
      )
    }

    // CSV File Preview
    if (fileType.includes('csv')) {
      return (
        <div className="h-full bg-gray-50 overflow-auto p-6">
          <div className="bg-white p-4 rounded border">
            <p className="text-sm text-gray-600 mb-4">CSV File: {document.name}</p>
            <iframe
              key={document.id}
              src={blobUrl}
              className="w-full border-0"
              title={document.name}
              style={{ minHeight: '600px' }}
            />
          </div>
        </div>
      )
    }

    // Excel/Spreadsheet Preview - Show actual data
    if (fileType.includes('xls') || fileType.includes('sheet') || fileType.includes('csv')) {
      return <SpreadsheetPreview document={document} onDownload={onDownload} />
    }

    // DOCX/Word Document Preview (placeholder)
    if (fileType.includes('doc') || fileType.includes('word')) {
      return (
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-50 to-purple-50">
          <div className="text-center max-w-md px-6">
            <FileText className="w-20 h-20 text-blue-600 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Word Document</h3>
            <p className="text-base text-gray-700 mb-2 font-medium">
              {document.name}
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Ask AI questions about your document using the chat panel →
            </p>
            <div className="space-y-2">
              <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-blue-200">
                <p className="text-xs font-semibold text-blue-700 mb-1">💡 Try asking:</p>
                <p className="text-xs text-gray-600">"Summarize this document"</p>
                <p className="text-xs text-gray-600">"What are the key points?"</p>
                <p className="text-xs text-gray-600">"Extract important dates"</p>
              </div>
            </div>
            <Button onClick={() => onDownload?.(document)} className="mt-6">
              <Download className="w-4 h-4 mr-2" />
              Download to view in Word
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
