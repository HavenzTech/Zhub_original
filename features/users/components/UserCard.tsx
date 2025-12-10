"use client";

import { useState } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { UserResponse } from "@/types/bms";
import { Mail, Shield, Calendar, Edit, Trash2 } from "lucide-react";
import {
  getRoleBadgeColor,
  getRoleLabel,
  formatDate,
  getInitials,
} from "../utils/userHelpers";

interface UserCardProps {
  user: UserResponse;
  onEdit: (user: UserResponse) => void;
  onDelete: (user: UserResponse) => void;
}

export function UserCard({ user, onEdit, onDelete }: UserCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {user.pictureUrl && !imageError ? (
              <Image
                src={user.pictureUrl}
                alt={user.name ?? "User"}
                className="rounded-full object-cover"
                height={48}
                width={48}
                onError={() => setImageError(true)}
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold">
                  {getInitials(user.name)}
                </span>
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{user.name}</CardTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="w-3 h-3" />
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Shield className="w-4 h-4" />
            Role
          </span>
          <Badge className={getRoleBadgeColor(user.role)}>
            {getRoleLabel(user.role)}
          </Badge>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            Joined
          </span>
          <span>{formatDate(user.createdAt)}</span>
        </div>
        <div className="flex gap-2 pt-3 border-t">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(user)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(user)}
            className="flex-1"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Deactivate
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
