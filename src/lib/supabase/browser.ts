"use client";

import { createBrowserClient } from "@supabase/ssr";

import { getSupabasePublicConfig, requireSupabasePublicConfig } from "@/lib/auth/config";
import type { Database } from "@/lib/supabase/database.types";

export function createSupabaseBrowserClient() {
  const config = requireSupabasePublicConfig();

  return createBrowserClient<Database>(config.url, config.anonKey);
}

export function createOptionalSupabaseBrowserClient() {
  const config = getSupabasePublicConfig();

  if (!config) {
    return null;
  }

  return createBrowserClient<Database>(config.url, config.anonKey);
}
