"use client"

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import DocumentPreview from "@/components/DocumentPreview"
import DocumentChatPanel from "@/components/DocumentChatPanel"
import type { Document } from "@/types/bms"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DocumentViewModalProps {
  document: Document | null
  open: boolean
  onClose: () => void
}

export default function DocumentViewModal({ document, open, onClose }: DocumentViewModalProps) {
  if (!document) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] h-[90vh] max-h-[90vh] p-0 gap-0 overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>{document.name}</DialogTitle>
        </VisuallyHidden>
        <div className="flex h-full max-h-full overflow-hidden">
          {/* Left Side: Document Preview */}
          <div className="flex-1 overflow-hidden border-r border-gray-200">
            <div className="h-full flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-gray-200 flex-shrink-0">
                <h2 className="text-lg font-semibold text-gray-900">{document.name}</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex-1 overflow-auto min-h-0">
                <DocumentPreview
                  document={document}
                  onDownload={(doc) => {
                    window.open(`http://localhost:5087/api/havenzhub/document/${doc.id}/download`, '_blank')
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Side: Chat Panel */}
          <div className="w-[400px] h-full max-h-full flex-shrink-0 overflow-hidden">
            <DocumentChatPanel document={document} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
