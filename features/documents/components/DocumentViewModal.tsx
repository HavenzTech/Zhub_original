"use client";

import DocumentPreview from "@/features/documents/components/DocumentPreview";
import DocumentChatPanel from "@/features/documents/components/DocumentChatPanel";
import type { Document } from "@/types/bms";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DocumentViewModalProps {
  document: Document | null;
  open: boolean;
  onClose: () => void;
  initialPage?: number; // Page to open PDF at (from source click)
}

export default function DocumentViewModal({
  document,
  open,
  onClose,
  initialPage = 1,
}: DocumentViewModalProps) {
  if (!document || !open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/80 z-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className="fixed z-50 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-lg"
        style={{
          top: '2.5vh',
          left: '1vw',
          width: '98vw',
          height: '95vh',
          overflow: 'hidden'
        }}
      >
        <div className="flex" style={{ height: '95vh', maxHeight: '95vh', overflow: 'hidden' }}>
          {/* Left Side: Document Preview */}
          <div
            className="border-r border-stone-200 dark:border-stone-700 flex flex-col"
            style={{ width: 'calc(98vw - 400px)', height: '95vh' }}
          >
            <div className="flex items-center justify-between p-4 border-b border-stone-200 dark:border-stone-700 flex-shrink-0">
              <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
                {document.name}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <DocumentPreview
                document={document}
                initialPage={initialPage}
                onDownload={(doc) => {
                  window.open(`/api/document-download/${doc.id}`, "_blank");
                }}
              />
            </div>
          </div>

          {/* Right Side: Chat Panel */}
          <div style={{ width: '400px', height: '95vh', maxHeight: '95vh', overflow: 'hidden', flexShrink: 0 }}>
            <DocumentChatPanel document={document} />
          </div>
        </div>
      </div>
    </>
  );
}
