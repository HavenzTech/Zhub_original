"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyKeys } from "@/lib/query/propertyKeys";
import { STALE_TIMES } from "@/lib/query/staleTimes";
import {
  addStakeholder,
  getStakeholdersByProperty,
  removeStakeholder,
} from "../mock/stakeholders";
import type { PropertyStakeholder, StakeholderRole } from "../types";

export function usePropertyStakeholders(propertyId: string | undefined) {
  const qc = useQueryClient();
  const q = useQuery<PropertyStakeholder[]>({
    queryKey: propertyId ? propertyKeys.stakeholders(propertyId) : ["stk", "none"],
    enabled: !!propertyId,
    staleTime: STALE_TIMES.STANDARD,
    queryFn: async () => (propertyId ? getStakeholdersByProperty(propertyId) : []),
  });

  return {
    ...q,
    add: (input: {
      displayName: string;
      email: string;
      role: StakeholderRole;
    }) => {
      if (!propertyId) return;
      const entry: PropertyStakeholder = {
        id: `stk-${Date.now()}`,
        propertyId,
        userId: `user-${Date.now()}`,
        displayName: input.displayName,
        email: input.email,
        role: input.role,
        addedAt: new Date().toISOString(),
      };
      addStakeholder(entry);
      qc.invalidateQueries({ queryKey: propertyKeys.stakeholders(propertyId) });
    },
    remove: (id: string) => {
      removeStakeholder(id);
      if (propertyId) qc.invalidateQueries({ queryKey: propertyKeys.stakeholders(propertyId) });
    },
  };
}
