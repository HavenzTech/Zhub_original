"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FolderOpen,
  FileText,
  Bot,
  Search,
  ChevronRight,
  ChevronDown,
  Check,
  Globe,
  Settings,
  ClipboardCheck,
  PanelLeftClose,
  PanelLeft,
  X,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { authService } from "@/lib/services/auth";
import { bmsApi } from "@/lib/services/bmsApi";
import { Company } from "@/types/bms";
import { NotificationDropdown } from "@/components/common/NotificationDropdown";

export interface SidebarItem {
  id: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  adminOnly?: boolean;
  badge?: number;
}

const sidebarItems: SidebarItem[] = [
  { id: "dashboard", path: "/", icon: Home, label: "Dashboard" },
  { id: "departments", path: "/departments", icon: Users, label: "Departments" },
  { id: "projects", path: "/projects", icon: FolderOpen, label: "Projects" },
  { id: "properties", path: "/properties", icon: Home, label: "Properties" },
  { id: "document-control", path: "/document-control", icon: FileText, label: "Document Control" },
  { id: "workflow-tasks", path: "/workflow-tasks", icon: ClipboardCheck, label: "My Tasks" },
  { id: "z-ai", path: "/z-ai", icon: Bot, label: "Z AI" },
];


interface SidebarProps {
  onOpenCommandPalette?: () => void;
}

