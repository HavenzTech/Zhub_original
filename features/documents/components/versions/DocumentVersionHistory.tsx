"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { History, Download, RotateCcw, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useDocumentVersions } from "@/lib/hooks/useDocumentVersions";
import type { DocumentVersionDto } from "@/types/bms";

interface DocumentVersionHistoryProps {
  documentId: string;
  currentVersion?: number;
  onDownload?: (versionNumber: number) => void;
}

export function DocumentVersionHistory({
  documentId,
  currentVersion,
  onDownload,
}: DocumentVersionHistoryProps) {
  const {
    versions,
    loading,
    loadVersions,
    downloadVersion,
    restoreVersion,
  } = useDocumentVersions(documentId);

  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersionDto | null>(null);
  const [restoreReason, setRestoreReason] = useState("");
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadVersions();
    }
  }, [documentId, loadVersions]);

  const handleDownload = async (versionNumber: number) => {
    if (onDownload) {
      onDownload(versionNumber);
    } else {
      const url = await downloadVersion(versionNumber);
      if (url) {
        window.open(url, "_blank");
      }
    }
  };

  const handleRestoreClick = (version: DocumentVersionDto) => {
    setSelectedVersion(version);
    setRestoreReason("");
    setRestoreDialogOpen(true);
  };

  const handleRestoreConfirm = async () => {
    if (!selectedVersion?.versionNumber) return;

    setIsRestoring(true);
    try {
      await restoreVersion(selectedVersion.versionNumber, restoreReason || undefined);
      setRestoreDialogOpen(false);
    } finally {
      setIsRestoring(false);
    }
  };

  const formatFileSize = (bytes?: number | null) => {
    if (!bytes) return "N/A";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Version History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No version history available
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.versionNumber}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    version.versionNumber === currentVersion
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">v{version.versionNumber}</span>
                      {version.versionNumber === currentVersion && (
                        <Badge className="bg-blue-100 text-blue-800 text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {version.uploadedByUserName || "Unknown"} •{" "}
                      {version.uploadedAt
                        ? formatDistanceToNow(new Date(version.uploadedAt), {
                            addSuffix: true,
                          })
                        : "Unknown date"}
                    </div>
                    {version.changeSummary && (
                      <div className="text-sm text-gray-500 mt-1">
                        {version.changeSummary}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {formatFileSize(version.fileSizeBytes)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(version.versionNumber!)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {version.versionNumber !== currentVersion && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRestoreClick(version)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restore Confirmation Dialog */}
      <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Restore Version</DialogTitle>
            <DialogDescription>
              Are you sure you want to restore version {selectedVersion?.versionNumber}?
              This will create a new version with the content from the selected version.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="restoreReason">Reason (optional)</Label>
              <Textarea
                id="restoreReason"
                value={restoreReason}
                onChange={(e) => setRestoreReason(e.target.value)}
                placeholder="Why are you restoring this version?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRestoreDialogOpen(false)}
              disabled={isRestoring}
            >
              Cancel
            </Button>
            <Button onClick={handleRestoreConfirm} disabled={isRestoring}>
              {isRestoring ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Restore
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
