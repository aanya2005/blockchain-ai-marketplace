import {
  maxTextValidationBytes,
  type SupportedUploadExtension,
} from "@/lib/upload/constants";
import { UploadError } from "@/lib/upload/errors";
import {
  assertSupportedFileMetadata,
  formatBytes,
} from "@/lib/upload/metadata-validation";

export type UploadFileLike = {
  name: string;
  size: number;
  type: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
};

export type DatasetPreview = {
  kind: SupportedUploadExtension;
  text: string;
  rows: number | null;
  columns: number | null;
};

export type ValidatedUploadFile = {
  originalName: string;
  safeName: string;
  extension: SupportedUploadExtension;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  preview: DatasetPreview;
};

export async function validateUploadFile(
  file: UploadFileLike,
): Promise<ValidatedUploadFile> {
  const metadata = assertSupportedFileMetadata(file);
  const buffer = Buffer.from(await file.arrayBuffer());

  if (buffer.byteLength !== file.size) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "The uploaded file size changed in transit.",
    );
  }

  rejectBinaryContent(metadata.extension, buffer);

  const preview = createDatasetPreview(metadata.extension, buffer);

  return {
    originalName: file.name,
    safeName: metadata.safeName,
    extension: metadata.extension,
    mimeType: metadata.mimeType,
    sizeBytes: file.size,
    buffer,
    preview,
  };
}

function rejectBinaryContent(extension: SupportedUploadExtension, buffer: Buffer) {
  if (extension === "zip") {
    if (buffer.byteLength < 4 || buffer[0] !== 0x50 || buffer[1] !== 0x4b) {
      throw new UploadError(
        "VALIDATION_ERROR",
        "ZIP uploads must contain a valid ZIP header.",
      );
    }

    return;
  }

  const sample = buffer.subarray(0, Math.min(buffer.byteLength, 4096));
  if (sample.includes(0)) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "Binary content is not allowed for text datasets.",
    );
  }
}

function createDatasetPreview(
  extension: SupportedUploadExtension,
  buffer: Buffer,
): DatasetPreview {
  if (extension === "zip") {
    return {
      kind: extension,
      text: "ZIP archive accepted. Contents will be processed by future storage validation phases.",
      rows: null,
      columns: null,
    };
  }

  if (buffer.byteLength > maxTextValidationBytes) {
    throw new UploadError(
      "VALIDATION_ERROR",
      `Text datasets must be ${formatBytes(maxTextValidationBytes)} or smaller for local validation in this phase.`,
    );
  }

  const text = buffer.toString("utf8");

  if (!text.trim()) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "Dataset files must contain readable content.",
    );
  }

  if (extension === "json") {
    validateJson(text);
  }

  if (extension === "jsonl") {
    validateJsonl(text);
  }

  const { rows, columns } =
    extension === "csv" ? validateCsv(text) : { rows: countRows(text), columns: null };

  return {
    kind: extension,
    text: buildPreviewText(text),
    rows,
    columns,
  };
}

function validateJson(text: string) {
  try {
    JSON.parse(text);
  } catch {
    throw new UploadError("VALIDATION_ERROR", "JSON datasets must contain valid JSON.");
  }
}

function validateJsonl(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "JSONL datasets must contain at least one row.",
    );
  }

  for (const [index, line] of lines.entries()) {
    try {
      JSON.parse(line);
    } catch {
      throw new UploadError(
        "VALIDATION_ERROR",
        `JSONL row ${index + 1} is malformed. Each row must be valid JSON.`,
      );
    }
  }
}

function validateCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);

  if (lines.length < 2) {
    throw new UploadError(
      "VALIDATION_ERROR",
      "CSV datasets must include a header row and at least one data row.",
    );
  }

  const headerColumnCount = parseCsvLine(lines[0]).length;

  if (headerColumnCount === 0) {
    throw new UploadError("VALIDATION_ERROR", "CSV datasets must include headers.");
  }

  const malformedRowIndex = lines
    .slice(1, Math.min(lines.length, 50))
    .findIndex((line) => parseCsvLine(line).length !== headerColumnCount);

  if (malformedRowIndex >= 0) {
    throw new UploadError(
      "VALIDATION_ERROR",
      `CSV row ${malformedRowIndex + 2} does not match the header column count.`,
    );
  }

  return {
    rows: lines.length - 1,
    columns: headerColumnCount,
  };
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && nextCharacter === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      cells.push(current);
      current = "";
      continue;
    }

    current += character;
  }

  cells.push(current);
  return cells;
}

function countRows(text: string) {
  return text.split(/\r?\n/).filter((line) => line.trim().length > 0).length;
}

function buildPreviewText(text: string) {
  return text.slice(0, 2000).replace(/\r/g, "").split("\n").slice(0, 12).join("\n");
}

export { assertSupportedFileMetadata, formatBytes };
