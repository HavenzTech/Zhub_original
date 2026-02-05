"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import { toast } from "sonner";
import type { DocumentDto, DocumentClassification, CheckinRequest } from "@/types/bms";

// Hooks
import { useDocumentCheckout } from "@/lib/hooks/useDocumentCheckout";
import { useDocumentWorkflow } from "@/lib/hooks/useDocumentWorkflow";

// Components
import { CheckoutModal } from "@/features/documents/components/checkout/CheckoutModal";
import { CheckinModal } from "@/features/documents/components/checkout/CheckinModal";
import { CheckoutStatusBadge } from "@/features/documents/components/checkout/CheckoutStatusBadge";
import { DocumentVersionHistory } from "@/features/documents/components/versions/DocumentVersionHistory";
import { DocumentSharePanel } from "@/features/documents/components/sharing/DocumentSharePanel";
import { DocumentPermissionsPanel } from "@/features/documents/components/permissions/DocumentPermissionsPanel";
import { WorkflowStatusBadge } from "@/features/documents/components/workflow/WorkflowStatusBadge";
import { WorkflowTimeline } from "@/features/documents/components/workflow/WorkflowTimeline";
import { StartWorkflowModal } from "@/features/documents/components/workflow/StartWorkflowModal";
import { RetentionBadge } from "@/features/documents/components/retention/RetentionBadge";
import { LegalHoldModal } from "@/features/documents/components/retention/LegalHoldModal";

import {
  ArrowLeft,
  Download,
  FileText,
  Lock,
  Unlock,
  Shield,
  GitBranch,
  Calendar,
  Building2,
  AlertCircle,
  Clock,
  User,
  Loader2,
  Play,
  ShieldAlert,
} from "lucide-react";

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

