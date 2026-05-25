import type { User } from "@supabase/supabase-js";

import { DEFAULT_APP_ROLE, type AppRole, type AuthIdentity, isAppRole } from "./types";

function readMetadataValue(
  metadata: Record<string, unknown> | undefined,
  key: string,
): unknown {
  return metadata && Object.prototype.hasOwnProperty.call(metadata, key)
    ? metadata[key]
    : undefined;
}

export function getRoleFromUser(user: User | null): AppRole {
  if (!user) {
    return DEFAULT_APP_ROLE;
  }

  const appRole = readMetadataValue(user.app_metadata, "role");
  if (isAppRole(appRole)) {
    return appRole;
  }

  const legacyRole = readMetadataValue(user.user_metadata, "role");
  if (isAppRole(legacyRole)) {
    return legacyRole;
  }

  return DEFAULT_APP_ROLE;
}

export function getDisplayNameFromUser(user: User | null): string {
  if (!user) {
    return "Guest";
  }

  const fullName = readMetadataValue(user.user_metadata, "full_name");
  if (typeof fullName === "string" && fullName.trim().length > 0) {
    return fullName.trim();
  }

  return user.email?.split("@")[0] ?? "NeuroLedger user";
}

export function createAuthIdentity(user: User): AuthIdentity {
  return {
    id: user.id,
    email: user.email ?? "",
    displayName: getDisplayNameFromUser(user),
    role: getRoleFromUser(user),
    walletLinks: [],
  };
}
