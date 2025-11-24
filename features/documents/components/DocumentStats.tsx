import { Card, CardContent } from "@/components/ui/card";
import type { Document } from "@/types/bms";
import { formatFileSize } from "../utils/documentHelpers";
import { FileText, CheckCircle, Clock, FolderOpen } from "lucide-react";

interface DocumentStatsProps {
  documents: Document[];
  className?: string;
}

export function DocumentStats({
  documents,
  className = "",
}: DocumentStatsProps) {
  const totalSize = documents.reduce(
    (sum, d) => sum + (d.fileSizeBytes || 0),
    0
  );
  const approvedCount = documents.filter((d) => d.status === "approved").length;
  const pendingCount = documents.filter((d) => d.status === "pending").length;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-4 gap-6 ${className}`}>
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
              <div className="text-sm text-gray-600">Total Documents</div>
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
  );
}
