// app/settings/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Card imports removed — using plain divs for new UI pattern
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PermissionMatrixDemo } from "@/features/settings/components/PermissionMatrixDemo";
import { authService } from "@/lib/services/auth";
import {
  Settings,
  Users,
  Shield,
  Bell,
  Database,
  Smartphone,
  Lock,
  Key,
  Eye,
  EyeOff,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  User,
  Mail,
  Phone,
  Building2,
  Globe,
  Clock,
  Download,
  Upload,
  Trash2,
  Edit,
  Plus,
  Zap,
  Fingerprint,
  Scan,
  Monitor,
  Volume2,
  Palette,
  Calendar,
  HardDrive,
  Wifi,
  Server,
  Archive,
  CloudDownload,
  History,
  RotateCcw,
  LogOut,
  FileText,
} from "lucide-react";
import {
  getLevelColor,
  getIntegrationStatusColor,
} from "@/features/settings/utils/settingsHelpers";
import { UserManagementPanel } from "@/features/users/components/UserManagementPanel";
import { FolderTemplatesPanel } from "@/features/admin/components/FolderTemplatesPanel";
import { RetentionPoliciesPanel } from "@/features/admin/components/RetentionPoliciesPanel";
import { WorkflowsPanel } from "@/features/admin/components/WorkflowsPanel";

interface UserRole {
  id: string;
  name: string;
  permissions: string[];
  users: number;
  description: string;
}

interface SecuritySetting {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  level: "low" | "medium" | "high" | "critical";
}

