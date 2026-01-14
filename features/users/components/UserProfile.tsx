"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { authService } from "@/lib/services/auth";
import { bmsApi } from "@/lib/services/bmsApi";
import type { UserResponse } from "@/types/bms";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Building2, Shield, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";

export function UserProfile() {
  const router = useRouter();
  const auth = authService.getAuth();
  const [imageError, setImageError] = useState(false);
  const [pictureUrl, setPictureUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPicture = async () => {
      if (!auth?.userId) return;

      // Set up API with current auth
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();
      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      try {
        const userData = await bmsApi.users.getById(auth.userId) as UserResponse;
        if (userData?.pictureUrl) {
          setPictureUrl(userData.pictureUrl);
        }
      } catch (error) {
        console.error("Failed to fetch user picture:", error);
      }
    };

    fetchUserPicture();
  }, [auth?.userId]);

  if (!auth) return null;

  const currentCompany = auth.companies.find(
    (c) => c.companyId === auth.currentCompanyId
  );

  const handleLogout = async () => {
    await authService.logout();
    router.push("/login");
  };

  const handleSwitchCompany = (companyId: string) => {
    authService.setCurrentCompanyId(companyId);
    window.location.reload(); // Reload to fetch new company data
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "dept_manager":
        return "bg-teal-100 text-teal-800 border-teal-200";
      case "project_lead":
        return "bg-green-100 text-green-800 border-green-200";
      case "employee":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "super_admin":
        return "🔮";
      case "admin":
        return "👑";
      case "dept_manager":
        return "🏢";
      case "project_lead":
        return "📋";
      case "employee":
        return "👤";
      default:
        return "👤";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Admin";
      case "admin":
        return "Admin";
      case "dept_manager":
        return "Dept Manager";
      case "project_lead":
        return "Project Lead";
      case "employee":
        return "Employee";
      default:
        return role || "Unknown";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto py-2 px-3"
        >
          {pictureUrl && !imageError ? (
            <Image
              src={pictureUrl}
              alt={auth.name || "Profile"}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
          )}
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">
              {auth.name}
            </span>
            <div className="flex items-center gap-1">
              <Badge
                className={`text-xs px-1.5 py-0 h-4 ${getRoleBadgeColor(
                  currentCompany?.role || ""
                )}`}
              >
                {getRoleIcon(currentCompany?.role || "")}{" "}
                {getRoleLabel(currentCompany?.role || "")}
              </Badge>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-500" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{auth.name}</p>
            <p className="text-xs text-muted-foreground">{auth.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Current Company */}
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Current Company
        </DropdownMenuLabel>
        <div className="px-2 py-2 bg-gray-50 mx-2 rounded-md">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium">
                {currentCompany?.companyName}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  className={`text-xs ${getRoleBadgeColor(
                    currentCompany?.role || ""
                  )}`}
                >
                  {getRoleIcon(currentCompany?.role || "")}{" "}
                  {currentCompany?.role?.toUpperCase()}
                </Badge>
                <PermissionIndicator role={currentCompany?.role || "employee"} />
              </div>
            </div>
          </div>
        </div>

        {/* Switch Company */}
        {auth.companies.length > 1 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Switch Company
            </DropdownMenuLabel>
            {auth.companies
              .filter((c) => c.companyId !== auth.currentCompanyId)
              .map((company) => (
                <DropdownMenuItem
                  key={company.companyId}
                  onClick={() => handleSwitchCompany(company.companyId)}
                  className="flex items-center gap-2"
                >
                  <Building2 className="w-4 h-4" />
                  <div className="flex-1">
                    <p className="text-sm">{company.companyName}</p>
                    <Badge
                      className={`text-xs mt-1 ${getRoleBadgeColor(
                        company.role
                      )}`}
                    >
                      {getRoleIcon(company.role)} {getRoleLabel(company.role)}
                    </Badge>
                  </div>
                </DropdownMenuItem>
              ))}
          </>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function PermissionIndicator({ role }: { role: string }) {
  const permissions = {
    super_admin: { label: "Full Platform Access", icon: Shield, color: "text-purple-600" },
    admin: { label: "Full Company Access", icon: Shield, color: "text-red-600" },
    dept_manager: { label: "Manage Departments", icon: Shield, color: "text-teal-600" },
    project_lead: { label: "Manage Projects", icon: Shield, color: "text-green-600" },
    employee: { label: "View & Tasks", icon: Shield, color: "text-blue-600" },
  };

  const perm =
    permissions[role as keyof typeof permissions] || permissions.employee;
  const Icon = perm.icon;

  return (
    <div className={`flex items-center gap-1 text-xs ${perm.color}`}>
      <Icon className="w-3 h-3" />
      <span>{perm.label}</span>
    </div>
  );
}
