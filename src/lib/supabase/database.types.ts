import type { AppRole } from "@/lib/auth/types";

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          role: AppRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          role?: AppRole;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          display_name?: string | null;
          role?: AppRole;
          updated_at?: string;
        };
      };
      wallet_links: {
        Row: {
          id: string;
          user_id: string;
          wallet_address: string;
          chain_id: number;
          is_primary: boolean;
          verified_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          wallet_address: string;
          chain_id: number;
          is_primary?: boolean;
          verified_at?: string | null;
          created_at?: string;
        };
        Update: {
          wallet_address?: string;
          chain_id?: number;
          is_primary?: boolean;
          verified_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: AppRole;
    };
    CompositeTypes: Record<string, never>;
  };
};
