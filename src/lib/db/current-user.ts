import { cache } from "react";

import type { AuthIdentity } from "@/lib/auth/types";
import { getRequiredSupabaseServerClient } from "@/lib/db/client";
import type { Row } from "@/lib/supabase/database.types";

export type CurrentDatabaseUser = Row<"users">;
export type CurrentWalletLink = Row<"wallet_links">;
export type CurrentReputationScore = Row<"reputation_scores">;

export const getCurrentDatabaseUser = cache(
  async (): Promise<CurrentDatabaseUser | null> => {
    const supabase = await getRequiredSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return null;
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data ?? null) as CurrentDatabaseUser | null;
  },
);

export async function requireCurrentDatabaseUser(): Promise<CurrentDatabaseUser> {
  const user = await getCurrentDatabaseUser();

  if (!user) {
    throw new Error("An authenticated database user is required.");
  }

  return user;
}

export const getCurrentWalletLinks = cache(async (): Promise<CurrentWalletLink[]> => {
  const user = await getCurrentDatabaseUser();

  if (!user) {
    return [];
  }

  const supabase = await getRequiredSupabaseServerClient();
  const { data, error } = await supabase
    .from("wallet_links")
    .select("*")
    .eq("user_id", user.id)
    .order("is_primary", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as CurrentWalletLink[];
});

export const getCurrentReputationScore = cache(
  async (): Promise<CurrentReputationScore | null> => {
    const user = await getCurrentDatabaseUser();

    if (!user) {
      return null;
    }

    const supabase = await getRequiredSupabaseServerClient();
    const { data, error } = await supabase
      .from("reputation_scores")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return (data ?? null) as CurrentReputationScore | null;
  },
);

export function createIdentityFromDatabaseUser(user: CurrentDatabaseUser): AuthIdentity {
  return {
    id: user.id,
    email: user.email,
    displayName: user.display_name ?? createAuthIdentityFallbackName(user.email),
    role: user.role,
    walletLinks: [],
  };
}

function createAuthIdentityFallbackName(email: string): string {
  return email.split("@")[0] || "NeuroLedger user";
}
