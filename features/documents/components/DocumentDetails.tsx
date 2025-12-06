import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Document } from "@/types/bms";
import {
  formatFileSize,
  formatDate,
  getStatusColor,
  getAccessLevelColor,
  getAccessLevelIcon,
  getFileTypeIcon,
} from "../utils/documentHelpers";
import {
  FileText,
  Download,
  Edit,
  Calendar,
  Building2,
  FolderOpen,
} from "lucide-react";

interface DocumentDetailsProps {
  document: Document;
  onBack: () => void;
}

export function DocumentDetails({ document, onBack }: DocumentDetailsProps) {
  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {document.name}
              </h1>
              <p className="text-gray-600 mb-4">Version {document.version}</p>

              <div className="flex gap-3 mb-4">
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                <Badge
                  className={`${getAccessLevelColor(
                    document.accessLevel
                  )} flex items-center gap-1`}
                >
                  {getAccessLevelIcon(document.accessLevel)}
                  {document.accessLevel}
                </Badge>
                {document.category && (
                  <Badge variant="secondary" className="capitalize">
                    {document.category}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">File Type:</span>
                  <div className="font-medium uppercase">
                    {document.fileType || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">File Size:</span>
                  <div className="font-medium">
                    {formatFileSize(document.fileSizeBytes)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Document ID:</span>
                  <div className="font-medium font-mono text-xs">
                    {document.id ? `${document.id.slice(0, 8)}...` : "N/A"}
                  </div>
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
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Access Level</span>
              <Badge
                className={`${getAccessLevelColor(
                  document.accessLevel
                )} flex items-center gap-1`}
              >
                {getAccessLevelIcon(document.accessLevel)}
                {document.accessLevel}
              </Badge>
            </div>
            {document.category && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Category</span>
                <Badge variant="secondary" className="capitalize">
                  {document.category}
                </Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Version</span>
              <span className="text-sm font-medium">v{document.version}</span>
            </div>
            {document.contentHash && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Content Hash</span>
                <span className="text-sm font-mono">
                  {document.contentHash.slice(0, 16)}...
                </span>
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
              <span className="text-sm font-medium">
                {formatDate(document.createdAt)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Updated</span>
              <span className="text-sm font-medium">
                {formatDate(document.updatedAt)}
              </span>
            </div>
            {document.deletedAt && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Deleted</span>
                <span className="text-sm font-medium text-red-600">
                  {formatDate(document.deletedAt)}
                </span>
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
              <Badge variant="secondary" className="font-mono text-xs">
                {document.companyId ? `${document.companyId.slice(0, 8)}...` : "N/A"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Uploaded By</span>
              <Badge variant="secondary" className="font-mono text-xs">
                {document.uploadedByUserId ? `${document.uploadedByUserId.slice(0, 8)}...` : "N/A"}
              </Badge>
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
                {document.storagePath || "N/A"}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">File Size</span>
              <span className="text-sm font-medium">
                {formatFileSize(document.fileSizeBytes)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
