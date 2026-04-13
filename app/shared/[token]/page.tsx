"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  FileText,
  Download,
  Lock,
  Clock,
  AlertTriangle,
  Loader2,
  Shield,
  Eye,
  Printer,
  Droplets,
} from "lucide-react";
import { format } from "date-fns";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

interface ShareAccessResponse {
  success: boolean;
  message: string | null;
  requiresPassword: boolean;
  requiresEmail: boolean;
  documentName: string | null;
  fileType: string | null;
  fileSizeBytes: number | null;
  downloadUrl: string | null;
  canDownload: boolean;
  canPrint: boolean;
  watermarkEnabled: boolean;
  expiresAt: string | null;
  remainingAccesses: number | null;
}

function formatFileSize(bytes: number | null | undefined): string {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileLabel(fileType: string | null): string {
  if (!fileType) return "Document";
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) return "PDF";
  if (type.includes("doc") || type.includes("word")) return "Word";
  if (type.includes("xls") || type.includes("sheet") || type.includes("excel")) return "Excel";
  if (type.includes("ppt") || type.includes("presentation")) return "PowerPoint";
  if (type.includes("image") || type.includes("png") || type.includes("jpg") || type.includes("jpeg")) return "Image";
  return "Document";
}

export default function SharedDocumentPage() {
  const params = useParams();
  const token = params.token as string;

  const [loading, setLoading] = useState(true);
  const [shareInfo, setShareInfo] = useState<ShareAccessResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fetchShareInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/shared/${token}`);

      if (res.status === 404) {
        setError("This share link is invalid or has been removed.");
        return;
      }
      if (res.status === 410) {
        setError("This share link has expired.");
        return;
      }
      if (!res.ok) {
        setError("Unable to access this shared document.");
        return;
      }

      const data: ShareAccessResponse = await res.json();

      if (!data.success) {
        setError(data.message || "Unable to access this shared document.");
        return;
      }

      if (data.requiresPassword || data.requiresEmail) {
        setNeedsVerification(true);
        setShareInfo(data);
      } else {
        setShareInfo(data);
      }
    } catch {
      setError("Unable to connect. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) fetchShareInfo();
  }, [token, fetchShareInfo]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/api/shared/${token}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(shareInfo?.requiresPassword && { password }),
          ...(shareInfo?.requiresEmail && { email }),
        }),
      });

      const data: ShareAccessResponse = await res.json();

      if (!data.success) {
        setError(data.message || "Verification failed. Please check your credentials.");
        return;
      }

      setShareInfo(data);
      setNeedsVerification(false);
    } catch {
      setError("Unable to verify. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await fetch(`${API_BASE}/api/shared/${token}/download`);
      if (!res.ok) {
        setError("Download failed. The link may have expired.");
        return;
      }

      const data: ShareAccessResponse = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      } else {
        setError("Download URL not available.");
      }
    } catch {
      setError("Download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-accent-cyan mx-auto mb-3" />
          <p className="text-stone-400 text-sm">Loading shared document...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !shareInfo) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-800 border border-stone-700 rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-lg font-semibold text-stone-50 mb-2">
            Unable to Access Document
          </h2>
          <p className="text-stone-400 text-sm">{error}</p>
          <p className="text-xs text-stone-600 mt-6">Havenz Hub</p>
        </div>
      </div>
    );
  }

  // Verification form
  if (needsVerification && shareInfo) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-stone-800 border border-stone-700 rounded-xl overflow-hidden">
          {/* Header bar */}
          <div className="bg-accent-cyan/10 border-b border-stone-700 px-6 py-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-cyan/20 rounded-lg flex items-center justify-center">
              <Lock className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-stone-50">Protected Document</h2>
              <p className="text-xs text-stone-400">Verification required to access</p>
            </div>
          </div>

          <div className="p-6">
            {shareInfo.documentName && (
              <p className="text-sm text-stone-300 mb-4">
                &ldquo;{shareInfo.documentName}&rdquo; requires verification.
              </p>
            )}

            <form onSubmit={handleVerify} className="space-y-4">
              {shareInfo.requiresPassword && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-stone-300 text-sm">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the share password"
                    required
                    className="bg-stone-900 border-stone-600 text-stone-50 placeholder:text-stone-500 focus:border-accent-cyan focus:ring-accent-cyan/20"
                  />
                </div>
              )}
              {shareInfo.requiresEmail && (
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-stone-300 text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                    className="bg-stone-900 border-stone-600 text-stone-50 placeholder:text-stone-500 focus:border-accent-cyan focus:ring-accent-cyan/20"
                  />
                </div>
              )}
              {error && (
                <p className="text-sm text-red-400 text-center">{error}</p>
              )}
              <Button
                type="submit"
                className="w-full bg-accent-cyan hover:bg-accent-cyan/90 text-white"
                disabled={verifying}
              >
                {verifying ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4 mr-2" />
                    Access Document
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Main document view
  if (!shareInfo) return null;

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-stone-800 border border-stone-700 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-accent-cyan/10 border-b border-stone-700 px-6 py-5 text-center">
          <div className="w-14 h-14 bg-accent-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7 text-accent-cyan" />
          </div>
          <h1 className="text-xl font-semibold text-stone-50">
            {shareInfo.documentName || "Shared Document"}
          </h1>
          <p className="text-sm text-stone-400 mt-1">
            Someone shared this document with you
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Document info */}
          <div className="bg-stone-900/50 rounded-xl border border-stone-700 divide-y divide-stone-700">
            <div className="flex items-center justify-between px-4 py-3 text-sm">
              <span className="text-stone-400 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Type
              </span>
              <span className="font-medium text-stone-200">
                {getFileLabel(shareInfo.fileType)}
                {shareInfo.fileType ? ` (.${shareInfo.fileType})` : ""}
              </span>
            </div>
            {shareInfo.fileSizeBytes && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-stone-400">Size</span>
                <span className="font-medium text-stone-200">
                  {formatFileSize(shareInfo.fileSizeBytes)}
                </span>
              </div>
            )}
            {shareInfo.expiresAt && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-stone-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Expires
                </span>
                <span className="font-medium text-stone-200">
                  {format(new Date(shareInfo.expiresAt), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
            )}
            {shareInfo.remainingAccesses !== null && (
              <div className="flex items-center justify-between px-4 py-3 text-sm">
                <span className="text-stone-400 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Remaining accesses
                </span>
                <span className="font-medium text-stone-200">
                  {shareInfo.remainingAccesses}
                </span>
              </div>
            )}
          </div>

          {/* Permission badges */}
          <div className="flex items-center gap-2 flex-wrap">
            {shareInfo.canDownload && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-accent-cyan/10 text-accent-cyan px-2.5 py-1 rounded-full">
                <Download className="w-3 h-3" /> Download allowed
              </span>
            )}
            {shareInfo.canPrint && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-accent-cyan/10 text-accent-cyan px-2.5 py-1 rounded-full">
                <Printer className="w-3 h-3" /> Print allowed
              </span>
            )}
            {shareInfo.watermarkEnabled && (
              <span className="inline-flex items-center gap-1.5 text-xs bg-stone-700 text-stone-300 px-2.5 py-1 rounded-full">
                <Droplets className="w-3 h-3" /> Watermarked
              </span>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-400 text-center">{error}</p>
          )}

          {/* Actions */}
          <div className="flex flex-col gap-2">
            {shareInfo.canDownload && (
              <Button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-accent-cyan hover:bg-accent-cyan/90 text-white h-11"
              >
                {downloading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Preparing download...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Download Document
                  </>
                )}
              </Button>
            )}
            {shareInfo.downloadUrl && (
              <Button
                variant="outline"
                onClick={() => window.open(shareInfo.downloadUrl!, "_blank")}
                className="w-full border-stone-600 text-stone-200 hover:bg-stone-700 hover:text-stone-50 h-11"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Document
              </Button>
            )}
          </div>

          {/* Footer */}
          <p className="text-xs text-stone-600 text-center pt-1">
            Powered by Havenz Hub
          </p>
        </div>
      </div>
    </div>
  );
}
