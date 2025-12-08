"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  Bell,
  CheckSquare,
  Plus,
  Eye,
  Calendar,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen,
  Building2,
  FolderOpen,
  Users,
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserProfile } from "@/features/users/components/UserProfile";
import { Sidebar } from "./Sidebar";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

// Mock todos data - in production this would come from API
const recentTodos = [
  {
    id: 1,
    task: "Review Q4 contracts for AHI Red Deer",
    due: "Today",
    priority: "high",
    linkedTo: { type: "company", name: "AHI Red Deer" },
  },
  {
    id: 2,
    task: "Upload insurance documents",
    due: "Tomorrow",
    priority: "medium",
    linkedTo: { type: "property", name: "CHP Facility" },
  },
  {
    id: 3,
    task: "Schedule department meeting",
    due: "This week",
    priority: "low",
    linkedTo: { type: "department", name: "Operations" },
  },
  {
    id: 4,
    task: "Approve budget for Havenz Tech project",
    due: "Friday",
    priority: "high",
    linkedTo: { type: "project", name: "AI Integration" },
  },
  {
    id: 5,
    task: "Configure chatbot for Energy Haven",
    due: "Next week",
    priority: "medium",
    linkedTo: { type: "company", name: "Energy Haven LP" },
  },
];

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [todosPanelCollapsed, setTodosPanelCollapsed] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  // Get page title based on pathname
  const getPageTitle = () => {
    if (pathname === "/") return "Global Dashboard";
    if (pathname === "/companies") return "Companies";
    if (pathname === "/departments") return "Departments";
    if (pathname === "/projects") return "Projects";
    if (pathname === "/properties") return "Properties";
    if (pathname === "/document-control") return "Document Control";
    if (pathname === "/users") return "User Management";
    if (pathname === "/workflows") return "Workflows";
    if (pathname === "/virtual-chatbots") return "Virtual Chatbots";
    if (pathname === "/secure-datacenter") return "Secure Data Center";
    if (pathname === "/bms-hardware") return "BMS Hardware";
    if (pathname === "/z-ai") return "Z AI Assistant";
    if (pathname === "/settings") return "Settings";
    return "Havenz Hub";
  };

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
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {getPageTitle()}
              </h2>

              {/* Breadcrumb indicators */}
              {pathname !== "/" && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ChevronRight className="w-4 h-4" />
                  <span className="capitalize">
                    {pathname.replace("/", "").replace("-", " ")}
                  </span>
                </div>
              )}
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

              <Button variant="ghost" size="icon">
                <Bell className="w-4 h-4" />
              </Button>

              <UserProfile />
            </div>
          </div>

          {/* Page Content */}
          <div className="flex-1 overflow-auto p-6">
            <ErrorBoundary>{children}</ErrorBoundary>
          </div>
        </div>

        {/* Enhanced To-Do Sidebar with Linked Entities */}
        <div
          className={`${
            todosPanelCollapsed ? "w-12" : "w-80"
          } bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}
        >
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className={`${todosPanelCollapsed ? "hidden" : "block"}`}>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckSquare className="w-5 h-5" />
                  To-Dos
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Linked to projects, companies & more
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setTodosPanelCollapsed(!todosPanelCollapsed)}
                className="h-8 w-8 p-0 flex-shrink-0"
              >
                {todosPanelCollapsed ? (
                  <PanelRightOpen className="w-4 h-4" />
                ) : (
                  <PanelRightClose className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div
            className={`flex-1 overflow-auto ${
              todosPanelCollapsed ? "hidden" : "p-4"
            }`}
          >
            <div className="space-y-3">
              {recentTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                      {todo.task}
                    </h4>
                    <Badge
                      variant={
                        todo.priority === "high"
                          ? "destructive"
                          : todo.priority === "medium"
                          ? "default"
                          : "secondary"
                      }
                      className="text-xs ml-2 flex-shrink-0"
                    >
                      {todo.priority}
                    </Badge>
                  </div>

                  {/* Linked Entity Display */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 bg-blue-100 rounded flex items-center justify-center">
                      {todo.linkedTo.type === "company" && (
                        <Building2 className="w-3 h-3 text-blue-600" />
                      )}
                      {todo.linkedTo.type === "project" && (
                        <FolderOpen className="w-3 h-3 text-green-600" />
                      )}
                      {todo.linkedTo.type === "department" && (
                        <Users className="w-3 h-3 text-purple-600" />
                      )}
                      {todo.linkedTo.type === "property" && (
                        <Home className="w-3 h-3 text-orange-600" />
                      )}
                    </div>
                    <span className="text-xs text-gray-600 capitalize">
                      {todo.linkedTo.type}: {todo.linkedTo.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>{todo.due}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            className={`${
              todosPanelCollapsed ? "hidden" : "p-4"
            } border-t border-gray-200`}
          >
            <Button className="w-full" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add New Task
            </Button>
            <Button variant="outline" className="w-full mt-2" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              View All Tasks
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
