"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { UserResponse, CreateUserRequest, UserRole } from "@/types/bms";
import { UserPlus, Check, Loader2 } from "lucide-react";
import { getRoleBadgeColor, getRoleLabel } from "../utils/userHelpers";

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  formData: CreateUserRequest;
  setFormData: (data: CreateUserRequest) => void;
  editingUser?: UserResponse | null;
  editFormData?: { name: string; pictureUrl: string };
  setEditFormData?: (data: { name: string; pictureUrl: string }) => void;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function UserFormModal({
  open,
  onOpenChange,
  mode,
  formData,
  setFormData,
  editingUser,
  editFormData,
  setEditFormData,
  isSubmitting,
  onSubmit,
}: UserFormModalProps) {
  const isEdit = mode === "edit";

  if (isEdit && editingUser && editFormData && setEditFormData) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update user profile information. Email and role cannot be changed
              here.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email (read-only)</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingUser.email}
                disabled
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="John Doe"
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Role (read-only)</Label>
              <div className="flex items-center gap-2">
                <Badge className={getRoleBadgeColor(editingUser.role)}>
                  {getRoleLabel(editingUser.role)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Role changes require separate approval
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-pictureUrl">Picture URL (optional)</Label>
              <Input
                id="edit-pictureUrl"
                type="url"
                placeholder="https://example.com/photo.jpg"
                value={editFormData.pictureUrl}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    pictureUrl: e.target.value,
                  })
                }
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add New User</DialogTitle>
          <DialogDescription>
            Create a new user account. A temporary password will be generated.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role *</Label>
            <Select
              value={formData.role}
              onValueChange={(value) =>
                setFormData({ ...formData, role: value as UserRole })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                <SelectItem value="member">Member - Standard access</SelectItem>
                <SelectItem value="admin">Admin - Full control</SelectItem>
                <SelectItem value="super_admin">
                  Super Admin - Platform-wide access
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="pictureUrl">Picture URL (optional)</Label>
            <Input
              id="pictureUrl"
              type="url"
              placeholder="https://example.com/photo.jpg"
              value={formData.pictureUrl}
              onChange={(e) =>
                setFormData({ ...formData, pictureUrl: e.target.value })
              }
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create User
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
