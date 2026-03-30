/**
 * Stale time tiers for React Query caching.
 * Different data changes at different rates.
 */
export const STALE_TIMES = {
  /** 10 min — companies, document types, folder templates, retention policies, workflows */
  STATIC: 10 * 60 * 1000,
  /** 2 min — projects, departments, properties, users, documents, BMS devices */
  STANDARD: 2 * 60 * 1000,
  /** 30 sec — tasks, workflow tasks, notifications, access logs */
  DYNAMIC: 30 * 1000,
} as const
