"use client";

import { useState, useEffect } from "react";
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
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="flex items-center gap-2 text-base font-semibold text-stone-900 dark:text-stone-50">
            <History className="w-5 h-5" />
            Version History
          </h3>
        </div>
        <div className="p-5">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-stone-400 dark:text-stone-500" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-stone-500 dark:text-stone-400">
              No version history available
            </div>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div
                  key={version.versionNumber}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    version.versionNumber === currentVersion
                      ? "bg-accent-cyan/5 border-accent-cyan/30 dark:bg-accent-cyan/10 dark:border-accent-cyan/20"
                      : "bg-stone-50 border-stone-200 dark:bg-stone-800 dark:border-stone-700"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">v{version.versionNumber}</span>
                      {version.versionNumber === currentVersion && (
                        <Badge className="bg-accent-cyan/10 text-accent-cyan text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                      {version.uploadedByUserName || "Unknown"} •{" "}
                      {version.uploadedAt
                        ? formatDistanceToNow(new Date(version.uploadedAt), {
                            addSuffix: true,
                          })
                        : "Unknown date"}
                    </div>
                    {version.changeSummary && (
                      <div className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                        {version.changeSummary}
                      </div>
                    )}
                    <div className="text-xs text-stone-400 dark:text-stone-500 mt-1">
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
        </div>
      </div>

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
