import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { DocumentDto, DocumentClassification } from "@/types/bms";
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
  Lock,
  Unlock,
  Shield,
  History,
  Share2,
  Users,
  AlertCircle,
  Clock,
  User,
  GitBranch,
} from "lucide-react";

interface DocumentDetailsProps {
  document: DocumentDto;
  onBack: () => void;
  onCheckout?: () => void;
  onCheckin?: () => void;
  onShare?: () => void;
  onStartWorkflow?: () => void;
  currentUserId?: string;
}

const getClassificationColor = (classification?: DocumentClassification | null): string => {
  switch (classification) {
    case 'public':
      return 'bg-green-100 text-green-800';
    case 'internal':
      return 'bg-blue-100 text-blue-800';
    case 'confidential':
      return 'bg-orange-100 text-orange-800';
    case 'restricted':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export function DocumentDetails({
  document,
  onBack,
  onCheckout,
  onCheckin,
  onShare,
  onStartWorkflow,
  currentUserId
}: DocumentDetailsProps) {
  const classification = document.classification as DocumentClassification | undefined;
  const isCheckedOut = document.isCheckedOut;
  const isCheckedOutByMe = isCheckedOut && document.checkedOutByUserId === currentUserId;
  const isCheckedOutByOther = isCheckedOut && document.checkedOutByUserId !== currentUserId;

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack}>
        ← Back to Documents
      </Button>

      {/* Legal Hold Warning */}
      {document.legalHold && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <div>
            <div className="font-medium text-red-800">Legal Hold Active</div>
            <div className="text-sm text-red-600">This document cannot be modified or deleted.</div>
          </div>
        </div>
      )}

      {/* Checkout Warning */}
      {isCheckedOutByOther && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
          <Lock className="w-5 h-5 text-yellow-600" />
          <div>
            <div className="font-medium text-yellow-800">Document Checked Out</div>
            <div className="text-sm text-yellow-600">
              Checked out by {document.checkedOutByUserName || 'another user'}
              {document.checkOutExpiresAt && ` until ${formatDate(document.checkOutExpiresAt)}`}
            </div>
          </div>
        </div>
      )}

      {/* Document Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6 mb-6">
            <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center relative">
              {getFileTypeIcon(document.fileType)}
              {isCheckedOut && (
                <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                  <Lock className="w-4 h-4 text-yellow-900" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">
                  {document.name}
                </h1>
                {document.documentNumber && (
                  <Badge variant="outline" className="font-mono">
                    {document.documentNumber}
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 mb-4">
                Version {document.version}
                {document.documentTypeName && (
                  <span className="ml-2 text-gray-400">• {document.documentTypeName}</span>
                )}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                <Badge className={getStatusColor(document.status)}>
                  {document.status}
                </Badge>
                {classification && (
                  <Badge className={`${getClassificationColor(classification)} flex items-center gap-1`}>
                    <Shield className="w-3 h-3" />
                    {classification}
                  </Badge>
                )}
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
                {document.legalHold && (
                  <Badge className="bg-red-100 text-red-800">
                    Legal Hold
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
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
                  <span className="text-gray-600">Owner:</span>
                  <div className="font-medium">
                    {document.ownedByUserName || document.uploadedByUserName || "N/A"}
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Document ID:</span>
                  <div className="font-medium font-mono text-xs">
                    {document.id ? `${document.id.slice(0, 8)}...` : "N/A"}
                  </div>
                </div>
              </div>

              {document.description && (
                <div className="mt-4 text-sm text-gray-600">
                  {document.description}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>

              {/* Checkout/Checkin buttons */}
              {!isCheckedOut && !document.legalHold && onCheckout && (
                <Button variant="outline" onClick={onCheckout}>
                  <Lock className="w-4 h-4 mr-2" />
                  Check Out
                </Button>
              )}
              {isCheckedOutByMe && onCheckin && (
                <Button variant="outline" onClick={onCheckin}>
                  <Unlock className="w-4 h-4 mr-2" />
                  Check In
                </Button>
              )}

              {!isCheckedOutByOther && !document.legalHold && (
                <Button variant="outline">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              )}

              {onShare && (
                <Button variant="outline" onClick={onShare}>
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              )}

              {onStartWorkflow && document.status === 'draft' && (
                <Button variant="outline" onClick={onStartWorkflow}>
                  <GitBranch className="w-4 h-4 mr-2" />
                  Start Workflow
                </Button>
              )}
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

        {/* Checkout Status */}
        {isCheckedOut && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-yellow-600" />
                Checkout Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Checked Out By</span>
                <span className="text-sm font-medium">
                  {document.checkedOutByUserName || "Unknown"}
                </span>
              </div>
              {document.checkedOutAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Checked Out At</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.checkedOutAt)}
                  </span>
                </div>
              )}
              {document.checkOutExpiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Expires At</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.checkOutExpiresAt)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Approval Info */}
        {document.approvedByUserId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-600" />
                Approval
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Approved By</span>
                <span className="text-sm font-medium">
                  {document.approvedByUserName || "Unknown"}
                </span>
              </div>
              {document.approvedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Approved At</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.approvedAt)}
                  </span>
                </div>
              )}
              {document.approvalNotes && (
                <div>
                  <span className="text-sm text-gray-600">Notes:</span>
                  <div className="text-sm mt-1">
                    {document.approvalNotes}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Review Info */}
        {(document.reviewDate || document.lastReviewedAt) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Review Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.reviewDate && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Next Review</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.reviewDate)}
                  </span>
                </div>
              )}
              {document.reviewFrequencyDays && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Review Frequency</span>
                  <span className="text-sm font-medium">
                    Every {document.reviewFrequencyDays} days
                  </span>
                </div>
              )}
              {document.lastReviewedAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Reviewed</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.lastReviewedAt)}
                    {document.lastReviewedByUserName && ` by ${document.lastReviewedByUserName}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Retention Info */}
        {document.retentionPolicyId && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5 text-purple-600" />
                Retention
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {document.retentionExpiresAt && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Retention Expires</span>
                  <span className="text-sm font-medium">
                    {formatDate(document.retentionExpiresAt)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Legal Hold</span>
                <Badge variant={document.legalHold ? "destructive" : "secondary"}>
                  {document.legalHold ? "Active" : "None"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
