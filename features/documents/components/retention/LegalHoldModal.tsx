"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Shield, ShieldOff, Loader2, AlertTriangle } from "lucide-react";
import { bmsApi } from "@/lib/services/bmsApi";
import { toast } from "sonner";

interface LegalHoldModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  documentName?: string;
  currentlyOnHold: boolean;
  onComplete?: () => void;
}

export function LegalHoldModal({
  open,
  onOpenChange,
  documentId,
  documentName,
  currentlyOnHold,
  onComplete,
}: LegalHoldModalProps) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!currentlyOnHold && !reason.trim()) {
      toast.error("A reason is required to place a legal hold");
      return;
    }

    setIsSubmitting(true);
    try {
      await bmsApi.documentRetention.setLegalHold(documentId, {
        enableHold: !currentlyOnHold,
        reason: reason.trim() || undefined,
      });

      if (currentlyOnHold) {
        toast.success("Legal hold released");
      } else {
        toast.success("Legal hold applied");
      }

      setReason("");
      onOpenChange(false);
      onComplete?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to update legal hold");
      toast.error("Failed to update legal hold", {
        description: error.message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentlyOnHold ? (
              <ShieldOff className="w-5 h-5 text-green-600" />
            ) : (
              <Shield className="w-5 h-5 text-red-600" />
            )}
            {currentlyOnHold ? "Release Legal Hold" : "Place Legal Hold"}
          </DialogTitle>
          <DialogDescription>
            {currentlyOnHold
              ? `Release the legal hold on "${documentName || "this document"}"`
              : `Place a legal hold on "${documentName || "this document"}"`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Warning banner */}
          {!currentlyOnHold && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-red-800">Warning</div>
                <div className="text-red-600">
                  A legal hold will prevent this document from being modified, deleted, or having its
                  retention policy expire. This is typically used for litigation or regulatory compliance.
                </div>
              </div>
            </div>
          )}

          {currentlyOnHold && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-3">
              <ShieldOff className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-green-800">Release Hold</div>
                <div className="text-green-600">
                  Releasing the legal hold will allow normal document operations and retention
                  policies to resume.
                </div>
              </div>
            </div>
          )}

          <div className="grid gap-2">
            <Label>{currentlyOnHold ? "Reason for Release (Optional)" : "Reason for Hold"}</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={
                currentlyOnHold
                  ? "Reason for releasing the legal hold..."
                  : "Legal case reference, regulation, or compliance reason..."
              }
              rows={3}
            />
            {!currentlyOnHold && (
              <p className="text-xs text-gray-500">
                A reason is required when placing a legal hold
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => { onOpenChange(false); setReason(""); }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || (!currentlyOnHold && !reason.trim())}
            variant={currentlyOnHold ? "default" : "destructive"}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                {currentlyOnHold ? "Releasing..." : "Applying..."}
              </>
            ) : currentlyOnHold ? (
              <>
                <ShieldOff className="w-4 h-4 mr-2" />
                Release Hold
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Place Legal Hold
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
