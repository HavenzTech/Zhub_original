import type { PropertyStakeholder } from "../types";
import { FLAGSHIP_PROPERTY_ID } from "./properties";

const seed: PropertyStakeholder[] = [
  { id: "stk-1", propertyId: FLAGSHIP_PROPERTY_ID, userId: "user-ceo-1", displayName: "Alex Morgan", email: "alex.morgan@havenz.com", role: "ceo", addedAt: "2024-01-12T10:00:00Z" },
  { id: "stk-2", propertyId: FLAGSHIP_PROPERTY_ID, userId: "user-fm-1", displayName: "Priya Raman", email: "priya.raman@havenz.com", role: "facility_manager", addedAt: "2024-01-14T10:00:00Z" },
  { id: "stk-3", propertyId: FLAGSHIP_PROPERTY_ID, userId: "user-ops-1", displayName: "Dmitri Volkov", email: "dmitri.volkov@havenz.com", role: "operations_lead", addedAt: "2024-02-01T10:00:00Z" },
  { id: "stk-4", propertyId: FLAGSHIP_PROPERTY_ID, userId: "user-tech-1", displayName: "Rosa Lopez", email: "rosa.lopez@havenz.com", role: "technician", addedAt: "2024-03-10T10:00:00Z" },
  { id: "stk-5", propertyId: FLAGSHIP_PROPERTY_ID, userId: "user-tech-2", displayName: "Kenji Nakamura", email: "kenji.nakamura@havenz.com", role: "technician", addedAt: "2024-03-10T10:00:00Z" },

  { id: "stk-6", propertyId: "prop-meridian-tower", userId: "user-ceo-1", displayName: "Alex Morgan", email: "alex.morgan@havenz.com", role: "ceo", addedAt: "2024-01-20T10:00:00Z" },
  { id: "stk-7", propertyId: "prop-meridian-tower", userId: "user-fm-2", displayName: "Hannah Becker", email: "hannah.becker@havenz.com", role: "facility_manager", addedAt: "2024-01-25T10:00:00Z" },

  { id: "stk-8", propertyId: "prop-northfield-dc", userId: "user-ceo-1", displayName: "Alex Morgan", email: "alex.morgan@havenz.com", role: "ceo", addedAt: "2024-02-01T10:00:00Z" },
  { id: "stk-9", propertyId: "prop-northfield-dc", userId: "user-ops-2", displayName: "Marcus Chen", email: "marcus.chen@havenz.com", role: "operations_lead", addedAt: "2024-02-01T10:00:00Z" },

  { id: "stk-10", propertyId: "prop-glacier-cold", userId: "user-ceo-1", displayName: "Alex Morgan", email: "alex.morgan@havenz.com", role: "ceo", addedAt: "2024-02-15T10:00:00Z" },
  { id: "stk-11", propertyId: "prop-harbor-mixed", userId: "user-ceo-1", displayName: "Alex Morgan", email: "alex.morgan@havenz.com", role: "ceo", addedAt: "2024-03-01T10:00:00Z" },
  { id: "stk-12", propertyId: "prop-cascade-logistics", userId: "user-ceo-1", displayName: "Alex Morgan", email: "alex.morgan@havenz.com", role: "ceo", addedAt: "2024-05-20T10:00:00Z" },
];

const store: PropertyStakeholder[] = [...seed];

export function getStakeholdersByProperty(propertyId: string): PropertyStakeholder[] {
  return store.filter((s) => s.propertyId === propertyId);
}

export function getStakeholdersByUser(userId: string): PropertyStakeholder[] {
  return store.filter((s) => s.userId === userId);
}

export function addStakeholder(s: PropertyStakeholder): void {
  store.push(s);
}

export function removeStakeholder(id: string): void {
  const idx = store.findIndex((s) => s.id === id);
  if (idx >= 0) store.splice(idx, 1);
}

export function allStakeholders(): PropertyStakeholder[] {
  return store;
}

export const DEMO_USER_ID = "user-ceo-1";
