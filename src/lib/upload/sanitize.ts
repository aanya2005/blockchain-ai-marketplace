const unsafeFilenameCharacters = /[^a-zA-Z0-9._-]/g;
const repeatedSeparators = /[._-]{2,}/g;

export function sanitizeTextInput(value: string): string {
  return value
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeTags(tags: string[]): string[] {
  const seen = new Set<string>();

  return tags
    .map((tag) => sanitizeTextInput(tag).toLowerCase())
    .filter((tag) => tag.length >= 2 && tag.length <= 32)
    .filter((tag) => {
      if (seen.has(tag)) {
        return false;
      }
      seen.add(tag);
      return true;
    })
    .slice(0, 20);
}

export function sanitizeFilename(filename: string): string {
  const lastSegment = filename.split(/[/\\]/).at(-1) || "dataset";
  const asciiFilename = lastSegment
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "")
    .slice(0, 160);
  const dotIndex = asciiFilename.lastIndexOf(".");
  const rawBaseName = dotIndex > 0 ? asciiFilename.slice(0, dotIndex) : asciiFilename;
  const rawExtension = dotIndex > 0 ? asciiFilename.slice(dotIndex + 1) : "";
  const sanitizedBaseName = rawBaseName
    .replace(unsafeFilenameCharacters, "-")
    .replace(repeatedSeparators, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  const sanitizedExtension = rawExtension
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
    .slice(0, 16);

  const baseName = sanitizedBaseName || "dataset";

  return sanitizedExtension ? `${baseName}.${sanitizedExtension}` : baseName;
}

export function getFileExtension(filename: string): string {
  const sanitized = sanitizeFilename(filename);
  const extension = sanitized.includes(".") ? sanitized.split(".").pop() : "";

  return extension?.toLowerCase() ?? "";
}
