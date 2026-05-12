"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import { getStakeholdersByProperty } from "../mock/stakeholders";
import { isMockMode } from "../mock";
import { bmsApi } from "@/lib/services/bmsApi";
import type { PropertyStakeholder, StakeholderRole } from "../types";

function staffDtoToStakeholder(dto: any, propertyId: string): PropertyStakeholder {
  return {
    id: dto.userId ?? dto.id ?? "",
    propertyId,
    userId: dto.userId ?? dto.id ?? "",
    displayName: dto.name ?? dto.email ?? "Unknown",
    email: dto.email ?? "",
    role: dto.role ?? "viewer",
    addedAt: dto.addedAt ?? new Date().toISOString(),
  };
}

export function usePropertyStakeholders(propertyId: string | undefined) {
  const qc = useQueryClient();

  const q = useQuery<PropertyStakeholder[]>({
    queryKey: propertyId ? propertyKeys.stakeholders(propertyId) : ["stk", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.STANDARD,
    queryFn: async () => {
      if (!propertyId) return [];
      if (isMockMode()) return getStakeholdersByProperty(propertyId);

      const res = await bmsApi.properties.getStaff(propertyId).catch(() => []);
      const list: any[] = Array.isArray(res) ? res : (res as any)?.data ?? [];
      return list.map((dto) => staffDtoToStakeholder(dto, propertyId));
    },
  });

  const invalidate = () => {
    if (propertyId) qc.invalidateQueries({ queryKey: propertyKeys.stakeholders(propertyId) });
  };

  return {
    ...q,
    add: async (input: { userId: string; role: StakeholderRole }) => {
      if (!propertyId) return;
      await bmsApi.properties.assignStaff(propertyId, input);
      invalidate();
    },
    updateRole: async (userId: string, role: StakeholderRole) => {
      if (!propertyId) return;
      await bmsApi.properties.updateStaffRole(propertyId, userId, role);
      invalidate();
    },
    remove: async (userId: string) => {
      if (!propertyId) return;
      await bmsApi.properties.removeStaff(propertyId, userId);
      invalidate();
    },
  };
}
