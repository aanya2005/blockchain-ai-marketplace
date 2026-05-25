import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  adminOnlyTableNames,
  canAdministerDatabase,
  canModerateDatabaseContent,
  requiredTableNames,
  rlsProtectedTableNames,
} from "./schema";

const migrationSql = readFileSync(
  join(process.cwd(), "supabase/migrations/20260525011000_create_core_schema.sql"),
  "utf8",
);
const ipfsMigrationSql = readFileSync(
  join(process.cwd(), "supabase/migrations/20260525014500_add_ipfs_storage_metadata.sql"),
  "utf8",
);
const blockchainMigrationSql = readFileSync(
  join(
    process.cwd(),
    "supabase/migrations/20260525015900_add_blockchain_ownership_escrow.sql",
  ),
  "utf8",
);

describe("database schema architecture", () => {
  it("tracks all required Phase 3 tables", () => {
    expect(requiredTableNames).toEqual([
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
    ]);
  });

  it("enables RLS for every required table", () => {
    for (const tableName of rlsProtectedTableNames) {
      expect(migrationSql).toContain(
        `alter table public.${tableName} enable row level security;`,
      );
    }
  });

  it("creates each required table in the migration", () => {
    for (const tableName of requiredTableNames) {
      expect(migrationSql).toContain(`create table public.${tableName}`);
    }
  });

  it("defines duplicate purchase and wallet protection indexes", () => {
    expect(migrationSql).toContain("purchases_unique_active_idx");
    expect(migrationSql).toContain("wallet_links_one_primary_per_user_idx");
  });

  it("tracks encrypted IPFS storage metadata on datasets", () => {
    expect(ipfsMigrationSql).toContain("dataset_upload_status");
    expect(ipfsMigrationSql).toContain("storage_metadata jsonb");
    expect(ipfsMigrationSql).toContain("encryption_metadata jsonb");
    expect(ipfsMigrationSql).toContain("datasets_stored_requires_cid");
  });

  it("tracks blockchain ownership and escrow persistence tables", () => {
    expect(blockchainMigrationSql).toContain("create table public.dataset_ownerships");
    expect(blockchainMigrationSql).toContain("create table public.escrow_states");
    expect(blockchainMigrationSql).toContain("create table public.blockchain_events");
    expect(blockchainMigrationSql).toContain(
      "Users can insert own blockchain transactions",
    );
  });

  it("keeps admin-only table metadata explicit", () => {
    expect(adminOnlyTableNames).toEqual(["admin_actions"]);
    expect(canAdministerDatabase("admin")).toBe(true);
    expect(canAdministerDatabase("moderator")).toBe(false);
    expect(canModerateDatabaseContent("moderator")).toBe(true);
    expect(canModerateDatabaseContent("user")).toBe(false);
  });
});
