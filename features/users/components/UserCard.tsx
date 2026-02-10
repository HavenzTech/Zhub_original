"use client";

import { useState } from "react";
import Image from "next/image";
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
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
      <div className="px-5 py-4">
        <div className="flex items-center gap-3 mb-4">
          {user.pictureUrl && !imageError ? (
            <Image
              src={user.pictureUrl}
              alt={user.name ?? "User"}
              className="rounded-full object-cover"
              height={40}
              width={40}
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-accent-cyan/10 flex items-center justify-center">
              <span className="text-sm font-medium text-accent-cyan">
                {getInitials(user.name)}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-stone-900 dark:text-stone-50 truncate">
              {user.name}
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1 truncate">
              <Mail className="w-3 h-3 flex-shrink-0" />
              {user.email}
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Role
            </span>
            <Badge className={`${getRoleBadgeColor(user.role)} text-[10px]`}>
              {getRoleLabel(user.role)}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Joined
            </span>
            <span className="text-xs text-stone-700 dark:text-stone-300">
              {formatDate(user.createdAt)}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2 px-5 py-3 border-t border-stone-100 dark:border-stone-800">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onEdit(user)}
          className="flex-1 text-xs border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800"
        >
          <Edit className="w-3.5 h-3.5 mr-1.5" />
          Edit
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onDelete(user)}
          className="flex-1 text-xs border-stone-200 dark:border-stone-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
        >
          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
          Deactivate
        </Button>
      </div>
    </div>
  );
}
