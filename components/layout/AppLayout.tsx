"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bot,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/features/users/components/UserProfile";
import { NotificationDropdown } from "@/components/common/NotificationDropdown";
import { Sidebar } from "./Sidebar";
import { MyTasksSidebar } from "./MyTasksSidebar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { BreadcrumbProvider, useBreadcrumb } from "@/contexts/BreadcrumbContext";

interface AppLayoutProps {
  children: React.ReactNode;
}

// Route to base title mapping
const routeTitles: Record<string, { title: string; href: string }> = {
  companies: { title: "Companies", href: "/companies" },
  departments: { title: "Departments", href: "/departments" },
  projects: { title: "Projects", href: "/projects" },
  properties: { title: "Properties", href: "/properties" },
  "document-control": { title: "Document Control", href: "/document-control" },
  users: { title: "User Management", href: "/users" },
  workflows: { title: "Workflows", href: "/workflows" },
  "virtual-chatbots": { title: "Virtual Chatbots", href: "/virtual-chatbots" },
  "secure-datacenter": { title: "Secure Data Center", href: "/secure-datacenter" },
  "bms-hardware": { title: "BMS Hardware", href: "/bms-hardware" },
  "z-ai": { title: "Z AI Assistant", href: "/z-ai" },
  settings: { title: "Settings", href: "/settings" },
};

function AppLayoutContent({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { breadcrumbs } = useBreadcrumb();

  // Get base route info from pathname
  const getRouteInfo = () => {
    if (pathname === "/") return { title: "Global Dashboard", href: "/" };

    const segments = pathname.split("/").filter(Boolean);
    const baseRoute = segments[0];

    return routeTitles[baseRoute] || { title: "Havenz Hub", href: "/" };
  };

  const routeInfo = getRouteInfo();
  const isDetailPage = pathname.split("/").filter(Boolean).length > 1;

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Enhanced Header */}
          <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-2 text-sm">
              {/* Base route - always a link on detail pages */}
              {isDetailPage ? (
                <Link
                  href={routeInfo.href}
                  className="text-lg font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {routeInfo.title}
                </Link>
              ) : (
                <h2 className="text-lg font-semibold text-gray-900">
                  {routeInfo.title}
                </h2>
              )}

              {/* Dynamic breadcrumbs from context */}
              {breadcrumbs.map((crumb, index) => (
                <div key={index} className="flex items-center gap-2">
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className="text-lg font-semibold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-lg font-semibold text-gray-900">
                      {crumb.label}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/z-ai")}
              >
                <Bot className="w-4 h-4 mr-2" />
                Ask Z
              </Button>

              <NotificationDropdown />

              <UserProfile />
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>

        {/* My Tasks Sidebar */}
        <MyTasksSidebar />
      </div>
    </div>
  );
}

// Wrapper component that provides the BreadcrumbContext
export function AppLayout({ children }: AppLayoutProps) {
  return (
    <BreadcrumbProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </BreadcrumbProvider>
  );
}
