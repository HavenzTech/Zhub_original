"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { bmsApi, BmsApiError } from "@/lib/services/bmsApi";
import { toast } from "sonner";
import { Users, UserPlus, X, Loader2 } from "lucide-react";

interface Member {
  userId: string;
  userName?: string;
  userEmail?: string;
  role?: string;
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface MembersAssignmentProps {
  entityType: "department" | "project";
  entityId: string;
  entityName: string;
}

export function MembersAssignment({
  entityType,
  entityId,
  entityName,
}: MembersAssignmentProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("employee");
  const [removingMember, setRemovingMember] = useState<Member | null>(null);

  const loadMembers = useCallback(async () => {
    try {
      setLoading(true);
      let data;
      if (entityType === "department") {
        data = await bmsApi.departments.getMembers(entityId);
      } else {
        data = await bmsApi.projects.getMembers(entityId);
      }
      const membersList = Array.isArray(data)
        ? data
        : (data as any)?.items || (data as any)?.data || [];
      setMembers(membersList);
    } catch (err) {
      console.error("Error loading members:", err);
      toast.error("Failed to load members");
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  const loadAvailableUsers = useCallback(async () => {
    try {
      const data = await bmsApi.users.getAll();
      const usersList = Array.isArray(data)
        ? data
        : (data as any)?.items || (data as any)?.data || [];
      setAvailableUsers(usersList);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  }, []);

  useEffect(() => {
    loadMembers();
    loadAvailableUsers();
  }, [loadMembers, loadAvailableUsers]);

  const handleAddMember = async () => {
    if (!selectedUserId) {
      toast.error("Please select a user");
      return;
    }

    setAdding(true);
    try {
      const payload = { userId: selectedUserId, role: selectedRole };
      if (entityType === "department") {
        await bmsApi.departments.addMember(entityId, payload);
      } else {
        await bmsApi.projects.addMember(entityId, payload);
      }
      toast.success("Member added successfully");
      setSelectedUserId("");
      setSelectedRole("employee");
      await loadMembers();
    } catch (err) {
      console.error("Error adding member:", err);
      const message =
        err instanceof BmsApiError ? err.message : "Failed to add member";
      toast.error(message);
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async () => {
    if (!removingMember) return;

    try {
      if (entityType === "department") {
        await bmsApi.departments.removeMember(entityId, removingMember.userId);
      } else {
        await bmsApi.projects.removeMember(entityId, removingMember.userId);
      }
      toast.success("Member removed successfully");
      await loadMembers();
    } catch (err) {
      const message =
        err instanceof BmsApiError ? err.message : "Failed to remove member";
      toast.error(message);
    } finally {
      setRemovingMember(null);
    }
  };

  // Filter out users who are already members
  const memberUserIds = new Set(members.map((m) => m.userId));
  const usersToAdd = availableUsers.filter((u) => !memberUserIds.has(u.id));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Members
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Member Form */}
        <div className="flex gap-2">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select a user to add..." />
            </SelectTrigger>
            <SelectContent>
              {usersToAdd.length === 0 ? (
                <SelectItem value="_none" disabled>
                  No users available
                </SelectItem>
              ) : (
                usersToAdd.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name || user.email || user.id}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="employee">Employee</SelectItem>
              <SelectItem value="project_lead">Project Lead</SelectItem>
              <SelectItem value="dept_manager">Dept Manager</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddMember} disabled={adding || !selectedUserId}>
            {adding ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Members List */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No members assigned yet</p>
          </div>
        ) : (
          <div className="space-y-2">
            {members.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {(member.userName || member.userEmail || "U")[0].toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {member.userName || member.userEmail || member.userId}
                    </div>
                    {member.userEmail && member.userName && (
                      <div className="text-xs text-gray-500">{member.userEmail}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.role && (
                    <Badge variant="secondary" className="text-xs">
                      {member.role}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRemovingMember(member)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Remove Confirmation Dialog */}
        <AlertDialog
          open={!!removingMember}
          onOpenChange={(open) => !open && setRemovingMember(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove Member</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to remove{" "}
                <strong>
                  {removingMember?.userName ||
                    removingMember?.userEmail ||
                    "this user"}
                </strong>{" "}
                from {entityName}?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleRemoveMember}
                className="bg-red-600 hover:bg-red-700"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
