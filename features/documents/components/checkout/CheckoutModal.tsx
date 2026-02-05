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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Loader2, Download } from "lucide-react";

interface CheckoutModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName?: string;
  onCheckout: (durationHours?: number) => Promise<void>;
  onDownloadAfterCheckout?: boolean;
}

export function CheckoutModal({
  open,
  onOpenChange,
  documentName,
  onCheckout,
  onDownloadAfterCheckout = true,
}: CheckoutModalProps) {
  const [duration, setDuration] = useState<string>("24");
  const [isLoading, setIsLoading] = useState(false);
  const [downloadAfter, setDownloadAfter] = useState(onDownloadAfterCheckout);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      await onCheckout(parseInt(duration));
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Check Out Document
          </DialogTitle>
          <DialogDescription>
            Checking out &ldquo;{documentName || "this document"}&rdquo; will lock it so only you can make changes.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Checkout Duration</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="24">24 hours (1 day)</SelectItem>
                <SelectItem value="48">48 hours (2 days)</SelectItem>
                <SelectItem value="72">72 hours (3 days)</SelectItem>
                <SelectItem value="168">168 hours (1 week)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              The checkout will automatically expire after this time if not checked in.
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <div className="font-medium text-yellow-800 mb-1">
              Remember to check in when done
            </div>
            <div className="text-yellow-600">
              Other users will not be able to edit this document while it&apos;s checked out.
            </div>
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
          <Button onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking out...
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Check Out
                {downloadAfter && (
                  <Download className="w-3 h-3 ml-1" />
                )}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
