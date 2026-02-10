"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/lib/hooks/useUsers";
import { UserCard } from "./UserCard";
import { UserStats } from "./UserStats";
import { UserFormModal } from "./UserFormModal";
import { PasswordDisplayModal } from "./PasswordDisplayModal";
import { DeleteUserDialog } from "./DeleteUserDialog";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import type {
  UserResponse,
  CreateUserRequest,
  CreateUserResponse,
} from "@/types/bms";
import { toast } from "sonner";
import { UserPlus, Search, Users as UsersIcon, Loader2 } from "lucide-react";

const initialFormData: CreateUserRequest = {
  email: "",
  name: "",
  pictureUrl: "",
  role: "employee",
};

const initialEditFormData = {
  name: "",
  pictureUrl: "",
};

export function UserManagementPanel() {
  const router = useRouter();
  const { users, loading, error, loadUsers, createUser, updateUser, deleteUser } =
    useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [createdUser, setCreatedUser] = useState<CreateUserResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateUserRequest>(initialFormData);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  const [showEditForm, setShowEditForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null);
  const [editFormData, setEditFormData] = useState(initialEditFormData);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null);

  useEffect(() => {
    const auth = authService.getAuth();
    if (!auth) {
      router.push("/login");
      return;
    }

    if (!authService.isAdmin()) {
      return;
    }

    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();

    if (token) bmsApi.setToken(token);
    if (companyId) bmsApi.setCompanyId(companyId);

    loadUsers();
  }, [router, loadUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email.trim() || !formData.name.trim()) {
      toast.error("Email and name are required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: CreateUserRequest = {
        email: formData.email.trim(),
        name: formData.name.trim(),
        role: formData.role,
      };

      if (formData.pictureUrl?.trim()) {
        payload.pictureUrl = formData.pictureUrl.trim();
      }

      const newUser = await createUser(payload);

      if (newUser) {
        if (avatarFile && newUser.id) {
          try {
            await bmsApi.users.uploadAvatar(newUser.id, avatarFile);
          } catch (avatarErr) {
            console.error("Error uploading avatar:", avatarErr);
            toast.info("User created, but avatar upload failed. You can add it later.");
          }
        }

        setCreatedUser(newUser);
        setShowPasswordModal(true);
        setShowAddForm(false);
        setFormData(initialFormData);
        setAvatarFile(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user: UserResponse) => {
    setEditingUser(user);
    setEditFormData({
      name: user.name || "",
      pictureUrl: user.pictureUrl || "",
    });
    setShowEditForm(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser?.id || !editFormData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: editFormData.name.trim(),
        pictureUrl: editFormData.pictureUrl?.trim() || undefined,
      };

      const success = await updateUser(editingUser.id, payload);

      if (success) {
        if (avatarFile) {
          try {
            await bmsApi.users.uploadAvatar(editingUser.id, avatarFile);
            toast.success("User updated with new avatar!");
            await loadUsers();
          } catch (avatarErr) {
            console.error("Error uploading avatar:", avatarErr);
            toast.success("User updated! Avatar upload failed.");
          }
        }

        setShowEditForm(false);
        setEditingUser(null);
        setAvatarFile(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = (user: UserResponse) => {
    setDeletingUser(user);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingUser?.id) return;

    setIsSubmitting(true);
    try {
      const success = await deleteUser(deletingUser.id);

      if (success) {
        setShowDeleteDialog(false);
        setDeletingUser(null);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-stone-400 dark:text-stone-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Error loading users: {error.message}</p>
        <Button variant="outline" onClick={loadUsers}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <UserStats users={users} />

      {/* Search + Add User */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-3 text-stone-400 dark:text-stone-500" />
          <Input
            placeholder="Search by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700 rounded-xl"
          />
        </div>
        <Badge variant="secondary">
          <UsersIcon className="w-4 h-4 mr-2" />
          {filteredUsers.length}{" "}
          {filteredUsers.length === 1 ? "user" : "users"}
        </Badge>
        <Button onClick={() => setShowAddForm(true)} className="ml-auto bg-accent-cyan hover:bg-accent-cyan/90 text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Users Grid */}
      {filteredUsers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card className="p-12">
          <div className="text-center">
            <UsersIcon className="w-12 h-12 mx-auto text-stone-400 dark:text-stone-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-stone-500 dark:text-stone-400 mb-4">
              {searchTerm
                ? "Try a different search term"
                : "Get started by adding a user"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowAddForm(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add User
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Modals */}
      <UserFormModal
        open={showAddForm}
        onOpenChange={(open) => {
          setShowAddForm(open);
          if (!open) setAvatarFile(null);
        }}
        mode="add"
        formData={formData}
        setFormData={setFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
      />

      <UserFormModal
        open={showEditForm}
        onOpenChange={(open) => {
          setShowEditForm(open);
          if (!open) setAvatarFile(null);
        }}
        mode="edit"
        formData={formData}
        setFormData={setFormData}
        editingUser={editingUser}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        isSubmitting={isSubmitting}
        onSubmit={handleEditSubmit}
        avatarFile={avatarFile}
        setAvatarFile={setAvatarFile}
      />

      <PasswordDisplayModal
        open={showPasswordModal}
        onOpenChange={setShowPasswordModal}
        createdUser={createdUser}
      />

      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        user={deletingUser}
        isSubmitting={isSubmitting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
