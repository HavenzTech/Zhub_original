import { authService } from "@/lib/services/auth";
import type { TourKey, TourStatusMap } from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getApiUrl(): string {
  if (!API_BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_URL is not defined");
  }
  return API_BASE_URL;
}

/** Get common auth headers including company ID */
function getHeaders(): Record<string, string> {
  const token = authService.getToken();
  const companyId = authService.getCurrentCompanyId();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  if (companyId) headers["X-Company-Id"] = companyId;
  return headers;
}

const LOCAL_STORAGE_KEY = "havenz_tour_status";

class TourApiService {
  private useLocalFallback = false;

  /** Fetch tour completion status from API (source of truth) */
  async getStatus(userId: string): Promise<TourStatusMap> {
    if (this.useLocalFallback) return this.getLocalStatus();

    try {
      const res = await fetch(`${getApiUrl()}/api/users/${userId}/tour-status`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const data = await res.json();
      // API wraps response in { tours: { ... } }
      const tours: TourStatusMap = data.tours ?? data;
      // Sync API response to localStorage as cache
      this.setLocalStatusBulk(tours);
      return tours;
    } catch {
      this.useLocalFallback = true;
      return this.getLocalStatus();
    }
  }

  /** Mark a tour as completed */
  async markCompleted(userId: string, tourKey: TourKey): Promise<void> {
    // Always write locally for instant UX
    this.setLocalStatus(tourKey, true);

    if (this.useLocalFallback) return;

    try {
      await fetch(`${getApiUrl()}/api/users/${userId}/tour-status`, {
        method: "PATCH",
        headers: getHeaders(),
        body: JSON.stringify({ tourKey }),
      });
    } catch {
      this.useLocalFallback = true;
    }
  }

  /** Reset all tours for a user (admin use) */
  async resetAll(userId: string): Promise<void> {
    localStorage.removeItem(LOCAL_STORAGE_KEY);

    if (this.useLocalFallback) return;

    try {
      await fetch(`${getApiUrl()}/api/users/${userId}/tour-status`, {
        method: "DELETE",
        headers: getHeaders(),
      });
    } catch {
      this.useLocalFallback = true;
    }
  }

  /** Reset a single tour for a user (admin use) */
  async resetOne(userId: string, tourKey: TourKey): Promise<void> {
    this.setLocalStatus(tourKey, false);

    if (this.useLocalFallback) return;

    try {
      await fetch(`${getApiUrl()}/api/users/${userId}/tour-status?key=${tourKey}`, {
        method: "DELETE",
        headers: getHeaders(),
      });
    } catch {
      this.useLocalFallback = true;
    }
  }

  // --- localStorage helpers (cache only) ---

  private getLocalStatus(): TourStatusMap {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "{}");
    } catch {
      return {};
    }
  }

  private setLocalStatus(key: string, value: boolean): void {
    const current = this.getLocalStatus();
    current[key] = value;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(current));
  }

  private setLocalStatusBulk(data: TourStatusMap): void {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }
}

export const tourApi = new TourApiService();
