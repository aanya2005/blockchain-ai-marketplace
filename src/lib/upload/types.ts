import type { Row } from "@/lib/supabase/database.types";
import type { DatasetPreview } from "@/lib/upload/file-validation";

export type DatasetUploadResponse = {
  dataset: Pick<
    Row<"datasets">,
    | "id"
    | "title"
    | "description"
    | "category"
    | "tags"
    | "file_name"
    | "file_size_bytes"
    | "file_mime_type"
    | "file_checksum_sha256"
    | "row_count"
    | "column_count"
    | "visibility_status"
    | "moderation_status"
    | "created_at"
  >;
  preview: DatasetPreview;
};

export type UploadFailureResponse = {
  error: {
    code: string;
    message: string;
  };
};
