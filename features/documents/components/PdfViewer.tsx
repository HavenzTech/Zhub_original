// features/documents/components/PdfViewer.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";

interface PdfViewerProps {
  fileUrl: string;
  initialPage?: number;
  zoom?: number;
}

export default function PdfViewer({ fileUrl, initialPage = 1, zoom = 100 }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Build URL with page parameter for browsers that support it
  // Chrome/Edge support #page=N, Firefox uses #page=N as well
  const pdfUrlWithPage = `${fileUrl}#page=${initialPage}&zoom=${zoom}&navpanes=0`;

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const openInNewTab = () => {
    window.open(pdfUrlWithPage, '_blank');
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-stone-100 dark:bg-stone-800">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to load PDF</p>
          <Button onClick={openInNewTab} variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open in new tab
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-stone-100 dark:bg-stone-800 relative flex flex-col">
      {/* Info bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-700">
        <span className="text-sm text-stone-500 dark:text-stone-400">
          {initialPage > 1 ? `Opening at page ${initialPage}` : 'PDF Viewer'}
        </span>
        <Button onClick={openInNewTab} variant="ghost" size="sm">
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in new tab
        </Button>
      </div>

      {/* PDF Embed */}
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-100 dark:bg-stone-800 z-10">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500 mx-auto mb-2" />
              <p className="text-sm text-stone-500 dark:text-stone-400">Loading PDF...</p>
            </div>
          </div>
        )}
        <iframe
          src={pdfUrlWithPage}
          className="w-full h-full border-0"
          onLoad={handleLoad}
          onError={handleError}
          title="PDF Viewer"
        />
      </div>
    </div>
  );
}
