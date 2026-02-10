"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { bmsApi } from "@/lib/services/bmsApi";
import { authService } from "@/lib/services/auth";
import type { NotificationDto } from "@/types/bms";

const POLL_INTERVAL = 30000; // Poll every 30 seconds

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();
      if (!token) return;

      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      const result = await bmsApi.notifications.getUnreadCount();
      setUnreadCount(result.count || 0);
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const token = authService.getToken();
      const companyId = authService.getCurrentCompanyId();
      if (!token) return;

      if (token) bmsApi.setToken(token);
      if (companyId) bmsApi.setCompanyId(companyId);

      const result = await bmsApi.notifications.getAll({ pageSize: 10 });
      setNotifications(result.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch and polling for unread count
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkAsRead = async (notification: NotificationDto) => {
    if (!notification.id || notification.isRead) return;

    try {
      await bmsApi.notifications.markAsRead(notification.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notification.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await bmsApi.notifications.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const handleNotificationClick = async (notification: NotificationDto) => {
    // Mark as read
    await handleMarkAsRead(notification);

    // Navigate based on reference type
    if (notification.referenceType && notification.referenceId) {
      const routes: Record<string, string> = {
        project: `/projects/${notification.referenceId}`,
        department: `/departments/${notification.referenceId}`,
        property: `/properties/${notification.referenceId}`,
        document: `/document-control`,
        task: `/projects`, // Tasks are usually viewed within projects
        expense: `/projects/${notification.referenceId}`,
        user: `/users`,
      };

      const route = routes[notification.referenceType.toLowerCase()];
      if (route) {
        router.push(route);
        setOpen(false);
      }
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-auto w-auto p-1 text-stone-500 hover:text-stone-300 hover:bg-transparent">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-stone-200 dark:border-stone-700">
          <span className="font-semibold text-sm text-stone-900 dark:text-stone-50">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs text-accent-cyan hover:text-accent-cyan/80 hover:bg-accent-cyan/10"
              onClick={handleMarkAllAsRead}
            >
              <CheckCheck className="w-3 h-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-accent-cyan" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-8 text-center text-sm">
              <Bell className="w-8 h-8 mx-auto mb-2 text-stone-300 dark:text-stone-600" />
              <p className="text-stone-500 dark:text-stone-400">No notifications yet</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 cursor-pointer ${
                  !notification.isRead
                    ? "bg-accent-cyan/5 dark:bg-accent-cyan/10"
                    : ""
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={notification.actorUserPictureUrl || undefined} />
                  <AvatarFallback className="text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-300">
                    {getInitials(notification.actorUserName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm leading-tight text-stone-900 dark:text-stone-50 ${
                      !notification.isRead ? "font-medium" : ""
                    }`}
                  >
                    {notification.title}
                  </p>
                  {notification.body && (
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 line-clamp-2">
                      {notification.body}
                    </p>
                  )}
                  <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
                    {notification.relativeTime || "Just now"}
                  </p>
                </div>
                {!notification.isRead && (
                  <div className="w-2 h-2 bg-accent-cyan rounded-full flex-shrink-0 mt-1.5" />
                )}
              </DropdownMenuItem>
            ))
          )}
        </div>

      </DropdownMenuContent>
    </DropdownMenu>
  );
}
