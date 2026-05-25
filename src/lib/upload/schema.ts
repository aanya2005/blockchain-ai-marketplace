import { z } from "zod";

import { uploadCategories } from "@/lib/upload/constants";
import { sanitizeTags, sanitizeTextInput } from "@/lib/upload/sanitize";

const tagsSchema = z
  .string()
  .trim()
  .max(500, "Tags must be 500 characters or fewer.")
  .transform((value) =>
    sanitizeTags(
      value
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  );

export const datasetUploadFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(140, "Title must be 140 characters or fewer."),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(5000, "Description must be 5000 characters or fewer."),
  category: z.enum(uploadCategories, {
    error: "Choose a supported dataset category.",
  }),
  tags: z.string().trim().max(500, "Tags must be 500 characters or fewer."),
  publishState: z.enum(["draft", "published"], {
    error: "Choose whether to save a draft or submit for publication.",
  }),
});

export const datasetMetadataSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters.")
    .max(140, "Title must be 140 characters or fewer.")
    .transform(sanitizeTextInput),
  description: z
    .string()
    .trim()
    .min(20, "Description must be at least 20 characters.")
    .max(5000, "Description must be 5000 characters or fewer.")
    .transform(sanitizeTextInput),
  category: z.enum(uploadCategories, {
    error: "Choose a supported dataset category.",
  }),
  tags: tagsSchema,
  publishState: z.enum(["draft", "published"], {
    error: "Choose whether to save a draft or submit for publication.",
  }),
});

export type DatasetUploadFormValues = z.infer<typeof datasetUploadFormSchema>;
export type DatasetMetadataInput = z.input<typeof datasetMetadataSchema>;
export type DatasetMetadata = z.output<typeof datasetMetadataSchema>;
