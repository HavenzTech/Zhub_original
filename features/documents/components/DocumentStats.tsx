import { Card, CardContent } from "@/components/ui/card";
import type { DocumentDto, DocumentClassification } from "@/types/bms";
import { formatFileSize } from "../utils/documentHelpers";
import { FileText, CheckCircle, Clock, FolderOpen, Lock, AlertTriangle, Shield } from "lucide-react";

interface DocumentStatsProps {
  documents: DocumentDto[];
  checkedOutCount?: number;
  needsReviewCount?: number;
  className?: string;
}

export function DocumentStats({
  documents,
  checkedOutCount,
  needsReviewCount,
  className = "",
}: DocumentStatsProps) {
  const totalSize = documents.reduce(
    (sum, d) => sum + (d.fileSizeBytes || 0),
    0
  );
  const approvedCount = documents.filter((d) => d.status === "approved" || d.status === "published").length;
  const pendingCount = documents.filter((d) => d.status === "pending" || d.status === "pending_review" || d.status === "draft").length;

  // Calculate checked out from documents if not provided
  const checkedOut = checkedOutCount ?? documents.filter((d) => d.isCheckedOut).length;

  // Classification breakdown
  const classificationCounts = documents.reduce((acc, d) => {
    const classification = (d.classification as DocumentClassification) || 'internal';
    acc[classification] = (acc[classification] || 0) + 1;
    return acc;
  }, {} as Record<DocumentClassification, number>);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {documents.length}
                </div>
                <div className="text-sm text-gray-600">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {approvedCount}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {pendingCount}
                </div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Lock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">
                  {checkedOut}
                </div>
                <div className="text-sm text-gray-600">Checked Out</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {needsReviewCount !== undefined && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {needsReviewCount}
                  </div>
                  <div className="text-sm text-gray-600">Needs Review</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FolderOpen className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-lg font-bold text-gray-900">
                  {formatFileSize(totalSize)}
                </div>
                <div className="text-sm text-gray-600">Total Size</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Classification Breakdown */}
      {Object.keys(classificationCounts).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">By Classification</span>
            </div>
            <div className="flex flex-wrap gap-4">
              {classificationCounts.public > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm text-gray-600">Public: {classificationCounts.public}</span>
                </div>
              )}
              {classificationCounts.internal > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-sm text-gray-600">Internal: {classificationCounts.internal}</span>
                </div>
              )}
              {classificationCounts.confidential > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500" />
                  <span className="text-sm text-gray-600">Confidential: {classificationCounts.confidential}</span>
                </div>
              )}
              {classificationCounts.restricted > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm text-gray-600">Restricted: {classificationCounts.restricted}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
