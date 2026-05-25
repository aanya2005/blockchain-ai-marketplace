import { createHash } from "node:crypto";

import { NextResponse, type NextRequest } from "next/server";

import { getUploadErrorPayload, UploadError } from "@/lib/upload/errors";
import { datasetMetadataSchema } from "@/lib/upload/schema";
import { createLocalTempUploadStorage } from "@/lib/upload/storage";
import type { DatasetUploadResponse } from "@/lib/upload/types";
import { validateUploadFile } from "@/lib/upload/file-validation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Insert } from "@/lib/supabase/database.types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    if (!supabase) {
      throw new UploadError(
        "CONFIGURATION_ERROR",
        "Supabase is not configured for authenticated uploads.",
        503,
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      throw new UploadError("UNAUTHORIZED", "Sign in before uploading datasets.", 401);
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new UploadError("VALIDATION_ERROR", "Choose a dataset file to upload.");
    }

    const metadata = datasetMetadataSchema.parse({
      title: getRequiredFormValue(formData, "title"),
      description: getRequiredFormValue(formData, "description"),
      category: getRequiredFormValue(formData, "category"),
      tags: getRequiredFormValue(formData, "tags"),
      publishState: getRequiredFormValue(formData, "publishState"),
    });

    const validatedFile = await validateUploadFile(file);
    const checksum = createHash("sha256").update(validatedFile.buffer).digest("hex");

    const { data: duplicateDataset, error: duplicateError } = await supabase
      .from("datasets")
      .select("id")
      .eq("uploader_id", user.id)
      .eq("file_checksum_sha256", checksum)
      .maybeSingle();

    if (duplicateError) {
      throw new UploadError(
        "DATABASE_ERROR",
        "Could not verify duplicate upload status.",
        500,
      );
    }

    if (duplicateDataset) {
      throw new UploadError(
        "DUPLICATE_UPLOAD",
        "This file has already been uploaded by your account.",
        409,
      );
    }

    const storage = createLocalTempUploadStorage();
    await storage.save({
      uploaderId: user.id,
      safeFilename: validatedFile.safeName,
      buffer: validatedFile.buffer,
    });

    const datasetInsert = {
      uploader_id: user.id,
      title: metadata.title,
      description: metadata.description,
      category: metadata.category,
      tags: metadata.tags,
      file_name: validatedFile.safeName,
      file_size_bytes: validatedFile.sizeBytes,
      file_mime_type: validatedFile.mimeType,
      file_checksum_sha256: checksum,
      row_count: validatedFile.preview.rows,
      column_count: validatedFile.preview.columns,
      validation_score: null,
      cid: null,
      blockchain_hash: null,
      visibility_status: metadata.publishState === "draft" ? "draft" : "private",
      moderation_status: "pending",
      published_at: null,
    } satisfies Insert<"datasets">;

    const { data: dataset, error: insertError } = await supabase
      .from("datasets")
      .insert(datasetInsert)
      .select(
        "id,title,description,category,tags,file_name,file_size_bytes,file_mime_type,file_checksum_sha256,row_count,column_count,visibility_status,moderation_status,created_at",
      )
      .single();

    if (insertError || !dataset) {
      throw new UploadError(
        "DATABASE_ERROR",
        "Dataset metadata could not be saved. Please retry the upload.",
        500,
      );
    }

    const response: DatasetUploadResponse = {
      dataset,
      preview: validatedFile.preview,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === "ZodError") {
      const payload = getUploadErrorPayload(
        new UploadError("VALIDATION_ERROR", "Dataset metadata is invalid."),
      );
      return NextResponse.json(payload.body, { status: payload.status });
    }

    const payload = getUploadErrorPayload(error);
    return NextResponse.json(payload.body, { status: payload.status });
  }
}

function getRequiredFormValue(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value : "";
}
