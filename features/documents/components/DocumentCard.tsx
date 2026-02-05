import { memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, Star, AlertCircle, Shield } from "lucide-react";
import type { DocumentDto, DocumentClassification } from "@/types/bms";
import {
  formatFileSize,
  formatDate,
  getStatusColor,
  getAccessLevelColor,
  getAccessLevelIcon,
  getFileTypeIcon,
} from "../utils/documentHelpers";

interface DocumentCardProps {
  document: DocumentDto;
  onClick: (document: DocumentDto) => void;
  isFavorite?: boolean;
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

export const DocumentCard = memo(function DocumentCard({
  document,
  onClick,
  isFavorite,
}: DocumentCardProps) {
  const isCheckedOut = document.isCheckedOut;
  const classification = document.classification as DocumentClassification | undefined;

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow relative ${
        isCheckedOut ? 'ring-2 ring-yellow-400' : ''
      }`}
      onClick={() => onClick(document)}
    >
      {/* Checkout indicator */}
      {isCheckedOut && (
        <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1" title={`Checked out by ${document.checkedOutByUserName || 'someone'}`}>
          <Lock className="w-3 h-3 text-yellow-900" />
        </div>
      )}

      {/* Favorite indicator */}
      {isFavorite && (
        <div className="absolute -top-2 -left-2 text-yellow-500">
          <Star className="w-4 h-4 fill-current" />
        </div>
      )}

      {/* Legal hold indicator */}
      {document.legalHold && (
        <div className="absolute top-2 right-2 bg-red-100 rounded-full p-1" title="Legal Hold">
          <AlertCircle className="w-3 h-3 text-red-600" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              {getFileTypeIcon(document.fileType ?? undefined)}
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base truncate">
                {document.name}
              </CardTitle>
              <div className="flex items-center gap-2">
                <p className="text-sm text-gray-600">v{document.version}</p>
                {document.documentNumber && (
                  <span className="text-xs text-gray-400 font-mono">
                    {document.documentNumber}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-1 items-end flex-shrink-0 ml-2">
            <Badge className={`${getStatusColor(document.status)} text-xs`}>
              {document.status}
            </Badge>
            {classification && (
              <Badge className={`${getClassificationColor(classification)} text-xs flex items-center gap-1`}>
                <Shield className="w-3 h-3" />
                {classification}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          {/* Document Type */}
          {document.documentTypeName && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Doc Type:</span>
              <Badge variant="outline" className="text-xs">
                {document.documentTypeCode || document.documentTypeName}
              </Badge>
            </div>
          )}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium uppercase">
              {document.fileType || "N/A"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Size:</span>
            <span className="font-medium">
              {formatFileSize(document.fileSizeBytes ?? undefined)}
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

        <div className="pt-3 border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Updated {formatDate(document.updatedAt)}</span>
          {document.ownedByUserName && (
            <span className="text-gray-400">Owner: {document.ownedByUserName}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
