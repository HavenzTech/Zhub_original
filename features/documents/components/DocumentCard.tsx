import { memo } from "react";
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

interface DocumentCardProps {
  document: Document;
  onClick: (document: Document) => void;
}

export const DocumentCard = memo(function DocumentCard({
  document,
  onClick,
}: DocumentCardProps) {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onClick(document)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileTypeIcon(document.fileType)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {document.name}
              </CardTitle>
              <p className="text-sm text-gray-600">v{document.version}</p>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-2">
            <Badge className={`${getStatusColor(document.status)} text-xs`}>
              {document.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium uppercase">
              {document.fileType || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">
              {formatFileSize(document.fileSizeBytes)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 flex items-center gap-1">
              {getAccessLevelIcon(document.accessLevel)} Access:
            </span>
            <Badge
              className={`${getAccessLevelColor(
                document.accessLevel
              )} text-xs capitalize`}
            >
              {document.accessLevel}
            </Badge>
          </div>
          {document.category && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Category:</span>
              <Badge variant="secondary" className="text-xs capitalize">
                {document.category}
              </Badge>
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500">
          Updated {formatDate(document.updatedAt)}
        </div>
      </CardContent>
    </Card>
  );
});
