import {
  assertSupportedFileMetadata,
  formatBytes,
} from "@/lib/upload/metadata-validation";

import { validateUploadFile, type UploadFileLike } from "./file-validation";

function createUploadFile(
  content: string | Uint8Array,
  name: string,
  type: string,
): UploadFileLike {
  const buffer =
    typeof content === "string" ? Buffer.from(content) : Buffer.from(content);

  return {
    name,
    type,
    size: buffer.byteLength,
    async arrayBuffer() {
      return buffer.buffer.slice(
        buffer.byteOffset,
        buffer.byteOffset + buffer.byteLength,
      );
    },
  };
}

describe("upload file validation", () => {
  it("accepts valid CSV files and generates row metadata", async () => {
    const file = createUploadFile(
      "name,score\nAda,98\nGrace,95\n",
      "scores.csv",
      "text/csv",
    );

    const result = await validateUploadFile(file);

    expect(result.safeName).toBe("scores.csv");
    expect(result.preview.rows).toBe(2);
    expect(result.preview.columns).toBe(2);
  });

  it("rejects malformed JSON files", async () => {
    const file = createUploadFile("{invalid", "data.json", "application/json");

    await expect(validateUploadFile(file)).rejects.toThrow(
      "JSON datasets must contain valid JSON.",
    );
  });

  it("rejects malformed JSONL rows", async () => {
    const file = createUploadFile('{"ok":true}\nnope\n', "data.jsonl", "text/plain");

    await expect(validateUploadFile(file)).rejects.toThrow("JSONL row 2 is malformed");
  });

  it("rejects executable extensions before reading content", () => {
    expect(() =>
      assertSupportedFileMetadata({
        name: "malware.exe",
        size: 12,
        type: "application/x-msdownload",
      }),
    ).toThrow("Executable files are not allowed.");
  });

  it("validates ZIP headers strictly", async () => {
    const file = createUploadFile("not-a-zip", "archive.zip", "application/zip");

    await expect(validateUploadFile(file)).rejects.toThrow(
      "ZIP uploads must contain a valid ZIP header.",
    );
  });

  it("formats byte sizes for UI feedback", () => {
    expect(formatBytes(1024)).toBe("1.0 KB");
  });
});
