// app/settings/page.tsx
"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useTheme } from "next-themes";
import Image from "next/image";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { authService } from "@/lib/services/auth";
import { useCompaniesQueryCompat } from "@/lib/hooks/queries/useCompaniesQuery";
import { bmsApi } from "@/lib/services/bmsApi";
import type { Company } from "@/types/bms";
import {
  CompanyFormModal,
  type CompanyFormData,
} from "@/features/companies/components/CompanyFormModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Settings,
  Users,
  Plus,
  FileText,
  Building2,
  MapPin,
  Trash2,
  Edit,
  Loader2,
  KeyRound,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import { PageTour } from "@/components/tour/PageTour";
import { TOUR_KEYS } from "@/lib/tour/tour-keys";
import { getSettingsSteps } from "@/lib/tour/steps";
import { UserManagementPanel } from "@/features/users/components/UserManagementPanel";
import { FolderTemplatesPanel } from "@/features/admin/components/FolderTemplatesPanel";
import { RetentionPoliciesPanel } from "@/features/admin/components/RetentionPoliciesPanel";
import { WorkflowsPanel } from "@/features/admin/components/WorkflowsPanel";
import { AccessControlTab } from "@/features/access-control/AccessControlTab";

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  users: number;
  description: string;
}

const emptyFormData: CompanyFormData = {
  name: "",
  industry: "",
  status: "active",
  locationAddress: "",
  locationCity: "",
  locationProvince: "",
  locationCountry: "",
  locationPostalCode: "",
  contactEmail: "",
  contactPhone: "",
  annualRevenue: "",
  logoUrl: "",
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [usersSubTab, setUsersSubTab] = useState("users");
  const [adminSubTab, setAdminSubTab] = useState("workflows");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  // Company management state
  const { companies, loading: companiesLoading, loadCompanies, createCompany, updateCompany, deleteCompany } = useCompaniesQueryCompat();
  const [companyModalOpen, setCompanyModalOpen] = useState(false);
  const [companyModalMode, setCompanyModalMode] = useState<"add" | "edit">("add");
  const [companyFormData, setCompanyFormData] = useState<CompanyFormData>(emptyFormData);
  const [companyLogoFile, setCompanyLogoFile] = useState<File | null>(null);
  const [isSubmittingCompany, setIsSubmittingCompany] = useState(false);
  const [editingCompanyId, setEditingCompanyId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
    setIsSuperAdmin(authService.isSuperAdmin());
  }, []);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const pwRequirements = {
    length: newPassword.length >= 12,
    uppercase: /[A-Z]/.test(newPassword),
    lowercase: /[a-z]/.test(newPassword),
    number: /\d/.test(newPassword),
    special: /[^a-zA-Z0-9]/.test(newPassword),
  };
  const allPwReqsMet = Object.values(pwRequirements).every(Boolean);
  const passwordsMatch = newPassword === confirmPassword && confirmPassword !== "";

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPwReqsMet) { toast.error("Password does not meet all requirements"); return; }
    if (!passwordsMatch) { toast.error("Passwords do not match"); return; }
    if (currentPassword === newPassword) { toast.error("New password must be different from current password"); return; }
    setIsChangingPassword(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      toast.error((err as { message?: string })?.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const userRoles: UserRole[] = [
    {
      id: "super_admin",
      name: "CEO",
      permissions: [
        "Full Platform Access",
        "All Companies",
        "User Management",
        "Security Settings",
      ],
      users: 1,
      description: "Platform-wide access across all companies",
    },
    {
      id: "admin",
      name: "Company Administrator",
      permissions: [
        "Full Company Access",
        "User Management",
        "Security Settings",
        "Company Management",
      ],
      users: 3,
      description: "Full access within the company",
    },
    {
      id: "dept_manager",
      name: "Department Manager",
      permissions: [
        "Manage Assigned Departments",
        "Task Management",
        "Team Management",
        "Report Generation",
      ],
      users: 8,
      description: "Manage assigned departments and view company",
    },
    {
      id: "project_lead",
      name: "Project Lead",
      permissions: [
        "Manage Assigned Projects",
        "Task Management",
        "Team Coordination",
        "Project Reports",
      ],
      users: 12,
      description: "Manage assigned projects and view company",
    },
    {
      id: "employee",
      name: "Employee",
      permissions: [
        "View Assigned Tasks",
        "Update Task Status",
        "View Company Data",
        "Basic Reports",
      ],
      users: 45,
      description: "View and work on assigned tasks only",
    },
  ];

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "general", label: "General", icon: Settings },
    ];
    if (isAdmin) {
      baseTabs.push({ id: "users", label: "Staff & Roles", icon: Users });
    }
    if (isSuperAdmin) {
      baseTabs.push({ id: "companies", label: "Companies", icon: Building2 });
    }
    if (isAdmin) {
      baseTabs.push({ id: "doc-settings", label: "Document Settings", icon: FileText });
      baseTabs.push({ id: "access-control", label: "Access Control", icon: KeyRound });
    }
    return baseTabs;
  }, [isAdmin, isSuperAdmin]);

  // Load companies when tab is selected
  useEffect(() => {
    if (activeTab === "companies" && isSuperAdmin) {
      loadCompanies();
    }
  }, [activeTab, isSuperAdmin, loadCompanies]);

  const handleOpenAddCompany = () => {
    setCompanyModalMode("add");
    setCompanyFormData(emptyFormData);
    setCompanyLogoFile(null);
    setEditingCompanyId(null);
    setCompanyModalOpen(true);
  };

  const handleOpenEditCompany = (company: Company) => {
    setCompanyModalMode("edit");
    setCompanyFormData({
      name: company.name,
      industry: company.industry || "",
      status: company.status,
      locationAddress: company.locationAddress || "",
      locationCity: company.locationCity || "",
      locationProvince: company.locationProvince || "",
      locationCountry: company.locationCountry || "",
      locationPostalCode: company.locationPostalCode || "",
      contactEmail: company.contactEmail || "",
      contactPhone: company.contactPhone || "",
      annualRevenue: company.annualRevenue?.toString() || "",
      logoUrl: company.logoUrl || "",
    });
    setCompanyLogoFile(null);
    setEditingCompanyId(company.id || null);
    setCompanyModalOpen(true);
  };

  const handleSubmitCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingCompany(true);

    // Map frontend form fields to backend API field names
    const companyData: Record<string, unknown> = {
      name: companyFormData.name,
      industry: companyFormData.industry || null,
      status: companyFormData.status,
      address: companyFormData.locationAddress || null,
      city: companyFormData.locationCity || null,
      province: companyFormData.locationProvince || null,
      country: companyFormData.locationCountry || null,
      postalCode: companyFormData.locationPostalCode || null,
      email: companyFormData.contactEmail || null,
      phone: companyFormData.contactPhone || null,
      annualRevenue: companyFormData.annualRevenue ? parseFloat(companyFormData.annualRevenue) : null,
    };

    let success = false;
    let newCompanyId: string | null = null;

    if (companyModalMode === "edit" && editingCompanyId) {
      // Backend requires id in body to match URL param
      companyData.id = editingCompanyId;
      success = await updateCompany(editingCompanyId, companyData as Partial<Company>);
      newCompanyId = editingCompanyId;
    } else {
      const result = await createCompany(companyData as Partial<Company>);
      success = result !== null;
      newCompanyId = result?.id || null;
    }

    // Upload logo if provided and company was created/updated
    if (success && companyLogoFile && newCompanyId) {
      try {
        await bmsApi.companies.uploadLogo(newCompanyId, companyLogoFile);
      } catch {
        // Logo upload failed but company was created — non-blocking
      }
    }

    if (success) {
      setCompanyModalOpen(false);
      loadCompanies();
    }

    setIsSubmittingCompany(false);
  };

  const handleDeleteCompany = async () => {
    if (!deleteTarget?.id) return;
    await deleteCompany(deleteTarget.id);
    setDeleteTarget(null);
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 opacity-60 pointer-events-none">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Organization Information</h3>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">Coming soon</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Organization Name
              </label>
              <Input defaultValue="Havenz Hub Organization" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Primary Contact
              </label>
              <Input defaultValue="sunny@havenzcorp.com" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Phone Number
              </label>
              <Input defaultValue="+1 (403) 830-7209" disabled />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Time Zone
              </label>
              <Input defaultValue="America/Edmonton (MST)" disabled />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
              Organization Address
            </label>
            <Textarea
              defaultValue="#600, 1331 Macleod Trail SE&#10;Calgary, AB T2G 0K3&#10;Canada"
              rows={3}
              disabled
            />
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700 flex items-center gap-2">
          <Lock className="w-4 h-4 text-stone-500 dark:text-stone-400" />
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Security</h3>
        </div>
        <div className="p-5">
          <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
            <div className="space-y-1.5">
              <Label htmlFor="settings-current-pw">Current Password</Label>
              <div className="relative">
                <Input id="settings-current-pw" type={showCurrentPw ? "text" : "password"}
                  placeholder="Enter current password" value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-new-pw">New Password</Label>
              <div className="relative">
                <Input id="settings-new-pw" type={showNewPw ? "text" : "password"}
                  placeholder="Enter new password" value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)} required className="pr-10" />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {newPassword && (
                <div className="pt-1 space-y-1">
                  {[
                    { met: pwRequirements.length, text: "At least 12 characters" },
                    { met: pwRequirements.uppercase, text: "One uppercase letter" },
                    { met: pwRequirements.lowercase, text: "One lowercase letter" },
                    { met: pwRequirements.number, text: "One number" },
                    { met: pwRequirements.special, text: "One special character" },
                  ].map(({ met, text }) => (
                    <div key={text} className={`flex items-center gap-1.5 text-xs ${met ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400 dark:text-stone-500"}`}>
                      <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${met ? "bg-emerald-500" : "bg-stone-300 dark:bg-stone-600"}`} />
                      {text}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="settings-confirm-pw">Confirm New Password</Label>
              <div className="relative">
                <Input id="settings-confirm-pw" type={showConfirmPw ? "text" : "password"}
                  placeholder="Confirm new password" value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)} required
                  className={`pr-10 ${confirmPassword && !passwordsMatch ? "border-destructive focus-visible:ring-destructive" : ""}`} />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:hover:text-stone-300">
                  {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {confirmPassword && !passwordsMatch && (
                <p className="text-xs text-destructive">Passwords do not match</p>
              )}
            </div>
            <Button type="submit" disabled={isChangingPassword || !currentPassword || !allPwReqsMet || !passwordsMatch} size="sm">
              {isChangingPassword ? <><Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />Changing...</> : "Change Password"}
            </Button>
          </form>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">System Preferences</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Dark Mode</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Use dark theme across the interface
              </div>
            </div>
            <Switch
              checked={mounted ? theme === "dark" : false}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsersRoles = () => (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <div className="flex gap-1">
        {[
          { id: "users", label: "Staff" },
          { id: "roles", label: "Roles & Permissions" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setUsersSubTab(tab.id)}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              usersSubTab === tab.id
                ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sub-tab content */}
      {usersSubTab === "users" && <UserManagementPanel />}

      {usersSubTab === "roles" && (
        <>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">User Roles & Permissions</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {userRoles.map((role) => (
              <div key={role.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{role.name}</h4>
                  <Badge className="bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 text-[10px]">{role.users} users</Badge>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mb-4">{role.description}</p>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-stone-700 dark:text-stone-300">
                    Permissions:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {role.permissions.map((permission, index) => (
                      <Badge key={index} className="bg-accent-cyan/10 text-accent-cyan border-0 text-[10px]">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <AppLayout>
      <PageTour tourKey={TOUR_KEYS.SETTINGS} options={{ steps: getSettingsSteps(authService.isAdmin(), authService.isSuperAdmin()), enabled: true }} />
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Settings</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Configure your Havenz Hub system settings and preferences
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-stone-200 dark:border-stone-700" data-tour="settings-tabs">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                data-tour={`settings-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-accent-cyan text-accent-cyan"
                    : "border-transparent text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300 hover:border-stone-300 dark:hover:border-stone-600"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "general" && <div>{renderGeneralSettings()}</div>}
          {activeTab === "users" && isAdmin && <div>{renderUsersRoles()}</div>}
          {activeTab === "companies" && isSuperAdmin && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">Companies</h3>
                <Button onClick={handleOpenAddCompany}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Company
                </Button>
              </div>

              {companiesLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                  <p className="text-stone-500 dark:text-stone-400">No companies yet</p>
                  <p className="text-sm text-stone-400 dark:text-stone-500">Create your first company to get started</p>
                </div>
              ) : (
                <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700 overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-stone-50 dark:bg-stone-800/50">
                        <th className="text-left text-xs font-medium text-stone-500 dark:text-stone-400 px-5 py-3">Company</th>
                        <th className="text-left text-xs font-medium text-stone-500 dark:text-stone-400 px-5 py-3">Industry</th>
                        <th className="text-left text-xs font-medium text-stone-500 dark:text-stone-400 px-5 py-3">Location</th>
                        <th className="text-left text-xs font-medium text-stone-500 dark:text-stone-400 px-5 py-3">Status</th>
                        <th className="text-right text-xs font-medium text-stone-500 dark:text-stone-400 px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                      {companies.map((company) => (
                        <tr key={company.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/30">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              {company.logoUrl ? (
                                <Image
                                  src={company.logoUrl}
                                  alt={company.name}
                                  width={36}
                                  height={36}
                                  className="w-9 h-9 rounded-lg object-cover flex-shrink-0"
                                  unoptimized
                                />
                              ) : (
                                <div className="w-9 h-9 bg-accent-cyan/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-4 h-4 text-accent-cyan" />
                                </div>
                              )}
                              <div>
                                <div className="font-medium text-stone-900 dark:text-stone-50 text-sm">{company.name}</div>
                                {company.contactEmail && (
                                  <div className="text-xs text-stone-400">{company.contactEmail}</div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-sm text-stone-600 dark:text-stone-400">
                            {company.industry || "—"}
                          </td>
                          <td className="px-5 py-4 text-sm text-stone-600 dark:text-stone-400">
                            {company.locationCity || company.locationProvince
                              ? [company.locationCity, company.locationProvince].filter(Boolean).join(", ")
                              : "—"}
                          </td>
                          <td className="px-5 py-4">
                            <Badge className={
                              company.status === "active"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400"
                                : company.status === "pending"
                                ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400"
                                : "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-400"
                            }>
                              {company.status}
                            </Badge>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenEditCompany(company)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                                onClick={() => setDeleteTarget(company)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <CompanyFormModal
                open={companyModalOpen}
                onOpenChange={setCompanyModalOpen}
                mode={companyModalMode}
                formData={companyFormData}
                setFormData={setCompanyFormData}
                isSubmitting={isSubmittingCompany}
                onSubmit={handleSubmitCompany}
                companyId={editingCompanyId || undefined}
                logoFile={companyLogoFile}
                setLogoFile={setCompanyLogoFile}
                currentLogoUrl={companyFormData.logoUrl || undefined}
                onRemoveLogo={undefined}
              />

              <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Company</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete <strong className="text-stone-900 dark:text-stone-50">{deleteTarget?.name}</strong>? This will permanently remove the company and all associated data. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteCompany}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Company
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {activeTab === "access-control" && isAdmin && (
            <div className="space-y-2">
              <div>
                <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Access Control</h2>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                  Manage HID terminals, area access, and emergency lockdown controls.
                </p>
              </div>
              <AccessControlTab />
            </div>
          )}
          {activeTab === "doc-settings" && isAdmin && (
            <div className="space-y-6">
              <div className="flex gap-1">
                {[
                  { id: "workflows", label: "Workflows" },
                  { id: "folder-templates", label: "Folder Templates" },
                  { id: "retention-policies", label: "Retention Policies" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAdminSubTab(tab.id)}
                    className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                      adminSubTab === tab.id
                        ? "bg-accent-cyan/10 text-accent-cyan font-medium"
                        : "text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {adminSubTab === "folder-templates" && <FolderTemplatesPanel />}
              {adminSubTab === "retention-policies" && <RetentionPoliciesPanel />}
              {adminSubTab === "workflows" && <WorkflowsPanel />}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
