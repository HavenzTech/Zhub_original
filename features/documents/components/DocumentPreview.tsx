// features/documents/components/DocumentPreview.tsx
"use client";

import { useState, useEffect } from "react";
import { Document, DocumentDownloadResponse } from "@/types/bms";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bmsApi } from "@/lib/services/bmsApi";
import Image from "next/image";
import {
  Download,
  ZoomIn,
  ZoomOut,
  Maximize,
  FileText,
  Image as ImageIcon,
  File,
  Loader2,
} from "lucide-react";

interface DocumentPreviewProps {
  document: Document | null;
  onDownload?: (document: Document) => void;
}

export default function DocumentPreview({
  document,
  onDownload,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Fetch document directly from backend API and then from GCS
  useEffect(() => {
    if (!document || !document.id) return;

    // Track the current blob URL for cleanup
    let currentBlobUrl: string | null = null;
    let cancelled = false;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setPreviewError(false);
        console.log("[DocumentPreview] Document object:", document);
        console.log("[DocumentPreview] Document ID:", document.id);

        // Get signed URL from backend API
        const downloadData: DocumentDownloadResponse = await bmsApi.documents.getDownloadUrl(document.id!);
        console.log("[DocumentPreview] Download response:", downloadData);

        if (!downloadData.downloadUrl) {
          console.error("[DocumentPreview] No download URL in response");
          if (!cancelled) setPreviewError(true);
          return;
        }

        // Fetch the file directly from GCS using the signed URL
        const response = await fetch(downloadData.downloadUrl);

        if (!response.ok) {
          console.error("[DocumentPreview] Failed to fetch from GCS:", response.status);
          if (!cancelled) setPreviewError(true);
          return;
        }

        const blob = await response.blob();
        if (!cancelled) {
          currentBlobUrl = URL.createObjectURL(blob);
          setBlobUrl(currentBlobUrl);
        }
      } catch (error) {
        console.error("[DocumentPreview] Error fetching document:", error);
        if (!cancelled) setPreviewError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDocument();

    // Cleanup blob URL when component unmounts or document changes
    return () => {
      cancelled = true;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [document?.id]);

  if (!document) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No document selected
            </h3>
            <p className="text-sm text-gray-500">
              Select a document from the tree to preview it here
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handleDownload = () => {
    if (blobUrl && document) {
      // Create a temporary link to trigger download
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else if (onDownload && document) {
      // Fallback to provided onDownload handler
      onDownload(document);
    }
  };

  const getFileTypeIcon = (type?: string) => {
    const lowerType = type?.toLowerCase() || "";
    if (lowerType.includes("pdf"))
      return <FileText className="w-5 h-5 text-red-600" />;
    if (
      lowerType.includes("image") ||
      lowerType.includes("png") ||
      lowerType.includes("jpg")
    ) {
      return <ImageIcon className="w-5 h-5 text-blue-600" />;
    }
    if (lowerType.includes("xls") || lowerType.includes("sheet")) {
      return <FileText className="w-5 h-5 text-green-600" />;
    }
    return <File className="w-5 h-5 text-gray-600" />;
  };

  const renderPreview = () => {
    if (!blobUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error loading preview
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Unable to load the document preview
            </p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download file
            </Button>
          </div>
        </div>
      );
    }

    const fileType = document.fileType?.toLowerCase() || "";

    // PDF Preview
    if (fileType.includes("pdf")) {
      return (
        <div className="h-full bg-gray-50 relative">
          <iframe
            key={document.id}
            src={`${blobUrl}#view=FitH`}
            className="w-full h-full border-0"
            title={document.name}
          />
        </div>
      );
    }

    // Image Preview
    if (
      fileType.includes("image") ||
      fileType.includes("png") ||
      fileType.includes("jpg") ||
      fileType.includes("jpeg")
    ) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50 overflow-auto p-4">
          <Image
            key={document.id}
            src={blobUrl}
            alt={document.name}
            style={{ transform: `scale(${zoom / 100})` }}
            className="max-w-full h-auto shadow-lg"
            onError={(e) => {
              console.error("Image load error for:", document.name);
              setPreviewError(true);
            }}
          />
        </div>
      );
    }

    // Excel/Spreadsheet Preview (placeholder)
    if (fileType.includes("xls") || fileType.includes("sheet")) {
      return (
        <div className="flex items-center justify-center h-full bg-gray-50">
          <div className="text-center">
            <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Spreadsheet Preview
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Excel preview coming soon
            </p>
            <Button onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Download to view
            </Button>
          </div>
        </div>
      );
    }

    // Default: No preview available
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Preview not available
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            This file type cannot be previewed in the browser
          </p>
          <Button onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download file
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileTypeIcon(document.fileType ?? undefined)}
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {document.name}
              </CardTitle>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomOut}
              disabled={zoom <= 50}
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetZoom}>
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
            >
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
  );
}
