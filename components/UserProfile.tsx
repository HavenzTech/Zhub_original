"use client";

import { useState } from "react";
import { authService } from "@/lib/services/auth";
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

  if (!auth) return null;

  const currentCompany = auth.companies.find(
    (c) => c.companyId === auth.currentCompanyId
  );

  const handleLogout = () => {
    authService.clearAuth();
    router.push("/login");
  };

  const handleSwitchCompany = (companyId: string) => {
    authService.setCurrentCompanyId(companyId);
    window.location.reload(); // Reload to fetch new company data
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800 border-red-200";
      case "member":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "viewer":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return "👑";
      case "member":
        return "✏️";
      case "viewer":
        return "👁️";
      default:
        return "👤";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-2 h-auto py-2 px-3"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="hidden md:flex flex-col items-start">
            <span className="text-sm font-medium text-gray-900">
              {auth.name}
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">
                {currentCompany?.role}
              </span>
              <Badge
                className={`text-xs px-1.5 py-0 h-4 ${getRoleBadgeColor(
                  currentCompany?.role || ""
                )}`}
              >
                {getRoleIcon(currentCompany?.role || "")}{" "}
                {currentCompany?.role?.toUpperCase()}
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
                <PermissionIndicator role={currentCompany?.role || "viewer"} />
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
                      {getRoleIcon(company.role)} {company.role.toUpperCase()}
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
    admin: { label: "Full Access", icon: Shield, color: "text-red-600" },
    member: { label: "Can Edit", icon: Shield, color: "text-blue-600" },
    viewer: { label: "Read Only", icon: Shield, color: "text-gray-600" },
  };

  const perm =
    permissions[role as keyof typeof permissions] || permissions.viewer;
  const Icon = perm.icon;

  return (
    <div className={`flex items-center gap-1 text-xs ${perm.color}`}>
      <Icon className="w-3 h-3" />
      <span>{perm.label}</span>
    </div>
  );
}
