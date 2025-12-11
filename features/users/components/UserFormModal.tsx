"use client";

import { useRef, useState } from "react";
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
import { UserPlus, Check, Loader2, Upload, X, User } from "lucide-react";
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
  avatarFile?: File | null;
  setAvatarFile?: (file: File | null) => void;
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
  avatarFile,
  setAvatarFile,
}: UserFormModalProps) {
  const isEdit = mode === "edit";
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        alert("File size must be less than 5MB");
        return;
      }
      setAvatarFile?.(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
    }
  };

  const handleRemoveAvatar = () => {
    setAvatarFile?.(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const currentAvatarUrl = isEdit ? editingUser?.pictureUrl : formData.pictureUrl;
  const displayAvatarUrl = avatarPreview || currentAvatarUrl;

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
                value={editingUser.email ?? ""}
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
            {/* Avatar Upload */}
            <div className="space-y-2">
              <Label>Profile Picture</Label>
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-50">
                  {displayAvatarUrl ? (
                    <img
                      src={displayAvatarUrl}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="edit-avatar"
                  />
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      {displayAvatarUrl ? "Change" : "Upload"}
                    </Button>
                    {(avatarFile || avatarPreview) && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveAvatar}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  {avatarFile && (
                    <p className="text-xs text-gray-500">
                      Selected: {avatarFile.name}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    PNG, JPG up to 5MB
                  </p>
                </div>
              </div>
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
                <SelectItem value="employee">Employee - View & work on assigned tasks</SelectItem>
                <SelectItem value="project_lead">Project Lead - Manage assigned projects</SelectItem>
                <SelectItem value="dept_manager">Dept Manager - Manage assigned departments</SelectItem>
                <SelectItem value="admin">Admin - Full company control</SelectItem>
                <SelectItem value="super_admin">Super Admin - Platform-wide access</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Avatar Upload */}
          <div className="space-y-2">
            <Label>Profile Picture (optional)</Label>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden bg-gray-50">
                {displayAvatarUrl ? (
                  <img
                    src={displayAvatarUrl}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1 space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="add-avatar"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {displayAvatarUrl ? "Change" : "Upload"}
                  </Button>
                  {(avatarFile || avatarPreview) && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAvatar}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {avatarFile && (
                  <p className="text-xs text-gray-500">
                    Selected: {avatarFile.name}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  PNG, JPG up to 5MB. Avatar can be uploaded after user is created.
                </p>
              </div>
            </div>
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