const getStatusColor = (status?: string | null): string => {
  switch (status) {
    case 'draft':
      return 'bg-gray-100 text-gray-800';
    case 'pending_review':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'published':
      return 'bg-blue-100 text-blue-800';
    case 'archived':
      return 'bg-purple-100 text-purple-800';
    case 'rejected':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatFileSize = (bytes?: number | null): string => {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const formatDate = (date?: string | null): string => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const documentId = params.id as string;

  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>(undefined);

  // Modal states
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [checkinModalOpen, setCheckinModalOpen] = useState(false);
  const [startWorkflowModalOpen, setStartWorkflowModalOpen] = useState(false);
  const [legalHoldModalOpen, setLegalHoldModalOpen] = useState(false);
  const [applyRetentionOpen, setApplyRetentionOpen] = useState(false);
  const [retentionPolicies, setRetentionPolicies] = useState<{ id: string; name: string }[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>("");
  const [applyingPolicy, setApplyingPolicy] = useState(false);
  const [retentionPolicyName, setRetentionPolicyName] = useState<string | null>(null);

  // Hooks for document operations
  const {
    status: checkoutStatus,
    loading: checkoutLoading,
    checkout,
    checkin,
    cancelCheckout,
    loadStatus: loadCheckoutStatus,
    isCheckedOutByMe,
    isCheckedOutByOther,
  } = useDocumentCheckout(documentId, currentUserId);

  // DocumentSharePanel and DocumentPermissionsPanel use their hooks internally

  const {
    currentWorkflow,
    loading: workflowLoading,
    loadWorkflowStatus,
    startWorkflow,
    cancelWorkflow,
  } = useDocumentWorkflow(documentId);

  // Load document
  const loadDocument = useCallback(async () => {
    try {
      setLoading(true);
      const doc = await bmsApi.documents.getById(documentId);
      setDocument(doc as DocumentDto);
    } catch (err) {
      console.error("Error loading document:", err);
      toast.error("Failed to load document");
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();
    const userId = auth.userId;

    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);
    if (userId) setCurrentUserId(userId);

    loadDocument();
    loadCheckoutStatus();
  }, [documentId, router, loadDocument, loadCheckoutStatus]);

  // Only load workflow status for documents that might have an active workflow
  useEffect(() => {
    if (document) {
      const status = document.status?.toLowerCase();
      const terminalStatuses = ["approved", "published", "archived", "obsolete"];
      if (!terminalStatuses.includes(status || "")) {
        loadWorkflowStatus();
      }
    }
  }, [document?.id, document?.status, loadWorkflowStatus]);

  // Load retention policy name when document has one
  useEffect(() => {
    if (document?.retentionPolicyId) {
      bmsApi.admin.retentionPolicies.get(document.retentionPolicyId)
        .then((policy) => setRetentionPolicyName(policy?.name || "Unknown Policy"))
        .catch(() => setRetentionPolicyName(null));
    } else {
      setRetentionPolicyName(null);
    }
  }, [document?.retentionPolicyId]);

  const handleCheckout = async (durationHours?: number) => {
    try {
      await checkout(durationHours);
      toast.success("Document checked out successfully");
      setCheckoutModalOpen(false);
      await loadDocument();
    } catch (err) {
      toast.error("Failed to check out document");
    }
  };

  const handleCheckin = async (request: CheckinRequest) => {
    try {
      await checkin(request);
      toast.success("Document checked in successfully");
      setCheckinModalOpen(false);
      await loadDocument();
    } catch (err) {
      toast.error("Failed to check in document");
    }
  };

  const handleStartWorkflow = async (workflowId?: string) => {
    try {
      await startWorkflow(workflowId);
      toast.success("Workflow started successfully");
      await loadDocument();
    } catch (err) {
      console.error("Failed to start workflow:", err);
      toast.error("Failed to start workflow");
    }
  };

  const handleDownload = async () => {
    try {
      // Open download URL
      const BMS_API_BASE = process.env.NEXT_PUBLIC_API_URL;
      const token = authService.getToken();
      window.open(`${BMS_API_BASE}/api/havenzhub/documents/${documentId}/download?token=${token}`, "_blank");
    } catch (err) {
      toast.error("Failed to download document");
    }
  };

  const loadRetentionPolicies = async () => {
    try {
      const policies = await bmsApi.admin.retentionPolicies.list(true);
      const data = Array.isArray(policies) ? policies : [];
      setRetentionPolicies(data.filter((p) => p.id).map((p) => ({ id: p.id!, name: p.name || "Unnamed" })));
    } catch (err) {
      console.error("❌ Error loading retention policies:", err);
      toast.error("Failed to load retention policies", {
        description: "The backend may not be responding. Check the admin retention policies page.",
      });
    }
  };

  const handleApplyRetentionPolicy = async () => {
    if (!selectedPolicyId) return;
    setApplyingPolicy(true);
    try {
      await bmsApi.documentRetention.applyPolicy(documentId, selectedPolicyId);
      toast.success("Retention policy applied successfully");
      setApplyRetentionOpen(false);
      setSelectedPolicyId("");
      await loadDocument();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Failed to apply retention policy");
      toast.error("Failed to apply retention policy", {
        description: error.message,
      });
    } finally {
      setApplyingPolicy(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AppLayout>
    );
  }

  if (!document) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Document not found</h2>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            Go Back
          </Button>
        </div>
      </AppLayout>
    );
  }

  const classification = document.classification as DocumentClassification | undefined;
  const isCheckedOut = document.isCheckedOut || checkoutStatus?.isCheckedOut;
  const checkedOutByMe = isCheckedOut && (document.checkedOutByUserId === currentUserId || isCheckedOutByMe);
  const checkedOutByOther = isCheckedOut && !checkedOutByMe;

  return (
    <AppLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push("/document-control")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Documents
          </Button>
        </div>

        {/* Alerts */}
        {document.legalHold && (
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-red-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="font-semibold text-red-800">Legal Hold Active</div>
              <div className="text-sm text-red-600">This document is under legal hold and cannot be modified, deleted, or have its retention policy expire.</div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-300 hover:bg-red-100 flex-shrink-0"
              onClick={() => setLegalHoldModalOpen(true)}
            >
              Manage Hold
            </Button>
          </div>
        )}

        {checkedOutByOther && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
            <Lock className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="font-medium text-yellow-800">Document Checked Out</div>
              <div className="text-sm text-yellow-600">
                Checked out by {document.checkedOutByUserName || checkoutStatus?.checkedOutByUserName || 'another user'}
              </div>
            </div>
          </div>
        )}

        {/* Document Header Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-start gap-6">
              {/* File Icon */}
              <div className="w-20 h-20 bg-blue-100 rounded-xl flex items-center justify-center relative">
                <FileText className="w-10 h-10 text-blue-600" />
                {isCheckedOut && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                    <Lock className="w-4 h-4 text-yellow-900" />
                  </div>
                )}
              </div>

              {/* Document Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{document.name}</h1>
                  {document.documentNumber && (
                    <Badge variant="outline" className="font-mono">
                      {document.documentNumber}
                    </Badge>
                  )}
                </div>

                <p className="text-gray-600 mb-4">
                  Version {document.version}
                  {document.documentTypeName && (
                    <span className="ml-2 text-gray-400">• {document.documentTypeName}</span>
                  )}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge className={getStatusColor(document.status)}>
                    {document.status}
                  </Badge>
                  {classification && (
                    <Badge className={`${getClassificationColor(classification)} flex items-center gap-1`}>
                      <Shield className="w-3 h-3" />
                      {classification}
                    </Badge>
                  )}
                  {isCheckedOut && (
                    <CheckoutStatusBadge
                      isCheckedOut={true}
                      checkedOutByUserName={document.checkedOutByUserName || checkoutStatus?.checkedOutByUserName}
                      checkOutExpiresAt={document.checkOutExpiresAt || checkoutStatus?.expiresAt}
                      isCheckedOutByMe={checkedOutByMe}
                    />
                  )}
                  {currentWorkflow && (
                    <WorkflowStatusBadge
                      status={currentWorkflow.status}
                      currentStep={currentWorkflow.currentStepName}
                    />
                  )}
                  {(document.legalHold || document.retentionExpiresAt) && (
                    <RetentionBadge
                      legalHold={document.legalHold}
                      retentionExpiresAt={document.retentionExpiresAt}
                    />
                  )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">File Type:</span>
                    <div className="font-medium uppercase">{document.fileType || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">File Size:</span>
                    <div className="font-medium">{formatFileSize(document.fileSizeBytes)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Owner:</span>
                    <div className="font-medium">{document.ownedByUserName || document.uploadedByUserName || "N/A"}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Last Modified:</span>
                    <div className="font-medium">{formatDate(document.updatedAt)}</div>
                  </div>
                </div>

                {document.description && (
                  <div className="mt-4 text-sm text-gray-600">{document.description}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2">
                <Button onClick={handleDownload}>
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>

                {!isCheckedOut && !document.legalHold && (
                  <Button variant="outline" onClick={() => setCheckoutModalOpen(true)}>
                    <Lock className="w-4 h-4 mr-2" />
                    Check Out
                  </Button>
                )}

                {checkedOutByMe && (
                  <Button variant="outline" onClick={() => setCheckinModalOpen(true)}>
                    <Unlock className="w-4 h-4 mr-2" />
                    Check In
                  </Button>
                )}

                {!currentWorkflow && document.status === 'draft' && (
                  <Button variant="outline" onClick={() => setStartWorkflowModalOpen(true)}>
                    <Play className="w-4 h-4 mr-2" />
                    Start Workflow
                  </Button>
                )}

                {/* Legal Hold toggle */}
                <Button
                  variant="outline"
                  onClick={() => setLegalHoldModalOpen(true)}
                  className={document.legalHold ? "text-red-600" : ""}
                >
                  <ShieldAlert className="w-4 h-4 mr-2" />
                  {document.legalHold ? "Legal Hold" : "Legal Hold"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs for different sections */}
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="sharing">Sharing</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Document Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Document Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge className={getStatusColor(document.status)}>{document.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Classification</span>
                    <Badge className={getClassificationColor(classification)}>{classification || "None"}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Category</span>
                    <span className="text-sm font-medium">{document.category || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Version</span>
                    <span className="text-sm font-medium">v{document.version}</span>
                  </div>
                  {document.contentHash && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Content Hash</span>
                      <span className="text-sm font-mono">{document.contentHash.slice(0, 16)}...</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Timestamps
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Created</span>
                    <span className="text-sm font-medium">{formatDate(document.createdAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Updated</span>
                    <span className="text-sm font-medium">{formatDate(document.updatedAt)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uploaded By</span>
                    <span className="text-sm font-medium">{document.uploadedByUserName || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Organization */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="w-5 h-5" />
                    Organization
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Document Type</span>
                    <span className="text-sm font-medium">{document.documentTypeName || "N/A"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Owner</span>
                    <span className="text-sm font-medium">{document.ownedByUserName || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Retention & Review */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Retention & Review
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Retention Policy */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Retention Policy</span>
                    {document.retentionPolicyId ? (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700">{retentionPolicyName || "Applied"}</Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">None</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs text-blue-600"
                          onClick={() => { loadRetentionPolicies(); setApplyRetentionOpen(true); }}
                        >
                          Apply Policy
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Legal Hold</span>
                    <Badge variant={document.legalHold ? "destructive" : "secondary"}>
                      {document.legalHold ? "Active" : "None"}
                    </Badge>
                  </div>
                  {document.retentionExpiresAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Retention Expires</span>
                      <span className="text-sm font-medium">{formatDate(document.retentionExpiresAt)}</span>
                    </div>
                  )}
                  {document.reviewDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Next Review</span>
                      <span className="text-sm font-medium">{formatDate(document.reviewDate)}</span>
                    </div>
                  )}
                  {document.lastReviewedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Reviewed</span>
                      <span className="text-sm font-medium">
                        {formatDate(document.lastReviewedAt)}
                        {document.lastReviewedByUserName && ` by ${document.lastReviewedByUserName}`}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Approval Info */}
              {document.approvedByUserId && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5 text-green-600" />
                      Approval
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Approved By</span>
                      <span className="text-sm font-medium">{document.approvedByUserName || "Unknown"}</span>
                    </div>
                    {document.approvedAt && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Approved At</span>
                        <span className="text-sm font-medium">{formatDate(document.approvedAt)}</span>
                      </div>
                    )}
                    {document.approvalNotes && (
                      <div>
                        <span className="text-sm text-gray-600">Notes:</span>
                        <div className="text-sm mt-1">{document.approvalNotes}</div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Checkout Status */}
              {isCheckedOut && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-yellow-600" />
                      Checkout Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Checked Out By</span>
                      <span className="text-sm font-medium">
                        {document.checkedOutByUserName || checkoutStatus?.checkedOutByUserName || "Unknown"}
                      </span>
                    </div>
                    {(document.checkedOutAt || checkoutStatus?.checkedOutAt) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Checked Out At</span>
                        <span className="text-sm font-medium">
                          {formatDate(document.checkedOutAt || checkoutStatus?.checkedOutAt)}
                        </span>
                      </div>
                    )}
                    {(document.checkOutExpiresAt || checkoutStatus?.expiresAt) && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Expires At</span>
                        <span className="text-sm font-medium">
                          {formatDate(document.checkOutExpiresAt || checkoutStatus?.expiresAt)}
                        </span>
                      </div>
                    )}
                    {checkedOutByMe && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={async () => { await cancelCheckout(); await loadDocument(); }}
                      >
                        Cancel Checkout
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Versions Tab */}
          <TabsContent value="versions">
            <DocumentVersionHistory
              documentId={documentId}
              currentVersion={document.version}
            />
          </TabsContent>

          {/* Sharing Tab */}
          <TabsContent value="sharing">
            <DocumentSharePanel
              documentId={documentId}
              documentName={document.name || undefined}
            />
          </TabsContent>

          {/* Permissions Tab */}
          <TabsContent value="permissions">
            <DocumentPermissionsPanel
              documentId={documentId}
              documentName={document.name || undefined}
            />
          </TabsContent>

          {/* Workflow Tab */}
          <TabsContent value="workflow">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <GitBranch className="w-5 h-5" />
                  Workflow Status
                </CardTitle>
                {currentWorkflow && currentWorkflow.status === 'in_progress' && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600"
                    onClick={() => cancelWorkflow("Cancelled by user")}
                  >
                    Cancel Workflow
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {workflowLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : !currentWorkflow ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 mb-4">No active workflow for this document.</div>
                    {document.status === 'draft' && (
                      <Button onClick={() => setStartWorkflowModalOpen(true)}>
                        <Play className="w-4 h-4 mr-2" />
                        Start Approval Workflow
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Workflow header */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{currentWorkflow.workflowName}</div>
                        <div className="text-sm text-gray-500">
                          Started {formatDate(currentWorkflow.startedAt)}
                        </div>
                      </div>
                      <WorkflowStatusBadge
                        status={currentWorkflow.status}
                        currentStep={currentWorkflow.currentStepName}
                      />
                    </div>

                    {/* Workflow Timeline */}
                    <WorkflowTimeline workflow={currentWorkflow} />

                    {/* Status banners */}
                    {currentWorkflow.status === 'completed' && (
                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="font-medium text-green-800">Workflow Completed</div>
                        <div className="text-sm text-green-600">
                          Completed {formatDate(currentWorkflow.completedAt)}
                        </div>
                      </div>
                    )}

                    {currentWorkflow.status === 'rejected' && (
                      <div className="p-4 bg-red-50 rounded-lg">
                        <div className="font-medium text-red-800">Workflow Rejected</div>
                        {currentWorkflow.outcome && (
                          <div className="text-sm text-red-600">{currentWorkflow.outcome}</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <CheckoutModal
          open={checkoutModalOpen}
          onOpenChange={setCheckoutModalOpen}
          documentName={document.name || undefined}
          onCheckout={handleCheckout}
        />

        <CheckinModal
          open={checkinModalOpen}
          onOpenChange={setCheckinModalOpen}
          documentName={document.name || undefined}
          onCheckin={handleCheckin}
          allowFileUpload={true}
        />

        <StartWorkflowModal
          open={startWorkflowModalOpen}
          onOpenChange={setStartWorkflowModalOpen}
          documentName={document.name || undefined}
          onStartWorkflow={handleStartWorkflow}
        />

        <LegalHoldModal
          open={legalHoldModalOpen}
          onOpenChange={setLegalHoldModalOpen}
          documentId={documentId}
          documentName={document.name || undefined}
          currentlyOnHold={document.legalHold === true}
          onComplete={() => loadDocument()}
        />

        {/* Apply Retention Policy Dialog */}
        <Dialog
          open={applyRetentionOpen}
          onOpenChange={(open) => {
            setApplyRetentionOpen(open);
            if (open) loadRetentionPolicies();
          }}
        >
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Apply Retention Policy</DialogTitle>
              <DialogDescription>
                Select a retention policy to apply to this document. This will set the retention expiration based on the policy rules.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Retention Policy</Label>
                <Select value={selectedPolicyId} onValueChange={setSelectedPolicyId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a policy..." />
                  </SelectTrigger>
                  <SelectContent>
                    {retentionPolicies.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {retentionPolicies.length === 0 && (
                  <p className="text-xs text-gray-500">
                    No retention policies available. Create one in Admin &gt; Retention Policies.
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => { setApplyRetentionOpen(false); setSelectedPolicyId(""); }}
                disabled={applyingPolicy}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyRetentionPolicy}
                disabled={applyingPolicy || !selectedPolicyId}
              >
                {applyingPolicy ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Applying...
                  </>
                ) : (
                  "Apply Policy"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
