// app/page.tsx - Enhanced Main Layout with All New Pages and Features
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";
import {
  Building2,
  Activity,
  FolderOpen,
  Users,
  Shield,
  Upload,
  FileText,
  DollarSign,
  Home,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { bmsApi } from "@/lib/services/bmsApi";
import type {
  Company,
  Department,
  Project,
  Property,
  BmsDevice,
  AccessLog,
  IotMetric,
} from "@/types/bms";
import { LoadingSpinnerCentered } from "@/components/common/LoadingSpinner";
import { useDashboard } from "@/lib/hooks/useDashboard";
import { MetricCards } from "@/features/dashboard/components/MetricCards";

// Import layout component
import { AppLayout } from "@/components/layout/AppLayout";

export default function HavenzHubDashboard() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  // Use dashboard hook for all data fetching
  const {
    companies,
    departments,
    projects,
    properties,
    bmsDevices,
    accessLogs,
    users,
    documents,
    loading,
    error,
    loadDashboardData,
  } = useDashboard();

  // Check authentication on mount
  useEffect(() => {
    const auth = authService.getAuth();

    if (!auth) {
      router.push("/login");
      return;
    }

    // Set auth token and company ID for API calls
    const token = authService.getToken();
    const companyId = authService.getCurrentCompanyId();

    if (token) {
      bmsApi.setToken(token);
    }

    if (companyId) {
      bmsApi.setCompanyId(companyId);
    }

    setIsAuthenticated(true);
    setAuthLoading(false);
  }, [router]);

  // Load all dashboard data from backend
  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loadDashboardData]);

  // Get recent documents sorted by createdAt, limited to 5
  const recentDocuments = [...documents]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Helper to format relative time
  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return "Unknown";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 30) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  const renderGlobalDashboard = () => {
    if (loading) {
      return <LoadingSpinnerCentered text="Loading dashboard..." />;
    }

    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome to Havenz Hub</h1>
          <p className="text-blue-100">
            Your secure operating system for organizational intelligence
          </p>
          <div className="flex items-center gap-2 mt-3">
            <Shield className="w-4 h-4" />
            <span className="text-sm">
              Secured • On-Premise • Blockchain Audited
            </span>
          </div>
        </div>

        {/* Enhanced Key Metrics - NOW INCLUDING ALL CATEGORIES */}
        <MetricCards
          companies={companies}
          departments={departments}
          projects={projects}
          properties={properties}
          users={users}
        />

        {/* Quick Actions - Enhanced */}
        {/* Temporarily hidden
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Virtual Chatbots</h3>
                <p className="text-sm text-gray-600">AI-powered assistance</p>
              </div>
            </div>
            <Button
              className="w-full"
              onClick={() => setActiveSection("virtual-chatbots")}
            >
              Manage Chatbots
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
                <Server className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Data Center</h3>
                <p className="text-sm text-gray-600">{accessLogs.length} access logs</p>
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setActiveSection("secure-datacenter")}
            >
              View Capacity
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">BMS Hardware</h3>
                <p className="text-sm text-gray-600">{bmsDevices.length} devices online</p>
              </div>
            </div>
            <Button
              className="w-full"
              variant="outline"
              onClick={() => setActiveSection("bms-hardware")}
            >
              Shop Hardware
            </Button>
          </CardContent>
        </Card>
      </div>
      */}

        {/* Enhanced Company Overview */}
        <Card className="bg-white border border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Companies Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                  onClick={() => router.push("/companies")}
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {company.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <span>{company.status}</span>
                    </div>
                  </div>
                  <Badge
                    className={`text-xs ${
                      company.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {company.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Recent Uploads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentDocuments.length === 0 ? (
                  <div className="text-center py-4 text-gray-500 text-sm">
                    No documents uploaded yet
                  </div>
                ) : (
                  recentDocuments.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => router.push("/document-control")}
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {doc.name}
                        </div>
                        <div className="text-xs text-gray-600">
                          {doc.category || doc.fileType || "Document"} • {formatRelativeTime(doc.createdAt)}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Companies</span>
                  <Badge className="bg-blue-100 text-blue-800">
                    {companies.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Total Departments
                  </span>
                  <Badge className="bg-purple-100 text-purple-800">
                    {departments.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Active Projects</span>
                  <Badge className="bg-green-100 text-green-800">
                    {projects.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Properties</span>
                  <Badge className="bg-orange-100 text-orange-800">
                    {properties.length}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    BMS Devices Online
                  </span>
                  <Badge className="bg-green-100 text-green-800">
                    {bmsDevices.length}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  };

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render dashboard if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return <AppLayout>{renderGlobalDashboard()}</AppLayout>;
}
