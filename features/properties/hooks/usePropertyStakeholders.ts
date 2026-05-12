"use client";

import { useQuery } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import { getStakeholdersByProperty } from "../mock/stakeholders";
import { isMockMode } from "../mock";
import { bmsApi } from "@/lib/services/bmsApi";
import type { PropertyStakeholder, StakeholderRole } from "../types";
import type { UserResponse } from "@/types/bms";

function roleToStakeholderRole(role: string | null | undefined): StakeholderRole {
  switch (role?.toLowerCase()) {
    case "admin":
    case "super_admin":
      return "facility_manager";
    case "manager":
      return "operations_lead";
    case "technician":
      return "technician";
    default:
      return "viewer";
  }
}

function userToStakeholder(user: UserResponse, propertyId: string): PropertyStakeholder {
  return {
    id: user.id ?? user.userId ?? "",
    propertyId,
    userId: user.id ?? user.userId ?? "",
    displayName: user.name ?? user.email ?? "Unknown",
    email: user.email ?? "",
    role: roleToStakeholderRole(user.role),
    addedAt: user.createdAt ?? new Date().toISOString(),
  };
}

export function usePropertyStakeholders(propertyId: string | undefined) {
  const q = useQuery<PropertyStakeholder[]>({
    queryKey: propertyId ? propertyKeys.stakeholders(propertyId) : ["stk", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.STANDARD,
    queryFn: async () => {
      if (!propertyId) return [];
      if (isMockMode()) return getStakeholdersByProperty(propertyId);

      const res = await bmsApi.users.getAll().catch(() => []);
      const users: UserResponse[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
      return users.map((u) => userToStakeholder(u, propertyId));
    },
  });

  return {
    ...q,
    // These mutations require a backend property_staff table that doesn't exist yet.
    // Kept as no-ops so dependent components compile without change.
    add: (_input: { displayName: string; email: string; role: StakeholderRole }) => {},
    remove: (_id: string) => {},
  };
}
