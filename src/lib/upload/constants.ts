export const maxUploadSizeBytes = 50 * 1024 * 1024;
export const maxPreviewBytes = 64 * 1024;
export const maxTextValidationBytes = 2 * 1024 * 1024;

export const supportedUploadExtensions = ["csv", "json", "jsonl", "txt", "zip"] as const;

export type SupportedUploadExtension = (typeof supportedUploadExtensions)[number];

export const uploadCategories = [
  "Computer Vision",
  "Natural Language",
  "Healthcare",
  "Finance",
  "Mobility",
  "Energy",
  "Research",
  "Other",
] as const;

export type UploadCategory = (typeof uploadCategories)[number];

export const executableExtensions = [
  "app",
  "bat",
  "bin",
  "cmd",
  "com",
  "dll",
  "dmg",
  "exe",
  "jar",
  "js",
  "msi",
  "ps1",
  "scr",
  "sh",
  "vbs",
] as const;

export const executableMimeTypes = [
  "application/x-msdownload",
  "application/x-msdos-program",
  "application/x-executable",
  "application/x-sh",
  "application/x-bat",
  "application/x-ms-installer",
  "application/java-archive",
] as const;

export const uploadMimeTypesByExtension: Record<SupportedUploadExtension, string[]> = {
  csv: ["text/csv", "application/csv", "text/plain", "application/vnd.ms-excel"],
  json: ["application/json", "text/json", "text/plain"],
  jsonl: [
    "application/jsonl",
    "application/x-ndjson",
    "application/json",
    "text/plain",
    "application/octet-stream",
  ],
  txt: ["text/plain", "text/markdown", "application/octet-stream"],
  zip: [
    "application/zip",
    "application/x-zip-compressed",
    "multipart/x-zip",
    "application/octet-stream",
  ],
};
