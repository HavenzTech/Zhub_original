"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, X, Shield, Eye, Edit, Trash2, Plus } from "lucide-react";
import {
  getCurrentRole,
  getPermissions,
  getRoleInfo,
} from "@/lib/utils/permissions";

// Static role color mappings (dynamic Tailwind classes get purged)
const roleStyles: Record<string, { headerBg: string; badgeBg: string; descBg: string; descBorder: string; shieldColor: string }> = {
  admin: {
    headerBg: "bg-red-50 dark:bg-red-950/30",
    badgeBg: "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-400",
    descBg: "bg-red-50 dark:bg-red-950/30",
    descBorder: "border-red-200 dark:border-red-800",
    shieldColor: "text-red-600 dark:text-red-400",
  },
  member: {
    headerBg: "bg-accent-cyan/5",
    badgeBg: "bg-accent-cyan/10 text-accent-cyan",
    descBg: "bg-accent-cyan/5",
    descBorder: "border-accent-cyan/20",
    shieldColor: "text-accent-cyan",
  },
  viewer: {
    headerBg: "bg-stone-50 dark:bg-stone-800/50",
    badgeBg: "bg-stone-100 text-stone-800 dark:bg-stone-800 dark:text-stone-300",
    descBg: "bg-stone-50 dark:bg-stone-800/50",
    descBorder: "border-stone-200 dark:border-stone-700",
    shieldColor: "text-stone-500 dark:text-stone-400",
  },
};

export function PermissionMatrixDemo() {
  const role = getCurrentRole();
  const permissions = getPermissions();
  const roleInfo = role ? getRoleInfo(role) : null;

  if (!role || !roleInfo) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Permission Matrix</h3>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">You are not logged in</p>
        </div>
      </div>
    );
  }

  const styles = roleStyles[roleInfo.color] || roleStyles.viewer;

  const actions = [
    { name: "View", icon: Eye, key: "canView", description: "View and read resources" },
    { name: "Create", icon: Plus, key: "canCreate", description: "Create new resources" },
    { name: "Edit", icon: Edit, key: "canEdit", description: "Modify existing resources" },
    { name: "Delete", icon: Trash2, key: "canDelete", description: "Remove resources permanently" },
  ];

  return (
    <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
      <div className={`px-5 py-4 border-b border-stone-200 dark:border-stone-700 rounded-t-xl ${styles.headerBg}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2">
              <Shield className={`w-4 h-4 ${styles.shieldColor}`} />
              Permission Matrix
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
              Your current role and permissions
            </p>
          </div>
          <Badge className={`text-sm px-3 py-1 ${styles.badgeBg}`}>
            {roleInfo.icon} {roleInfo.badge}
          </Badge>
        </div>
      </div>
      <div className="p-5 space-y-6">
        {/* Role Description */}
        <div className={`p-4 rounded-lg border ${styles.descBg} ${styles.descBorder}`}>
          <h4 className="font-semibold text-stone-900 dark:text-stone-50 mb-1">
            {roleInfo.label}
          </h4>
          <p className="text-sm text-stone-600 dark:text-stone-400">{roleInfo.description}</p>
        </div>

        {/* Permission Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {actions.map((action) => {
            const hasPermission = permissions[action.key as keyof typeof permissions];
            const Icon = action.icon;

            return (
              <div
                key={action.name}
                className={`p-4 rounded-lg border ${
                  hasPermission
                    ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800"
                    : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-5 h-5 ${
                        hasPermission ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                      }`}
                    />
                    <h4 className="font-semibold text-stone-900 dark:text-stone-50">
                      {action.name}
                    </h4>
                  </div>
                  {hasPermission ? (
                    <Check className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                  )}
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-400">{action.description}</p>
              </div>
            );
          })}
        </div>

        {/* What This Means */}
        <div className="p-4 bg-accent-cyan/5 border border-accent-cyan/20 rounded-lg">
          <h4 className="font-semibold text-stone-900 dark:text-stone-50 mb-2">
            What this means:
          </h4>
          <ul className="space-y-1 text-sm text-stone-700 dark:text-stone-300">
            {permissions.canView && (
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> You can view all resources in your company</li>
            )}
            {permissions.canCreate && (
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> You can create new projects, departments, etc.</li>
            )}
            {permissions.canEdit && (
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> You can edit existing resources</li>
            )}
            {permissions.canDelete && (
              <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" /> You can delete resources (admin only)</li>
            )}
            {!permissions.canCreate && (
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" /> You cannot create new resources</li>
            )}
            {!permissions.canEdit && (
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" /> You cannot edit existing resources</li>
            )}
            {!permissions.canDelete && (
              <li className="flex items-center gap-2"><X className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" /> You cannot delete resources</li>
            )}
          </ul>
        </div>

        {/* Test Buttons */}
        <div className="space-y-3">
          <h4 className="font-semibold text-stone-900 dark:text-stone-50">
            Test Permission-Based UI:
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <Button disabled={!permissions.canCreate} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
            <Button disabled={!permissions.canEdit} variant="outline" className="w-full">
              <Edit className="w-4 h-4 mr-2" />
              Edit Settings
            </Button>
            <Button disabled={!permissions.canDelete} variant="destructive" className="w-full">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Item
            </Button>
            <Button disabled={!permissions.canView} variant="secondary" className="w-full">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
          </div>
          <p className="text-xs text-stone-500 dark:text-stone-400 italic">
            * Buttons are enabled/disabled based on your role permissions
          </p>
        </div>

        {/* Role Comparison Table */}
        <div className="border border-stone-200 dark:border-stone-700 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 dark:bg-stone-800/50 border-b border-stone-200 dark:border-stone-700">
              <tr>
                <th className="text-left p-3 font-semibold text-stone-900 dark:text-stone-50">Action</th>
                <th className="text-center p-3 font-semibold text-stone-900 dark:text-stone-50">Admin</th>
                <th className="text-center p-3 font-semibold text-stone-900 dark:text-stone-50">Member</th>
                <th className="text-center p-3 font-semibold text-stone-900 dark:text-stone-50">Viewer</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <td className="p-3 font-medium text-stone-900 dark:text-stone-50">View</td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
              </tr>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <td className="p-3 font-medium text-stone-900 dark:text-stone-50">Create</td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><X className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto" /></td>
              </tr>
              <tr className="border-b border-stone-200 dark:border-stone-700">
                <td className="p-3 font-medium text-stone-900 dark:text-stone-50">Edit</td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><X className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto" /></td>
              </tr>
              <tr>
                <td className="p-3 font-medium text-stone-900 dark:text-stone-50">Delete</td>
                <td className="text-center p-3"><Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto" /></td>
                <td className="text-center p-3"><X className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto" /></td>
                <td className="text-center p-3"><X className="w-5 h-5 text-red-600 dark:text-red-400 mx-auto" /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
