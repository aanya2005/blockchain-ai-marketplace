import type { AppRole } from "@/lib/auth/types";

import type {
  AdminActionType,
  DatasetModerationStatus,
  DatasetUploadStatus,
  DatasetVisibilityStatus,
  Insert,
  Row,
  Update,
} from "./database.types";

describe("database TypeScript types", () => {
  it("supports typed user rows", () => {
    const role: AppRole = "admin";
    const user = {
      id: "user-id",
      email: "admin@example.com",
      display_name: "Admin",
      avatar_url: null,
      bio: null,
      role,
      banned_at: null,
      created_at: "2026-05-25T00:00:00.000Z",
      updated_at: "2026-05-25T00:00:00.000Z",
    } satisfies Row<"users">;

    expect(user.role).toBe("admin");
  });

  it("supports typed dataset inserts and updates", () => {
    const visibility: DatasetVisibilityStatus = "draft";
    const moderation: DatasetModerationStatus = "pending";
    const insert = {
      uploader_id: "user-id",
      title: "Dataset",
      description: "Dataset description long enough for validation.",
      category: "Research",
      file_name: "dataset.csv",
      file_size_bytes: 1024,
      file_mime_type: "text/csv",
      visibility_status: visibility,
      moderation_status: moderation,
    } satisfies Insert<"datasets">;
    const update = {
      cid: "ipfs-cid-placeholder",
      blockchain_hash: null,
      upload_status: "stored" satisfies DatasetUploadStatus,
    } satisfies Update<"datasets">;

    expect(insert.visibility_status).toBe("draft");
    expect(update.cid).toBe("ipfs-cid-placeholder");
    expect(update.upload_status).toBe("stored");
  });

  it("supports admin action enum typing", () => {
    const action: AdminActionType = "dataset_approved";

    expect(action).toBe("dataset_approved");
  });
});
