// app/settings/page.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PermissionMatrixDemo } from "@/components/PermissionMatrixDemo";
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
} from "lucide-react";
import {
  getLevelColor,
  getIntegrationStatusColor,
} from "@/features/settings/utils/settingsHelpers";

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
  const [activeTab, setActiveTab] = useState("general");
  const [showPasswords, setShowPasswords] = useState(false);

  const userRoles: UserRole[] = [
    {
      id: "admin",
      name: "System Administrator",
      permissions: [
        "All System Access",
        "User Management",
        "Security Settings",
        "Company Management",
      ],
      users: 3,
      description: "Full system access and administrative privileges",
    },
    {
      id: "manager",
      name: "Department Manager",
      permissions: [
        "Department Access",
        "Project Management",
        "Team Management",
        "Report Generation",
      ],
      users: 8,
      description: "Department-level management and oversight",
    },
    {
      id: "employee",
      name: "Standard Employee",
      permissions: [
        "Document Access",
        "Task Management",
        "Company Dashboard",
        "Basic Reports",
      ],
      users: 45,
      description: "Standard employee access for daily operations",
    },
    {
      id: "viewer",
      name: "Read-Only Viewer",
      permissions: ["View Access", "Basic Reports"],
      users: 12,
      description: "Read-only access to assigned resources",
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

  const tabs = [
    { id: "permissions", label: "My Permissions", icon: Shield },
    { id: "general", label: "General", icon: Settings },
    { id: "users", label: "Users & Roles", icon: Users },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "integrations", label: "Integrations", icon: Zap },
    { id: "backup", label: "Backup & Data", icon: Database },
  ];

  const renderPermissionsTab = () => (
    <div className="space-y-6">
      <PermissionMatrixDemo />
    </div>
  );

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Organization Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Organization Name
              </label>
              <Input defaultValue="Havenz Hub Organization" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Primary Contact
              </label>
              <Input defaultValue="admin@havenz.com" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone Number
              </label>
              <Input defaultValue="+1 (403) 555-0100" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Time Zone
              </label>
              <Input defaultValue="America/Edmonton (MST)" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Organization Address
            </label>
            <Textarea
              defaultValue="1234 Innovation Drive&#10;Calgary, Alberta T2P 1J9&#10;Canada"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>System Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Dark Mode</div>
              <div className="text-sm text-gray-600">
                Use dark theme across the interface
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Auto-save Documents</div>
              <div className="text-sm text-gray-600">
                Automatically save document changes
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-600">
                Send email notifications for important events
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Real-time Sync</div>
              <div className="text-sm text-gray-600">
                Enable real-time data synchronization
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Analytics Collection</div>
              <div className="text-sm text-gray-600">
                Allow anonymous usage analytics
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>
        </CardContent>
      </Card>

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
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">User Roles & Permissions</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Role
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {userRoles.map((role) => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{role.name}</CardTitle>
                <Badge variant="secondary">{role.users} users</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  Permissions:
                </div>
                <div className="flex flex-wrap gap-2">
                  {role.permissions.map((permission, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Users className="w-4 h-4 mr-1" />
                  Manage Users
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              {
                name: "Sarah Johnson",
                email: "sarah.johnson@havenz.com",
                role: "System Administrator",
                lastActive: "2 hours ago",
                status: "online",
              },
              {
                name: "Robert Martinez",
                email: "robert.martinez@havenz.com",
                role: "Department Manager",
                lastActive: "4 hours ago",
                status: "online",
              },
              {
                name: "Jennifer Lee",
                email: "jennifer.lee@havenz.com",
                role: "Department Manager",
                lastActive: "1 day ago",
                status: "offline",
              },
              {
                name: "Michael Torres",
                email: "michael.torres@havenz.com",
                role: "Department Manager",
                lastActive: "3 hours ago",
                status: "online",
              },
            ].map((user, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                        user.status === "online"
                          ? "bg-green-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="text-xs">
                    {user.role}
                  </Badge>
                  <div className="text-xs text-gray-500 mt-1">
                    Active {user.lastActive}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Security Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">
                Encryption Enabled
              </div>
              <div className="text-sm text-gray-600">
                Hardware security active
              </div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Lock className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Encrypted</div>
              <div className="text-sm text-gray-600">AES-256 encryption</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Fingerprint className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <div className="font-medium text-gray-900">Biometric Auth</div>
              <div className="text-sm text-gray-600">Face & fingerprint</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security Policies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {securitySettings.map((setting) => (
              <div
                key={setting.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-gray-900">
                      {setting.name}
                    </span>
                    <Badge className={getLevelColor(setting.level)}>
                      {setting.level}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{setting.description}</p>
                </div>
                <Switch
                  checked={setting.enabled}
                  disabled={setting.level === "critical"}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Authentication Methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Key className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Password</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Traditional username and password
              </p>
              <Badge className="bg-green-100 text-green-800">Required</Badge>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Fingerprint className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Biometric</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Fingerprint and face recognition
              </p>
              <Badge className="bg-green-100 text-green-800">Enabled</Badge>
            </div>

            <div className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Smartphone className="w-5 h-5 text-orange-600" />
                <span className="font-medium">NFC</span>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Near-field communication cards
              </p>
              <Badge className="bg-yellow-100 text-yellow-800">Available</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Email Notifications</div>
              <div className="text-sm text-gray-600">
                Receive notifications via email
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Push Notifications</div>
              <div className="text-sm text-gray-600">
                Mobile push notifications
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">SMS Alerts</div>
              <div className="text-sm text-gray-600">
                Critical alerts via SMS
              </div>
            </div>
            <Switch defaultChecked={false} />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Desktop Notifications</div>
              <div className="text-sm text-gray-600">
                Browser desktop notifications
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Types</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
              className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
            >
              <div>
                <div className="font-medium text-gray-900">
                  {notification.name}
                </div>
                <div className="text-sm text-gray-600">
                  {notification.description}
                </div>
              </div>
              <Switch defaultChecked={notification.enabled} />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Integrations</h3>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{integration.name}</CardTitle>
                <Badge
                  className={getIntegrationStatusColor(integration.status)}
                >
                  {integration.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                {integration.description}
              </p>

              <div className="flex items-center justify-between text-sm mb-4">
                <span className="text-gray-600">Last Sync:</span>
                <span className="font-medium">{integration.lastSync}</span>
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
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              API Base URL
            </label>
            <Input defaultValue="https://api.havenz.com/v1" />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
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
        </CardContent>
      </Card>
    </div>
  );

  const renderBackupData = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            Backup Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Automatic Backups</div>
              <div className="text-sm text-gray-600">
                Schedule automatic system backups
              </div>
            </div>
            <Switch defaultChecked={true} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Backup Frequency
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option>Daily</option>
                <option>Weekly</option>
                <option>Monthly</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Retention Period
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
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
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Export</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
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
                className="p-4 border border-gray-200 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{exportItem.name}</span>
                  <span className="text-sm text-gray-500">
                    {exportItem.size}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {exportItem.description}
                </p>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Export
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">
              Reset System Settings
            </h4>
            <p className="text-sm text-red-700 mb-3">
              This will reset all system settings to default values. This action
              cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Settings
            </Button>
          </div>

          <div className="p-4 border border-red-200 bg-red-50 rounded-lg">
            <h4 className="font-medium text-red-800 mb-2">Clear All Data</h4>
            <p className="text-sm text-red-700 mb-3">
              This will permanently delete all data including documents, users,
              and companies. This action cannot be undone.
            </p>
            <Button
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-100"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">
          Configure your Havenz Hub system settings and preferences
        </p>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
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
      </div>
    </div>
  );
}
