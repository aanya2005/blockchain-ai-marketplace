import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type SupabaseServerClient = SupabaseClient<Database>;

export async function getRequiredSupabaseServerClient(): Promise<SupabaseServerClient> {
  const supabase = await createSupabaseServerClient();

  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}
