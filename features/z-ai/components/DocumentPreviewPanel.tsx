import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, AlertTriangle, ExternalLink } from "lucide-react"
import { getRelevanceScoreColor } from "../utils/chatHelpers"

interface PreviewPanelState {
  isOpen: boolean
  document: any
  content: string
  loading: boolean
  error: string | null
  downloadUrl?: string
}

interface DocumentPreviewPanelProps {
  previewPanel: PreviewPanelState
  onClose: () => void
}

export function DocumentPreviewPanel({
  previewPanel,
  onClose,
}: DocumentPreviewPanelProps) {
  if (!previewPanel.isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-lg shadow-xl w-full mx-4 max-h-[90vh] flex flex-col ${
          previewPanel.content === "pdf_embedded"
            ? "max-w-6xl"
            : "max-w-4xl"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Preview Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {previewPanel.document?.title || "Document Preview"}
              </h3>
              <p className="text-sm text-gray-600">
                {previewPanel.document?.parent_folder || "Unknown folder"}
              </p>
            </div>
            {previewPanel.document?.relevance_score && (
              <Badge
                variant="secondary"
                className={`text-xs ${getRelevanceScoreColor(
                  previewPanel.document.relevance_score
                )}`}
              >
                {previewPanel.document.relevance_score.toFixed(1)}% match
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {previewPanel.downloadUrl ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(previewPanel.downloadUrl, "_blank")}
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-hidden">
          {previewPanel.loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-600">
                  Loading document content...
                </span>
              </div>
            </div>
          ) : previewPanel.error ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <h4 className="font-semibold text-gray-900 mb-2">
                  Error Loading Document
                </h4>
                <p className="text-gray-600">{previewPanel.error}</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={onClose}
                >
                  Close
                </Button>
              </div>
            </div>
          ) : previewPanel.content === "pdf_embedded" &&
            previewPanel.downloadUrl ? (
            <div className="flex-1 flex flex-col">
              {/* PDF Viewer Header */}
              <div className="flex items-center justify-between p-3 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <FileText className="w-4 h-4" />
                  <span>PDF Viewer</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      window.open(previewPanel.downloadUrl, "_blank")
                    }
                  >
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Open in new tab
                  </Button>
                </div>
              </div>

              {/* PDF Embed */}
              <div className="flex-1 p-0 overflow-hidden">
                <iframe
                  src={previewPanel.downloadUrl}
                  className="w-full h-full border-0"
                  title="PDF Preview"
                />
              </div>
            </div>
          ) : (
            <div className="p-6 overflow-auto max-h-[calc(90vh-8rem)]">
              <pre className="whitespace-pre-wrap font-mono text-sm text-gray-800">
                {previewPanel.content}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
