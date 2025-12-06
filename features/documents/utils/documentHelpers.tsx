import React from "react";
import { File, FileText, Lock, Shield, Unlock } from "lucide-react";

/**
 * Format file size in bytes to human-readable format
 */
export const formatFileSize = (bytes?: number | null): string => {
  if (bytes === undefined || bytes === null) return "N/A";
  const mb = bytes / (1024 * 1024);
  if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${mb.toFixed(2)} MB`;
};

/**
 * Format date string to localized format
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

/**
 * Get badge color classes for document status
 */
export const getStatusColor = (status?: string | null): string => {
  switch (status) {
    case "approved":
      return "bg-green-100 text-green-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "rejected":
      return "bg-red-100 text-red-800";
    case "draft":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get badge color classes for access level
 */
export const getAccessLevelColor = (level?: string | null): string => {
  switch (level) {
    case "public":
      return "bg-blue-100 text-blue-800";
    case "private":
      return "bg-orange-100 text-orange-800";
    case "restricted":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Get icon component for access level
 */
export const getAccessLevelIcon = (level?: string | null): React.ReactElement => {
  switch (level) {
    case "public":
      return <Unlock className="w-4 h-4" />;
    case "private":
      return <Lock className="w-4 h-4" />;
    case "restricted":
      return <Shield className="w-4 h-4" />;
    default:
      return <Lock className="w-4 h-4" />;
  }
};

/**
 * Get icon component for file type
 */
export const getFileTypeIcon = (type?: string | null): React.ReactElement => {
  const lowerType = type?.toLowerCase() || "";
  if (lowerType.includes("pdf"))
    return <FileText className="w-6 h-6 text-red-600" />;
  if (lowerType.includes("doc"))
    return <FileText className="w-6 h-6 text-blue-600" />;
  if (lowerType.includes("xls") || lowerType.includes("sheet"))
    return <FileText className="w-6 h-6 text-green-600" />;
  if (lowerType.includes("ppt"))
    return <FileText className="w-6 h-6 text-orange-600" />;
  if (lowerType.includes("txt"))
    return <File className="w-6 h-6 text-gray-600" />;
  return <FileText className="w-6 h-6 text-gray-600" />;
};
