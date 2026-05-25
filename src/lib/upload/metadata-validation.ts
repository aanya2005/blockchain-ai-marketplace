import {
  executableExtensions,
  executableMimeTypes,
  maxUploadSizeBytes,
  supportedUploadExtensions,
  uploadMimeTypesByExtension,
  type SupportedUploadExtension,
} from "@/lib/upload/constants";
import { UploadError } from "@/lib/upload/errors";
import { getFileExtension, sanitizeFilename } from "@/lib/upload/sanitize";

export type UploadFileMetadata = {
  name: string;
  size: number;
  type: string;
};

function isSupportedExtension(value: string): value is SupportedUploadExtension {
  return supportedUploadExtensions.includes(value as SupportedUploadExtension);
}

export function assertSupportedFileMetadata(file: UploadFileMetadata) {
  const safeName = sanitizeFilename(file.name);
  const extension = getFileExtension(safeName);

  if (!safeName.includes(".") || !extension) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "Upload a file with a supported extension: CSV, JSON, JSONL, TXT, or ZIP.",
    );
  }

  if (executableExtensions.includes(extension as (typeof executableExtensions)[number])) {
    throw new UploadError("VALIDATION_ERROR", "Executable files are not allowed.");
  }

  if (!isSupportedExtension(extension)) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "Unsupported file type. Upload CSV, JSON, JSONL, TXT, or ZIP files only.",
    );
  }

  if (file.size <= 0) {
    throw new UploadError("VALIDATION_ERROR", "Upload a non-empty dataset file.");
  }

  if (file.size > maxUploadSizeBytes) {
    throw new UploadError(
      "VALIDATION_ERROR",
      `Dataset files must be ${formatBytes(maxUploadSizeBytes)} or smaller.`,
    );
  }

  const mimeType = file.type || "application/octet-stream";

  if (executableMimeTypes.includes(mimeType as (typeof executableMimeTypes)[number])) {
    throw new UploadError("VALIDATION_ERROR", "Executable file content is not allowed.");
  }

  const allowedMimeTypes = uploadMimeTypesByExtension[extension];
  if (mimeType && !allowedMimeTypes.includes(mimeType)) {
    throw new UploadError(
      "VALIDATION_ERROR",
      `The ${extension.toUpperCase()} file MIME type is not allowed.`,
    );
  }

  return {
    safeName,
    extension,
    mimeType,
  };
}

export function formatBytes(bytes: number) {
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unitIndex = 0;

  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }

  return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}
