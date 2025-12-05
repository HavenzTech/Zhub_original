"use client";

import { Card, CardContent } from "@/components/ui/card";
import type { UserResponse } from "@/types/bms";
import { Users, Shield, UserCheck, UserX } from "lucide-react";

interface UserStatsProps {
  users: UserResponse[];
}

export function UserStats({ users }: UserStatsProps) {
  const adminCount = users.filter(
    (u) => u.role === "admin" || u.role === "super_admin"
  ).length;

  const memberCount = users.filter((u) => u.role === "member").length;

  const viewerCount = users.filter((u) => u.role === "viewer").length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={<Users className="w-5 h-5 text-blue-600" />}
        iconBg="bg-blue-100"
        value={users.length.toString()}
        label="Total Users"
      />
      <StatCard
        icon={<Shield className="w-5 h-5 text-purple-600" />}
        iconBg="bg-purple-100"
        value={adminCount.toString()}
        label="Admins"
      />
      <StatCard
        icon={<UserCheck className="w-5 h-5 text-green-600" />}
        iconBg="bg-green-100"
        value={memberCount.toString()}
        label="Members"
      />
      <StatCard
        icon={<UserX className="w-5 h-5 text-orange-600" />}
        iconBg="bg-orange-100"
        value={viewerCount.toString()}
        label="Viewers"
      />
    </div>
  );
}

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string;
  label: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
            {icon}
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{label}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
