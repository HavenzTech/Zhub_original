"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Unlock, Loader2, Upload } from "lucide-react";
import type { CheckinRequest } from "@/types/bms";

interface CheckinModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName?: string;
  onCheckin: (request: CheckinRequest) => Promise<void>;
  allowFileUpload?: boolean;
}

export function CheckinModal({
  open,
  onOpenChange,
  documentName,
  onCheckin,
  allowFileUpload = true,
}: CheckinModalProps) {
  const [changeSummary, setChangeSummary] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckin = async () => {
    setIsLoading(true);
    try {
      const request: CheckinRequest = {
        comment: changeSummary || undefined,
        // Note: File upload would be handled separately in a real implementation
      };
      await onCheckin(request);
      onOpenChange(false);
      // Reset form
      setChangeSummary("");
      setSelectedFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5" />
            Check In Document
          </DialogTitle>
          <DialogDescription>
            Check in &ldquo;{documentName || "this document"}&rdquo; to release the lock and save your changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {allowFileUpload && (
            <div className="grid gap-2">
              <Label>Upload New Version (Optional)</Label>
              <Input
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              {selectedFile && (
                <p className="text-sm text-gray-600">
                  Selected: {selectedFile.name}
                </p>
              )}
              <p className="text-xs text-gray-500">
                Upload a modified version of the file, or leave empty to keep the current version.
              </p>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="changeSummary">Change Summary</Label>
            <Textarea
              id="changeSummary"
              value={changeSummary}
              onChange={(e) => setChangeSummary(e.target.value)}
              placeholder="Describe what changes you made..."
              rows={3}
            />
            <p className="text-xs text-gray-500">
              This will be recorded in the version history.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button onClick={handleCheckin} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking in...
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4 mr-2" />
                Check In
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
