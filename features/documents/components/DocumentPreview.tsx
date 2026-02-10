// features/documents/components/DocumentPreview.tsx
"use client";

import { useState, useEffect } from "react";
import { Document as BMSDocument, DocumentDownloadResponse } from "@/types/bms";
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
import PdfViewer from "./PdfViewer";

interface DocumentPreviewProps {
  document: BMSDocument | null;
  onDownload?: (document: BMSDocument) => void;
  initialPage?: number;
}

export default function DocumentPreview({
  document,
  onDownload,
  initialPage = 1,
}: DocumentPreviewProps) {
  const [zoom, setZoom] = useState(100);
  const [loading, setLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Fetch document directly from backend API and then from GCS
  useEffect(() => {
    if (!document || !document.id) return;

    let currentBlobUrl: string | null = null;
    let cancelled = false;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setPreviewError(false);
        console.log("[DocumentPreview] Document object:", document);
        console.log("[DocumentPreview] Document ID:", document.id);
        console.log("[DocumentPreview] Storage path:", document.storagePath);

        // Check if this is a local file (storagePath contains a local path)
        const storagePath = document.storagePath || "";
        const isLocalFile = storagePath && (
          storagePath.includes("example_files") ||
          storagePath.includes("local_uploads") ||
          storagePath.toLowerCase().startsWith("c:") ||  // Windows paths (case-insensitive)
          storagePath.startsWith("/") ||  // Unix paths
          storagePath.match(/^[a-zA-Z]:/)  // Any Windows drive letter
        );
        console.log("[DocumentPreview] isLocalFile:", isLocalFile, "storagePath:", storagePath);

        let downloadUrl: string | null = null;

        if (isLocalFile) {
          // Use Python backend for local files
          const pythonApiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001";
          downloadUrl = `${pythonApiUrl}/preview-pdf?path=${encodeURIComponent(document.storagePath!)}&page=${initialPage}`;
          console.log("[DocumentPreview] Using Python backend for local file:", downloadUrl);
        } else {
          // Use ASP.NET API for GCS-stored files
          const authData = localStorage.getItem("auth");
          if (authData) {
            const auth = JSON.parse(authData);
            if (auth.token) bmsApi.setToken(auth.token);
            if (auth.currentCompanyId) bmsApi.setCompanyId(auth.currentCompanyId);
          }

          const downloadData: DocumentDownloadResponse = await bmsApi.documents.getDownloadUrl(document.id!);
          console.log("[DocumentPreview] Download response:", downloadData);

          if (!downloadData.downloadUrl) {
            console.error("[DocumentPreview] No download URL in response");
            if (!cancelled) setPreviewError(true);
            return;
          }
          downloadUrl = downloadData.downloadUrl;
        }

        const response = await fetch(downloadUrl);

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
      } catch (error: any) {
        console.error("[DocumentPreview] Error fetching document:", error);
        // Log more details for BmsApiError
        if (error?.status) {
          console.error("[DocumentPreview] API Status:", error.status, "Code:", error.code, "Details:", error.details);
        }
        if (!cancelled) setPreviewError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      cancelled = true;
      if (currentBlobUrl) {
        URL.revokeObjectURL(currentBlobUrl);
      }
    };
  }, [document?.id, document?.storagePath, initialPage]);

  if (!document) {
    return (
      <div className="h-full bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-center h-full p-12">
          <div className="text-center">
            <FileText className="w-16 h-16 text-stone-300 dark:text-stone-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
              No document selected
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              Select a document from the tree to preview it here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 25, 50));
  const handleResetZoom = () => setZoom(100);

  const handleDownload = () => {
    if (blobUrl && document) {
      const link = window.document.createElement("a");
      link.href = blobUrl;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else if (onDownload && document) {
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
    return <File className="w-5 h-5 text-stone-500 dark:text-stone-400" />;
  };

  const renderPreview = () => {
    if (!blobUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
        </div>
      );
    }

    if (previewError) {
      return (
        <div className="flex items-center justify-center h-full bg-stone-50 dark:bg-stone-900">
          <div className="text-center">
            <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
              Error loading preview
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
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

    // PDF Preview with PdfViewer component
    if (fileType.includes("pdf")) {
      return (
        <PdfViewer
          fileUrl={blobUrl}
          initialPage={initialPage}
          zoom={zoom}
        />
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
        <div className="flex items-center justify-center h-full bg-stone-50 dark:bg-stone-900 overflow-auto p-4">
          <Image
            key={document.id}
            src={blobUrl}
            alt={document.name}
            width={800}
            height={600}
            style={{ transform: `scale(${zoom / 100})` }}
            className="max-w-full h-auto shadow-lg"
            onError={() => {
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
        <div className="flex items-center justify-center h-full bg-stone-50 dark:bg-stone-900">
          <div className="text-center">
            <FileText className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
              Spreadsheet Preview
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
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
      <div className="flex items-center justify-center h-full bg-stone-50 dark:bg-stone-900">
        <div className="text-center">
          <File className="w-16 h-16 text-stone-400 dark:text-stone-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-stone-900 dark:text-stone-50 mb-2">
            Preview not available
          </h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
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
    <div className="h-full flex flex-col bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700">
      <div className="px-4 py-3 border-b border-stone-200 dark:border-stone-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {getFileTypeIcon(document.fileType ?? undefined)}
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold text-stone-900 dark:text-stone-50 truncate">
                {document.name}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  v{document.version}
                </Badge>
                <span className="text-xs text-stone-500 dark:text-stone-400">
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
              className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium w-12 text-center text-stone-700 dark:text-stone-300">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleZoomIn}
              disabled={zoom >= 200}
              className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleResetZoom} className="text-stone-500 hover:text-stone-700 hover:bg-stone-100 dark:text-stone-400 dark:hover:text-stone-200 dark:hover:bg-stone-800">
              <Maximize className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="border-stone-300 text-stone-700 hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
          </div>
        ) : (
          renderPreview()
        )}
      </div>
    </div>
  );
}