interface IntegrationStatus {
  id: string;
  name: string;
  status: "connected" | "disconnected" | "error" | "pending";
  lastSync: string;
  description: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [usersSubTab, setUsersSubTab] = useState("users");
  const [adminSubTab, setAdminSubTab] = useState("workflows");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // Avoid hydration mismatch — only render theme-dependent UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsAdmin(authService.isAdmin());
  }, []);

  const userRoles: UserRole[] = [
    {
      id: "super_admin",
      name: "Super Administrator",
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

  const securitySettings: SecuritySetting[] = [
    {
      id: "secure-encryption",
      name: "Secure Hardware Encryption",
      description: "Secure hardware-level encryption for all data",
      enabled: true,
      level: "critical",
    },
    {
      id: "mfa-required",
      name: "Multi-Factor Authentication",
      description: "Require MFA for all user logins",
      enabled: true,
      level: "high",
    },
    {
      id: "biometric-auth",
      name: "Biometric Authentication",
      description: "Face recognition and fingerprint authentication",
      enabled: true,
      level: "high",
    },
    {
      id: "session-timeout",
      name: "Automatic Session Timeout",
      description: "Automatically log out users after 30 minutes of inactivity",
      enabled: true,
      level: "medium",
    },
    {
      id: "audit-logging",
      name: "Blockchain Audit Logging",
      description: "Record all user actions on immutable blockchain ledger",
      enabled: true,
      level: "critical",
    },
    {
      id: "ip-whitelist",
      name: "IP Address Whitelist",
      description: "Restrict access to approved IP addresses only",
      enabled: false,
      level: "high",
    },
    {
      id: "device-registration",
      name: "Device Registration Required",
      description: "Only allow access from registered Samsung devices",
      enabled: true,
      level: "medium",
    },
  ];

  const integrations: IntegrationStatus[] = [
    {
      id: "quickbooks",
      name: "QuickBooks",
      status: "connected",
      lastSync: "2 hours ago",
      description: "Financial data synchronization",
    },
    {
      id: "security",
      name: "Encrypted Security",
      status: "connected",
      lastSync: "Active",
      description: "Hardware security platform",
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      status: "connected",
      lastSync: "1 hour ago",
      description: "Customer relationship management",
    },
    {
      id: "telus-iot",
      name: "Telus IoT",
      status: "pending",
      lastSync: "Never",
      description: "IoT sensors and monitoring",
    },
    {
      id: "avigilon",
      name: "Avigilon Security",
      status: "disconnected",
      lastSync: "3 days ago",
      description: "Video security systems",
    },
  ];

  const tabs = useMemo(() => {
    const baseTabs = [
      { id: "permissions", label: "My Permissions", icon: Shield },
      { id: "general", label: "General", icon: Settings },
      { id: "users", label: "Staff & Roles", icon: Users },
      { id: "security", label: "Security", icon: Shield },
      { id: "notifications", label: "Notifications", icon: Bell },
      { id: "integrations", label: "Integrations", icon: Zap },
      { id: "backup", label: "Backup & Data", icon: Database },
    ];
    if (isAdmin) {
      baseTabs.push({ id: "doc-settings", label: "Document Settings", icon: FileText });
    }
    return baseTabs;
  }, [isAdmin]);

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <PermissionMatrixDemo />
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Organization Information</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Organization Name
              </label>
              <Input defaultValue="Havenz Hub Organization" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Primary Contact
              </label>
              <Input defaultValue="admin@havenz.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Phone Number
              </label>
              <Input defaultValue="+1 (403) 555-0100" />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Time Zone
              </label>
              <Input defaultValue="America/Edmonton (MST)" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
              Organization Address
            </label>
            <Textarea
              defaultValue="1234 Innovation Drive&#10;Calgary, Alberta T2P 1J9&#10;Canada"
              rows={3}
            />
          </div>
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

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Auto-save Documents</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Automatically save document changes
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Email Notifications</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Send email notifications for important events
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Real-time Sync</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Enable real-time data synchronization
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Analytics Collection</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Allow anonymous usage analytics
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
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
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Role
            </Button>
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

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <Shield className="w-4 h-4 text-accent-cyan" />
            Security Status
          </h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="font-medium text-stone-900 dark:text-stone-50">
                Encryption Enabled
              </div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Hardware security active
              </div>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <Lock className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="font-medium text-stone-900 dark:text-stone-50">Encrypted</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">AES-256 encryption</div>
            </div>
            <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
              <Fingerprint className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <div className="font-medium text-stone-900 dark:text-stone-50">Biometric Auth</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">Face & fingerprint</div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Security Policies</h3>
        </div>
        <div className="p-5">
          <div className="space-y-4">
            {securitySettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 border border-stone-200 dark:border-stone-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-stone-900 dark:text-stone-50">
                      {setting.name}
                    </span>
                    <Badge className={getLevelColor(setting.level)}>
                      {setting.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-stone-500 dark:text-stone-400">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  disabled={setting.level === "critical"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Authentication Methods</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-accent-cyan" />
                <span className="font-medium text-stone-900 dark:text-stone-50">Password</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                Traditional username and password
              </p>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">Required</Badge>
            </div>

            <div className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Fingerprint className="w-5 h-5 text-accent-cyan" />
                <span className="font-medium text-stone-900 dark:text-stone-50">Biometric</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                Fingerprint and face recognition
              </p>
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">Enabled</Badge>
            </div>

            <div className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-accent-cyan" />
                <span className="font-medium text-stone-900 dark:text-stone-50">NFC</span>
              </div>
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                Near-field communication cards
              </p>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400">Available</Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Notification Preferences</h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Email Notifications</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Receive notifications via email
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Push Notifications</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Mobile push notifications
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">SMS Alerts</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Critical alerts via SMS
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Desktop Notifications</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Browser desktop notifications
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Notification Types</h3>
        </div>
        <div className="p-5 space-y-4">
          {[
            {
              name: "Document Uploads",
              description: "New documents uploaded to your companies",
              enabled: true,
            },
            {
              name: "Task Assignments",
              description: "New tasks assigned to you or your team",
              enabled: true,
            },
            {
              name: "Project Updates",
              description: "Updates to projects you're involved in",
              enabled: true,
            },
            {
              name: "Security Alerts",
              description: "Security-related notifications",
              enabled: true,
            },
            {
              name: "System Maintenance",
              description: "Scheduled maintenance notifications",
              enabled: true,
            },
            {
              name: "Workflow Triggers",
              description: "Automated workflow notifications",
              enabled: false,
            },
            {
              name: "Budget Alerts",
              description: "Budget threshold and spending alerts",
              enabled: true,
            },
            {
              name: "Deadline Reminders",
              description: "Upcoming deadlines and milestones",
              enabled: true,
            },
          ].map((notification, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 border border-stone-200 dark:border-stone-700 rounded-lg"
            >
              <div>
                <div className="font-medium text-stone-900 dark:text-stone-50">
                  {notification.name}
                </div>
                <div className="text-sm text-stone-500 dark:text-stone-400">
                  {notification.description}
                </div>
              </div>
              <Switch defaultChecked={notification.enabled} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">System Integrations</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <div key={integration.id} className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
            <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-stone-900 dark:text-stone-50">{integration.name}</h4>
                <Badge
                  className={getIntegrationStatusColor(integration.status)}
                >
                  {integration.status}
                </Badge>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">
                {integration.description}
              </p>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-stone-500 dark:text-stone-400">Last Sync:</span>
                <span className="font-medium text-stone-900 dark:text-stone-50">{integration.lastSync}</span>
              </div>

              <div className="flex gap-2">
                {integration.status === "connected" ? (
                  <>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Sync Now
                    </Button>
                    <Button variant="outline" size="sm">
                      <Edit className="w-4 h-4 mr-1" />
                      Configure
                    </Button>
                  </>
                ) : (
                  <Button size="sm">
                    <Zap className="w-4 h-4 mr-1" />
                    Connect
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">API Configuration</h3>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
              API Base URL
            </label>
            <Input defaultValue="https://api.havenz.com/v1" />
          </div>

          <div>
            <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
              API Key
            </label>
            <div className="flex gap-2">
              <Input
                type={showPasswords ? "text" : "password"}
                defaultValue="hv_live_sk_abc123xyz789"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowPasswords(!showPasswords)}
              >
                {showPasswords ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Key
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Download Config
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBackupData = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <Database className="w-4 h-4 text-accent-cyan" />
            Backup Configuration
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-stone-900 dark:text-stone-50">Automatic Backups</div>
              <div className="text-sm text-stone-500 dark:text-stone-400">
                Schedule automatic system backups
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Backup Frequency
              </label>
              <select className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-1 block">
                Retention Period
              </label>
              <select className="w-full px-3 py-2 border border-stone-200 dark:border-stone-700 rounded-md bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-50">
                <option>30 days</option>
                <option>90 days</option>
                <option>1 year</option>
                <option>Forever</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>
              <CloudDownload className="w-4 h-4 mr-2" />
              Create Backup Now
            </Button>
            <Button variant="outline">
              <Archive className="w-4 h-4 mr-2" />
              View Backup History
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">Data Export</h3>
        </div>
        <div className="p-5 space-y-4">
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Export your data for backup or migration purposes.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                name: "All Documents",
                description: "Export all documents and files",
                size: "2.4 GB",
              },
              {
                name: "Company Data",
                description: "Export company information and KPIs",
                size: "145 MB",
              },
              {
                name: "User Data",
                description: "Export user accounts and permissions",
                size: "12 MB",
              },
              {
                name: "Audit Logs",
                description: "Export blockchain audit trail",
                size: "89 MB",
              },
            ].map((exportItem, index) => (
              <div
                key={index}
                className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-stone-900 dark:text-stone-50">{exportItem.name}</span>
                  <span className="text-sm text-stone-500 dark:text-stone-400">
                    {exportItem.size}
                  </span>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
                  {exportItem.description}
                </p>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-stone-900 rounded-xl border border-red-200 dark:border-red-900/50">
        <div className="px-5 py-4 border-b border-red-200 dark:border-red-900/50">
          <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Danger Zone
          </h3>
        </div>
        <div className="p-5 space-y-4">
          <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">
              Reset System Settings
            </h4>
            <p className="text-sm text-red-700 dark:text-red-400/80 mb-3">
              This will reset all system settings to default values. This action
              cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Settings
            </Button>
          </div>

          <div className="p-4 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-950/20 rounded-lg">
            <h4 className="font-medium text-red-800 dark:text-red-400 mb-2">Clear All Data</h4>
            <p className="text-sm text-red-700 dark:text-red-400/80 mb-3">
              This will permanently delete all data including documents, users,
              and companies. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-red-300 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      {/* Account */}
      <div className="bg-white dark:bg-stone-900 rounded-xl border border-stone-200 dark:border-stone-700">
        <div className="px-5 py-4 border-b border-stone-200 dark:border-stone-700">
          <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50 flex items-center gap-2">
            <LogOut className="w-4 h-4 text-stone-500" />
            Account
          </h3>
        </div>
        <div className="p-5">
          <div className="p-4 border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800/50 rounded-lg">
            <h4 className="font-medium text-stone-900 dark:text-stone-50 mb-2">
              Log Out
            </h4>
            <p className="text-sm text-stone-500 dark:text-stone-400 mb-3">
              Sign out of your Havenz Hub account on this device.
            </p>
            <Button
              variant="outline"
              className="border-stone-300 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700"
              onClick={() => {
                authService.logout();
                router.push("/login");
              }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Log Out
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-50">Settings</h1>
          <p className="text-stone-500 dark:text-stone-400">
            Configure your Havenz Hub system settings and preferences
          </p>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-stone-200 dark:border-stone-700">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
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
          {activeTab === "permissions" && renderPermissionsTab()}
          {activeTab === "general" && renderGeneralSettings()}
          {activeTab === "users" && renderUsersRoles()}
          {activeTab === "security" && renderSecuritySettings()}
          {activeTab === "notifications" && renderNotifications()}
          {activeTab === "integrations" && renderIntegrations()}
          {activeTab === "backup" && renderBackupData()}
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
