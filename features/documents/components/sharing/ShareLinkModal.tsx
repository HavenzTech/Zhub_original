"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, ExternalLink, Eye, Download, Calendar, Shield, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { DocumentShareDto } from "@/types/bms";
import { toast } from "sonner";

interface ShareLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  share: DocumentShareDto | null;
  documentName?: string;
}

export function ShareLinkModal({
  open,
  onOpenChange,
  share,
  documentName,
}: ShareLinkModalProps) {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  if (!share) return null;

  const handleCopyUrl = () => {
    if (share.shareUrl) {
      navigator.clipboard.writeText(share.shareUrl);
      setCopiedUrl(true);
      toast.success("Share link copied to clipboard");
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyToken = () => {
    if (share.accessToken) {
      navigator.clipboard.writeText(share.accessToken);
      setCopiedToken(true);
      toast.success("Access token copied to clipboard");
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const isExpired = share.expiresAt ? new Date(share.expiresAt) < new Date() : false;
  const isActive = share.isActive && !isExpired;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Link Details</DialogTitle>
          <DialogDescription>
            Share link for &ldquo;{documentName || "this document"}&rdquo;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <Badge
              variant={isActive ? "default" : "secondary"}
              className={isActive ? "bg-green-100 text-green-800" : ""}
            >
              {isActive ? "Active" : isExpired ? "Expired" : "Revoked"}
            </Badge>
            {share.hasPassword && (
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Password Protected
              </Badge>
            )}
          </div>

          {/* Share URL */}
          {share.shareUrl && (
            <div className="space-y-2">
              <Label>Share URL</Label>
              <div className="flex gap-2">
                <Input
                  value={share.shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleCopyUrl}>
                  {copiedUrl ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(share.shareUrl!, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Access Token */}
          {share.accessToken && (
            <div className="space-y-2">
              <Label>Access Token</Label>
              <div className="flex gap-2">
                <Input
                  value={share.accessToken}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" size="sm" onClick={handleCopyToken}>
                  {copiedToken ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Share this token with the recipient for access
              </p>
            </div>
          )}

          {/* Share Details */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-3 h-3" />
                Expires
              </div>
              <span className="font-medium">
                {share.expiresAt
                  ? formatDistanceToNow(new Date(share.expiresAt), { addSuffix: true })
                  : "Never"}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Eye className="w-3 h-3" />
                Views
              </div>
              <span className="font-medium">
                {share.accessCount || 0}
                {share.maxAccessCount ? ` / ${share.maxAccessCount}` : ""}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <Download className="w-3 h-3" />
                Download
              </div>
              <span className="font-medium">
                {share.canDownload ? "Allowed" : "Disabled"}
              </span>
            </div>

            {share.createdByUserName && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Created by</span>
                <span className="font-medium">{share.createdByUserName}</span>
              </div>
            )}

            {share.lastAccessedAt && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Last accessed</span>
                <span className="font-medium">
                  {formatDistanceToNow(new Date(share.lastAccessedAt), { addSuffix: true })}
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
