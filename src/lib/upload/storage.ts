import { mkdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

import { getFileExtension, sanitizeFilename } from "@/lib/upload/sanitize";

export type StoredUpload = {
  storageProvider: "local-temp";
  storagePath: string;
  storedFilename: string;
};

export type UploadStorage = {
  save: (input: {
    uploaderId: string;
    safeFilename: string;
    buffer: Buffer;
  }) => Promise<StoredUpload>;
};

export function createLocalTempUploadStorage(): UploadStorage {
  return {
    async save({ uploaderId, safeFilename, buffer }) {
      const extension = getFileExtension(safeFilename);
      const storedFilename = `${randomUUID()}${extension ? `.${extension}` : ""}`;
      const uploadDirectory = join(tmpdir(), "neuroledger", "uploads", uploaderId);
      await mkdir(uploadDirectory, { recursive: true, mode: 0o700 });
      const storagePath = join(uploadDirectory, sanitizeFilename(storedFilename));
      await writeFile(storagePath, buffer, { mode: 0o600 });

      return {
        storageProvider: "local-temp",
        storagePath,
        storedFilename,
      };
    },
  };
}
