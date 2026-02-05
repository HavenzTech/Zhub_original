"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
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
import {
  Users,
  Plus,
  Trash2,
  Loader2,
  User,
  Shield,
  Edit2,
  Building2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { bmsApi } from "@/lib/services/bmsApi";
import { useDocumentPermissions } from "@/lib/hooks/useDocumentPermissions";
import type {
  CreateDocumentPermissionRequest,
  UpdateDocumentPermissionRequest,
  DocumentPermissionDto,
  PermissionLevel,
} from "@/types/bms";

interface DocumentPermissionsPanelProps {
  documentId: string;
  documentName?: string;
}

const PERMISSION_LEVELS: { value: PermissionLevel; label: string; description: string }[] = [
  { value: "viewer", label: "Viewer", description: "Can view the document" },
  { value: "contributor", label: "Contributor", description: "Can view and comment" },
  { value: "editor", label: "Editor", description: "Can view, comment, and edit" },
  { value: "manager", label: "Manager", description: "Full control including permissions" },
];

const getPermissionColor = (level?: string | null): string => {
  switch (level) {
    case "manager":
      return "bg-purple-100 text-purple-800";
    case "editor":
      return "bg-blue-100 text-blue-800";
    case "contributor":
      return "bg-green-100 text-green-800";
    case "viewer":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export function DocumentPermissionsPanel({
  documentId,
  documentName,
}: DocumentPermissionsPanelProps) {
  const {
    permissions,
    effectivePermissions,
    loading,
    loadPermissions,
    loadEffectivePermissions,
    createPermission,
    updatePermission,
    revokePermission,
  } = useDocumentPermissions(documentId);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<DocumentPermissionDto | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmRevokeId, setConfirmRevokeId] = useState<string | null>(null);
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string; email: string }[]>([]);

  // Add form state
  const [userId, setUserId] = useState("");
  const [roleName, setRoleName] = useState("");
  const [permissionLevel, setPermissionLevel] = useState<PermissionLevel>("viewer");
  const [grantType, setGrantType] = useState<"user" | "role">("user");
  const [appliesToChildren, setAppliesToChildren] = useState(true);
  const [notes, setNotes] = useState("");

  // Edit form state
  const [editPermissionLevel, setEditPermissionLevel] = useState<PermissionLevel>("viewer");
  const [editAppliesToChildren, setEditAppliesToChildren] = useState(true);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (documentId) {
      loadPermissions();
      loadEffectivePermissions();
      // Load users for dropdown
      bmsApi.users.getAll()
        .then((response) => {
          const data = Array.isArray(response)
            ? response
            : (response as any)?.items || (response as any)?.data || [];
          setAvailableUsers(
            data.map((u: any) => ({
              id: u.id || "",
              name: u.name || u.email || "",
              email: u.email || "",
            }))
          );
        })
        .catch(() => setAvailableUsers([]));
    }
  }, [documentId, loadPermissions, loadEffectivePermissions]);

  const resetAddForm = () => {
    setUserId("");
    setRoleName("");
    setPermissionLevel("viewer");
    setGrantType("user");
    setAppliesToChildren(true);
    setNotes("");
  };

  const handleAddPermission = async () => {
    setIsSubmitting(true);
    try {
      const request: CreateDocumentPermissionRequest = {
        documentId,
        permissionLevel,
        appliesToChildren,
        notes: notes || undefined,
      };

      if (grantType === "user" && userId) {
        request.userId = userId;
      } else if (grantType === "role" && roleName) {
        request.roleName = roleName;
      } else {
        return;
      }

      const result = await createPermission(request);
      if (result) {
        setAddDialogOpen(false);
        resetAddForm();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditPermission = async () => {
    if (!editingPermission?.id) return;
    setIsSubmitting(true);
    try {
      const request: UpdateDocumentPermissionRequest = {
        permissionLevel: editPermissionLevel,
        appliesToChildren: editAppliesToChildren,
        notes: editNotes || undefined,
      };

      const result = await updatePermission(editingPermission.id, request);
      if (result) {
        setEditDialogOpen(false);
        setEditingPermission(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (perm: DocumentPermissionDto) => {
    setEditingPermission(perm);
    setEditPermissionLevel((perm.permissionLevel as PermissionLevel) || "viewer");
    setEditAppliesToChildren(perm.appliesToChildren !== false);
    setEditNotes(perm.notes || "");
    setEditDialogOpen(true);
  };

  const handleRevoke = async (permissionId: string) => {
    setConfirmRevokeId(permissionId);
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Document Permissions
          </CardTitle>
          <Button size="sm" onClick={() => setAddDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Grant Permission
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : permissions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No explicit permissions set. Document uses default access rules.
            </div>
          ) : (
            <div className="space-y-3">
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className={`p-4 rounded-lg border ${
                    perm.revokedAt
                      ? "bg-gray-50 border-gray-200 opacity-60"
                      : "bg-white border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                        {perm.userId ? (
                          <User className="w-5 h-5 text-gray-500" />
                        ) : perm.departmentId ? (
                          <Building2 className="w-5 h-5 text-gray-500" />
                        ) : (
                          <Shield className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">
                          {perm.userName || perm.departmentName || perm.roleName || "Unknown"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {perm.userId
                            ? perm.userEmail || "User"
                            : perm.departmentId
                            ? "Department"
                            : "Role"}
                        </div>
                        {perm.notes && (
                          <div className="text-xs text-gray-400 mt-1">{perm.notes}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getPermissionColor(perm.permissionLevel)}>
                        {perm.permissionLevel}
                      </Badge>
                      {!perm.revokedAt && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditDialog(perm)}
                            title="Edit permission"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRevoke(perm.id!)}
                            className="text-red-600 hover:text-red-700"
                            title="Revoke permission"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Permission details */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {perm.canView && <Badge variant="outline" className="text-xs">View</Badge>}
                    {perm.canDownload && <Badge variant="outline" className="text-xs">Download</Badge>}
                    {perm.canEdit && <Badge variant="outline" className="text-xs">Edit</Badge>}
                    {perm.canDelete && <Badge variant="outline" className="text-xs">Delete</Badge>}
                    {perm.canShare && <Badge variant="outline" className="text-xs">Share</Badge>}
                    {perm.canComment && <Badge variant="outline" className="text-xs">Comment</Badge>}
                    {perm.canManagePermissions && <Badge variant="outline" className="text-xs">Manage</Badge>}
                    {perm.appliesToChildren && <Badge variant="outline" className="text-xs">Inheritable</Badge>}
                  </div>

                  <div className="mt-2 text-xs text-gray-400">
                    Granted {perm.grantedAt
                      ? formatDistanceToNow(new Date(perm.grantedAt), { addSuffix: true })
                      : "recently"}
                    {perm.grantedByUserName && ` by ${perm.grantedByUserName}`}
                    {perm.revokedAt && (
                      <span className="text-red-500">
                        {" "}| Revoked {formatDistanceToNow(new Date(perm.revokedAt), { addSuffix: true })}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Effective Permissions Summary */}
          {effectivePermissions && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800 mb-2">Your Effective Permissions</div>
              <div className="flex flex-wrap gap-2">
                <Badge>{effectivePermissions.highestPermissionLevel || "viewer"}</Badge>
                {effectivePermissions.canView && <Badge variant="secondary">View</Badge>}
                {effectivePermissions.canDownload && <Badge variant="secondary">Download</Badge>}
                {effectivePermissions.canEdit && <Badge variant="secondary">Edit</Badge>}
                {effectivePermissions.canDelete && <Badge variant="secondary">Delete</Badge>}
                {effectivePermissions.canShare && <Badge variant="secondary">Share</Badge>}
                {effectivePermissions.canComment && <Badge variant="secondary">Comment</Badge>}
                {effectivePermissions.canManagePermissions && <Badge variant="secondary">Manage Permissions</Badge>}
              </div>
              {effectivePermissions.sources && effectivePermissions.sources.length > 0 && (
                <div className="mt-2 text-xs text-blue-600">
                  Sources: {effectivePermissions.sources.map(s => s.sourceName || s.sourceType).join(", ")}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Permission Dialog */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Grant Permission</DialogTitle>
            <DialogDescription>
              Grant access to &ldquo;{documentName || "this document"}&rdquo;
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Grant To</Label>
              <Select value={grantType} onValueChange={(v) => setGrantType(v as "user" | "role")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="role">Role</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {grantType === "user" ? (
              <div className="grid gap-2">
                <Label>User</Label>
                <Select value={userId} onValueChange={setUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={roleName} onValueChange={setRoleName}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="editor">Editor</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="viewer">Viewer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Permission Level</Label>
              <Select
                value={permissionLevel}
                onValueChange={(v) => setPermissionLevel(v as PermissionLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <span className="font-medium">{level.label}</span>
                        <span className="text-gray-500 ml-2 text-xs">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Apply to Children</Label>
                <div className="text-xs text-gray-500">
                  Permission inherits to sub-folders and documents
                </div>
              </div>
              <Switch
                checked={appliesToChildren}
                onCheckedChange={setAppliesToChildren}
              />
            </div>

            <div className="grid gap-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Reason for granting access..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setAddDialogOpen(false); resetAddForm(); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddPermission}
              disabled={isSubmitting || (!userId && !roleName)}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Granting...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Grant Permission
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!confirmRevokeId}
        onOpenChange={(open) => { if (!open) setConfirmRevokeId(null); }}
        title="Revoke Permission"
        description="Are you sure you want to revoke this permission? The user or role will lose access to this document."
        confirmText="Revoke"
        variant="destructive"
        icon={Trash2}
        onConfirm={async () => {
          if (confirmRevokeId) await revokePermission(confirmRevokeId);
          setConfirmRevokeId(null);
        }}
      />

      {/* Edit Permission Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Permission</DialogTitle>
            <DialogDescription>
              Update permission for {editingPermission?.userName || editingPermission?.roleName || "user"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Permission Level</Label>
              <Select
                value={editPermissionLevel}
                onValueChange={(v) => setEditPermissionLevel(v as PermissionLevel)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERMISSION_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <div>
                        <span className="font-medium">{level.label}</span>
                        <span className="text-gray-500 ml-2 text-xs">{level.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Apply to Children</Label>
                <div className="text-xs text-gray-500">
                  Permission inherits to sub-folders and documents
                </div>
              </div>
              <Switch
                checked={editAppliesToChildren}
                onCheckedChange={setEditAppliesToChildren}
              />
            </div>

            <div className="grid gap-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Reason for update..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setEditDialogOpen(false); setEditingPermission(null); }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button onClick={handleEditPermission} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 mr-2" />
                  Update Permission
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
