import type { AppRole } from "@/lib/auth/types";
import type { PublicTableName } from "@/lib/supabase/database.types";

export const requiredTableNames = [
  "users",
  "wallet_links",
  "datasets",
  "purchases",
  "transactions",
  "bounties",
  "submissions",
  "reviews",
  "notifications",
  "reputation_scores",
  "reports",
  "admin_actions",
] as const satisfies readonly PublicTableName[];

export const rlsProtectedTableNames = requiredTableNames;

export const adminOnlyTableNames = [
  "admin_actions",
] as const satisfies readonly PublicTableName[];

export const marketplaceReadableStatuses = {
  moderationStatus: "approved",
  visibilityStatus: "public",
} as const;

export function canModerateDatabaseContent(role: AppRole): boolean {
  return role === "admin" || role === "moderator";
}

export function canAdministerDatabase(role: AppRole): boolean {
  return role === "admin";
}
