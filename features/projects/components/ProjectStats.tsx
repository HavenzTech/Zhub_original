"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Project } from "@/types/bms";
import { FolderOpen, CheckCircle, DollarSign, Target } from "lucide-react";
import { formatCurrency } from "../utils/projectHelpers";

interface ProjectStatsProps {
  projects: Project[];
}

export function ProjectStats({ projects }: ProjectStatsProps) {
  const totalBudget = projects.reduce(
    (sum, p) => sum + (p.budgetAllocated || 0),
    0
  );

  const activeCount = projects.filter((p) => p.status === "active").length;

  const avgProgress =
    projects.length > 0
      ? Math.round(
          projects.reduce((sum, p) => sum + (p.progress ?? 0), 0) / projects.length
        )
      : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        icon={<FolderOpen className="w-5 h-5 text-blue-600" />}
        iconBg="bg-blue-100"
        value={projects.length.toString()}
        label="Total Projects"
      />
      <StatCard
        icon={<CheckCircle className="w-5 h-5 text-green-600" />}
        iconBg="bg-green-100"
        value={activeCount.toString()}
        label="Active"
      />
      <StatCard
        icon={<DollarSign className="w-5 h-5 text-purple-600" />}
        iconBg="bg-purple-100"
        value={formatCurrency(totalBudget)}
        label="Total Budget"
      />
      <StatCard
        icon={<Target className="w-5 h-5 text-orange-600" />}
        iconBg="bg-orange-100"
        value={`${avgProgress}%`}
        label="Avg Progress"
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
