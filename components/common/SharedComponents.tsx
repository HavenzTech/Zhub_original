// components/common/SharedComponents.tsx - Reusable Components Library
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import {
  Building2,
  Users,
  FolderOpen,
  Home,
  Eye,
  Edit,
  MoreHorizontal,
  Calendar,
  AlertTriangle,
  Search,
  Download,
} from "lucide-react";

// Entity Card Component - Reusable for companies, departments, projects, properties
interface EntityCardProps {
  type: "company" | "department" | "project" | "property";
  data: any;
  onView?: () => void;
  onEdit?: () => void;
  onClick?: () => void;
  showActions?: boolean;
}

const getIcon = (type: string) => {
  switch (type) {
    case "company":
      return Building2;
    case "department":
      return Users;
    case "project":
      return FolderOpen;
    case "property":
      return Home;
    default:
      return Building2;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-green-100 text-green-800";
    case "inactive":
      return "bg-gray-100 text-gray-800";
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    case "on-hold":
      return "bg-orange-100 text-orange-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

export const EntityCard: React.FC<EntityCardProps> = ({
  type,
  data,
  onView,
  onEdit,
  onClick,
  showActions = true,
}) => {
  const Icon = getIcon(type);

  return (
    <Card
      className={`cursor-pointer hover:shadow-lg transition-shadow ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                type === "company"
                  ? "bg-blue-100"
                  : type === "department"
                  ? "bg-purple-100"
                  : type === "project"
                  ? "bg-green-100"
                  : "bg-orange-100"
              }`}
            >
              {data.logo ? (
                <Image
                  src={data.logo}
                  alt={data.name}
                  className="w-8 h-8 object-contain"
                  width={32}
                  height={32}
                />
              ) : (
                <Icon
                  className={`w-6 h-6 ${
                    type === "company"
                      ? "text-blue-600"
                      : type === "department"
                      ? "text-purple-600"
                      : type === "project"
                      ? "text-green-600"
                      : "text-orange-600"
                  }`}
                />
              )}
            </div>
            <div>
              <CardTitle className="text-lg">{data.name}</CardTitle>
              <p className="text-sm text-gray-600">
                {type === "company" && data.industry}
                {type === "department" && `Led by ${data.head?.name}`}
                {type === "project" && data.company}
                {type === "property" && `${data.type} • ${data.location?.city}`}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className={getStatusColor(data.status)}>{data.status}</Badge>
            {data.priority && (
              <Badge
                variant={
                  data.priority === "high" || data.priority === "critical"
                    ? "destructive"
                    : "secondary"
                }
              >
                {data.priority}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {data.description}
        </p>

        {/* Progress bar for projects */}
        {type === "project" && data.progress !== undefined && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{data.progress}%</span>
            </div>
            <Progress value={data.progress} className="h-2" />
          </div>
        )}

        {/* Key metrics grid */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4">
          {type === "company" && (
            <>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  ${(data.financials?.annualRevenue / 1000000).toFixed(1)}M
                </div>
                <div className="text-gray-600">Revenue</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.departments?.length || 0}
                </div>
                <div className="text-gray-600">Departments</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.projects?.length || 0}
                </div>
                <div className="text-gray-600">Projects</div>
              </div>
            </>
          )}

          {type === "department" && (
            <>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.employees?.active || 0}
                </div>
                <div className="text-gray-600">Staff</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.projects?.length || 0}
                </div>
                <div className="text-gray-600">Projects</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  ${((data.budget?.allocated || 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-600">Budget</div>
              </div>
            </>
          )}

          {type === "project" && (
            <>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  ${((data.budget?.allocated || 0) / 1000).toFixed(0)}K
                </div>
                <div className="text-gray-600">Budget</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.team?.members || 0}
                </div>
                <div className="text-gray-600">Team</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.tasks?.total || 0}
                </div>
                <div className="text-gray-600">Tasks</div>
              </div>
            </>
          )}

          {type === "property" && (
            <>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {(data.specifications?.size?.totalArea / 1000).toFixed(1)}K
                </div>
                <div className="text-gray-600">Sq Ft</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.specifications?.capacity?.employees || 0}
                </div>
                <div className="text-gray-600">Capacity</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-gray-900">
                  {data.companyIds?.length || 0}
                </div>
                <div className="text-gray-600">Companies</div>
              </div>
            </>
          )}
        </div>

        {/* Additional info row */}
        <div className="flex items-center justify-between text-sm">
          {type === "project" && (
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="w-4 h-4" />
              Due: {new Date(data.endDate).toLocaleDateString()}
            </div>
          )}

          {data.risks && data.risks.count > 0 && (
            <div className="flex items-center gap-1 text-orange-600">
              <AlertTriangle className="w-4 h-4" />
              {data.risks.count} risks
            </div>
          )}
        </div>

        {/* Action buttons */}
        {showActions && (
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onView();
                }}
              >
                <Eye className="w-4 h-4 mr-2" />
                View
              </Button>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            <Button variant="ghost" size="sm" className="ml-auto">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Stats Card Component
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: "blue" | "green" | "purple" | "orange" | "red" | "yellow";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}) => {
  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
    red: "bg-red-100 text-red-600",
    yellow: "bg-yellow-100 text-yellow-600",
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{value}</div>
            <div className="text-sm text-gray-600">{title}</div>
            {subtitle && (
              <div className="text-xs text-gray-500">{subtitle}</div>
            )}
            {trend && (
              <div
                className={`text-xs ${
                  trend.isPositive ? "text-green-600" : "text-red-600"
                }`}
              >
                {trend.isPositive ? "+" : ""}
                {trend.value}%
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Stats Grid Component
interface StatsGridProps {
  stats: StatCardProps[];
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {stats.map((stat, index) => (
      <StatCard key={index} {...stat} />
    ))}
  </div>
);

// Company Logo Component
interface CompanyLogoProps {
  company: string;
  size?: "sm" | "md" | "lg";
  showFallback?: boolean;
  className?: string;
}

export const CompanyLogo: React.FC<CompanyLogoProps> = ({
  company,
  size = "md",
  showFallback = true,
  className = "",
}) => {
  const logoMap: Record<string, string> = {
    "Agritech Haven Limited Partnership": "/logos/agritech-haven-lp.png",
    "Agritech Haven International Inc.": "/logos/agritech-haven-intl.png",
    "Energy Haven Limited Partnership": "/logos/energy-haven-lp.png",
    "Energy Haven General Partnership Inc.": "/logos/energy-haven-gp.png",
    "Havenz Smart Communities": "/logos/havenz-smart-communities.png",
    "AHI Management": "/logos/ahi-management.png",
    "Havenz Tech": "/logos/havenz-tech.png",
    "AHI Red Deer": "/logos/ahi-red-deer.png",
    "Denvr Dataworks": "/logos/denvr-dataworks.png",
  };

  const sizeMap = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
  };

  const logoUrl = logoMap[company];

  if (logoUrl) {
    return (
      <Image
        src={logoUrl}
        alt={`${company} logo`}
        className={`object-contain ${sizeMap[size]} ${className}`}
        width={size === "sm" ? 32 : size === "md" ? 48 : 64}
        height={size === "sm" ? 32 : size === "md" ? 48 : 64}
        onError={(e) => {
          if (showFallback) {
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
          }
        }}
      />
    );
  }

  if (showFallback) {
    return (
      <div
        className={`${sizeMap[size]} bg-blue-100 rounded-lg flex items-center justify-center ${className}`}
      >
        <Building2 className="w-1/2 h-1/2 text-blue-600" />
      </div>
    );
  }

  return null;
};

// Search and Filter Component
interface FilterOption {
  key: string;
  label: string;
  value: any;
}

interface SearchAndFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  filterOptions: FilterOption[];
  placeholder?: string;
  showExport?: boolean;
  onExport?: () => void;
  customActions?: React.ReactNode;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  filterOptions,
  placeholder = "Search...",
  showExport = false,
  onExport,
  customActions,
}) => {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
        <Input
          placeholder={placeholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <select
        value={filterValue}
        onChange={(e) => onFilterChange(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {filterOptions.map((option) => (
          <option key={option.key} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {showExport && onExport && (
        <Button variant="outline" onClick={onExport}>
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      )}

      {customActions}
    </div>
  );
};

// Empty State Component
interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  );
};