export function Sidebar({ onOpenCommandPalette }: SidebarProps) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userName, setUserName] = useState("");
  const [userInitials, setUserInitials] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [companySwitcherOpen, setCompanySwitcherOpen] = useState(false);
  const [companies, setCompanies] = useState<Array<{ companyId: string; companyName: string; role: string }>>([]);
  const [currentCompanyId, setCurrentCompanyId] = useState("");
  const [companyLogoUrl, setCompanyLogoUrl] = useState<string | null>(null);
  const pathname = usePathname();

  const loadCompanyLogo = useCallback(async (companyId: string) => {
    try {
      const token = authService.getToken();
      if (token) bmsApi.setToken(token);
      bmsApi.setCompanyId(companyId);
      const company = (await bmsApi.companies.getById(companyId)) as Company;
      if (company?.logoUrl) {
        setCompanyLogoUrl(company.logoUrl);
      }
    } catch {
      // Silently fail — fallback to initial letter
    }
  }, []);

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    const auth = authService.getAuth();
    if (auth) {
      setUserName(auth.name || auth.email || "User");
      const parts = (auth.name || auth.email || "U").split(" ");
      setUserInitials(
        parts.length > 1
          ? `${parts[0][0]}${parts[1][0]}`.toUpperCase()
          : parts[0].slice(0, 2).toUpperCase()
      );
      setCompanies(auth.companies || []);
      setCurrentCompanyId(auth.currentCompanyId || "");
      if (auth.currentCompanyId) {
        loadCompanyLogo(auth.currentCompanyId);
      }
    }
  }, [loadCompanyLogo]);

  const currentCompany = companies.find((c) => c.companyId === currentCompanyId);

  const handleSwitchCompany = (companyId: string) => {
    authService.setCurrentCompanyId(companyId);
    setCompanySwitcherOpen(false);
    window.location.reload();
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "super_admin": return "Super Admin";
      case "admin": return "Admin";
      case "dept_manager": return "Dept Manager";
      case "project_lead": return "Project Lead";
      case "employee": return "Employee";
      default: return role || "Member";
    }
  };

  const visibleItems = useMemo(
    () => sidebarItems.filter((item) => !item.adminOnly || isAdmin),
    [isAdmin]
  );

  const isActive = (path: string) => {
    if (path === "/") return pathname === "/";
    return pathname.startsWith(path);
  };

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-4">
        <Link href="/" className="flex items-center">
          <img
            src="/logo.png"
            alt="Havenz Hub"
            className={collapsed ? "h-7 object-contain" : "h-8 object-contain"}
          />
        </Link>
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="ml-auto rounded-md p-1 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="ml-auto rounded-md p-1 text-stone-400 dark:text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <PanelLeft className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Company / Role Switcher */}
      {!collapsed && currentCompany && (
        <div className="px-2.5 pb-3 relative">
          <button
            onClick={() => setCompanySwitcherOpen(!companySwitcherOpen)}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left transition-colors hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {companyLogoUrl ? (
              <img
                src={companyLogoUrl}
                alt={currentCompany.companyName || "Company"}
                className="h-8 w-8 shrink-0 rounded-lg object-contain"
              />
            ) : (
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-200 dark:bg-stone-800 text-xs font-medium text-stone-600 dark:text-stone-300">
                {currentCompany.companyName?.charAt(0)?.toUpperCase() || "C"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="truncate text-[13px] font-medium text-stone-900 dark:text-white">
                {currentCompany.companyName}
              </div>
              <div className="text-[11px] text-stone-500">
                {getRoleLabel(currentCompany.role)}
              </div>
            </div>
            <ChevronDown
              className={cn(
                "h-3.5 w-3.5 text-stone-400 dark:text-stone-500 transition-transform",
                companySwitcherOpen && "rotate-180"
              )}
            />
          </button>

          {/* Dropdown */}
          {companySwitcherOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setCompanySwitcherOpen(false)}
              />
              <div className="absolute left-2.5 right-2.5 top-full z-20 mt-1 rounded-lg border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-900 py-1 shadow-lg">
                {companies.map((company) => (
                  <button
                    key={company.companyId}
                    onClick={() => handleSwitchCompany(company.companyId)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2 text-left transition-colors hover:bg-stone-100 dark:hover:bg-stone-800",
                      company.companyId === currentCompanyId && "bg-stone-100 dark:bg-stone-800"
                    )}
                  >
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-stone-200 dark:bg-stone-800 text-[10px] font-medium text-stone-600 dark:text-stone-300">
                      {company.companyName?.charAt(0)?.toUpperCase() || "C"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-[12px] text-stone-900 dark:text-white">
                        {company.companyName}
                      </div>
                      <div className="text-[10px] text-stone-500">
                        {getRoleLabel(company.role)}
                      </div>
                    </div>
                    {company.companyId === currentCompanyId && (
                      <Check className="h-3.5 w-3.5 text-accent-cyan" />
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Command Palette Trigger */}
      {!collapsed && (
        <div className="px-2.5 pb-4">
          <button
            onClick={onOpenCommandPalette}
            className="flex w-full items-center gap-2 rounded-lg border border-stone-200 dark:border-stone-800 px-3 py-2 text-[13px] text-stone-400 dark:text-stone-500 transition-colors hover:border-stone-400 dark:hover:border-stone-600 hover:text-stone-600 dark:hover:text-stone-300"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="flex-1 text-left">Search...</span>
            <kbd className="rounded bg-stone-100 dark:bg-stone-800 px-1.5 py-0.5 text-[11px] text-stone-500 dark:text-stone-400">
              ⌘K
            </kbd>
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              href={item.path}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] transition-colors",
                active
                  ? "bg-accent-cyan/15 text-accent-cyan"
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-900 dark:hover:text-stone-200"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" />
              {!collapsed && (
                <span className="font-medium">{item.label}</span>
              )}
              {!collapsed && item.badge != null && item.badge > 0 && (
                <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-medium text-white">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

      </nav>

      {/* User profile */}
      <div className="border-t border-stone-200 dark:border-stone-800 p-3">
        <div className="flex items-center gap-2.5 rounded-lg p-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cyan text-xs font-medium text-white">
            {userInitials || "U"}
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 overflow-hidden">
                <div className="truncate text-[13px] text-stone-900 dark:text-white">
                  {userName}
                </div>
                <div className="text-[11px] text-stone-500">
                  {isAdmin ? "Admin" : "Member"}
                </div>
              </div>
              <NotificationDropdown />
              <Link
                href="/settings"
                className="rounded-md p-1 text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <Settings className="h-4 w-4" />
              </Link>
            </>
          )}
        </div>

        {/* Log out + Security status */}
        {!collapsed && (
          <div className="mt-1 px-2 space-y-2">
            <button
              onClick={() => {
                authService.logout();
                router.push("/login");
              }}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-[12px] text-stone-500 transition-colors hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-red-400"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Log out</span>
            </button>
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Secure</span>
              <span className="mx-1">·</span>
              <Globe className="h-3 w-3" />
              <span>Calgary, AB</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden h-screen flex-shrink-0 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-all duration-300 md:flex md:flex-col",
          collapsed ? "w-16" : "w-60"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg bg-white dark:bg-stone-900 p-2 text-stone-900 dark:text-white shadow-lg border border-stone-200 dark:border-stone-800 md:hidden"
      >
        <PanelLeft className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-60 bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-transform duration-300 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute right-3 top-4 rounded-md p-1 text-stone-400 hover:text-stone-900 dark:hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>
        {sidebarContent}
      </aside>
    </>
  );
}
