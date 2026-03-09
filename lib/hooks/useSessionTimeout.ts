"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/lib/services/auth";

// Auto-logout after 60 minutes of inactivity
const SESSION_TIMEOUT_MS = 60 * 60 * 1000;
// Warn user 2 minutes before timeout
const WARNING_BEFORE_MS = 2 * 60 * 1000;

/**
 * Hook that monitors user activity and auto-logs out after inactivity.
 * Tracks mouse, keyboard, scroll, and touch events.
 */
export function useSessionTimeout(onWarning?: () => void) {
  const router = useRouter();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const logout = useCallback(() => {
    authService.logout();
    router.push("/login?reason=timeout");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    // Only set timers if user is authenticated
    if (!authService.getAuth()) return;

    warningRef.current = setTimeout(() => {
      onWarning?.();
    }, SESSION_TIMEOUT_MS - WARNING_BEFORE_MS);

    timeoutRef.current = setTimeout(logout, SESSION_TIMEOUT_MS);
  }, [logout, onWarning]);

  useEffect(() => {
    const events = ["mousedown", "keydown", "scroll", "touchstart", "mousemove"];

    const handleActivity = () => resetTimer();

    events.forEach((event) => window.addEventListener(event, handleActivity, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((event) => window.removeEventListener(event, handleActivity));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [resetTimer]);
}
