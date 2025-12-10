"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Building2,
  Users,
  FolderOpen,
  FileText,
  Shield,
  Bot,
  Search,
  ChevronRight,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authService } from "@/lib/services/auth";

export interface SidebarItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", path: "/", icon: Home, label: "Global Dashboard" },
  { id: "companies", path: "/companies", icon: Building2, label: "Companies" },
  {
    id: "departments",
    path: "/departments",
    icon: Users,
    label: "Departments",
  },
  { id: "projects", path: "/projects", icon: FolderOpen, label: "Projects" },
  { id: "properties", path: "/properties", icon: Home, label: "Properties" },
  {
    id: "document-control",
    path: "/document-control",
    icon: FileText,
    label: "Document Control",
  },
  {
    id: "users",
    path: "/users",
    icon: Shield,
    label: "User Management",
    adminOnly: true,
  },
  { id: "z-ai", path: "/z-ai", icon: Bot, label: "Z AI" },
];

export function Sidebar() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();

  // Filter out admin-only items if user is not admin/super_admin
  const visibleItems = sidebarItems.filter((item) => {
    if (item.adminOnly) {
      const role = authService.getCurrentRole();
      return role === "admin" || role === "super_admin";
    }
    return true;
  });

  // Determine active item based on pathname
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  return (
    <div
      className={`${
        sidebarCollapsed ? "w-16" : "w-64"
      } bg-white border-r border-gray-200 transition-all duration-300 flex-shrink-0`}
    >
      <div className="p-4 h-full flex flex-col">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8">
          <Link href="/">
            {!sidebarCollapsed ? (
              <Image
                src="/logo.png"
                alt="Havenz Hub"
                width={120}
                height={32}
                className="h-8 object-contain"
              />
            ) : (
              <Image
                src="/logo.png"
                alt="Havenz Hub"
                width={32}
                height={32}
                className="w-8 h-8 object-contain mx-auto"
              />
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`${sidebarCollapsed ? "" : "ml-auto"}`}
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                sidebarCollapsed ? "" : "rotate-180"
              }`}
            />
          </Button>
        </div>

        {/* Enhanced Search with Z AI */}
        {!sidebarCollapsed && (
          <div className="mb-6">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Ask Z or search..."
                className="pl-10 bg-gray-50 border-gray-200"
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.id}
                href={item.path}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                  active
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Enhanced Security Status */}
        {!sidebarCollapsed && (
          <div className="mt-auto">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs font-medium text-green-700">
                  ALL SYSTEMS SECURE
                </span>
              </div>
              <div className="text-xs text-green-600">
                On-premise • Encrypted • Monitored
              </div>
            </div>

            <div className="text-xs text-center text-gray-500">
              <div className="mb-1">Havenz Hub v3.2.1</div>
              <div className="flex items-center justify-center gap-1">
                <Globe className="w-3 h-3" />
                <span>Calgary, AB</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
