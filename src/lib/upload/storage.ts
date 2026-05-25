import { randomUUID } from "node:crypto";

import { createIpfsUri } from "@/lib/ipfs/cid";
import { createPinataClient, type PinataPinnedFile } from "@/lib/ipfs/pinata";
import { encryptDatasetBuffer, type EncryptionMetadata } from "@/lib/upload/encryption";
import { getFileExtension, sanitizeFilename } from "@/lib/upload/sanitize";

type IpfsStorageClient = {
  pinEncryptedFile: (input: {
    buffer: Buffer;
    filename: string;
    contentType: string;
    metadata: Record<string, string>;
  }) => Promise<PinataPinnedFile>;
  unpin: (cid: string) => Promise<void>;
};

export type StoredUpload = {
  storageProvider: "pinata_ipfs";
  cid: string;
  ipfsUri: string;
  gatewayUrl: string;
  storedFilename: string;
  encryptedBufferSizeBytes: number;
  encryptedChecksumSha256: string;
  encryptionMetadata: EncryptionMetadata;
  storageMetadata: {
    provider: "pinata";
    cid: string;
    ipfsUri: string;
    gatewayUrl: string;
    pinSizeBytes: number;
    pinTimestamp: string;
    isDuplicate: boolean;
    originalSafeFilename: string;
    storedFilename: string;
  };
};

export type UploadStorage = {
  save: (input: {
    uploaderId: string;
    safeFilename: string;
    mimeType: string;
    buffer: Buffer;
  }) => Promise<StoredUpload>;
  rollback: (cid: string) => Promise<void>;
};

export function createEncryptedIpfsUploadStorage(
  pinata: IpfsStorageClient = createPinataClient(),
): UploadStorage {
  return {
    async save({ uploaderId, safeFilename, mimeType, buffer }) {
      const extension = getFileExtension(safeFilename);
      const storedFilename = sanitizeFilename(
        `${randomUUID()}${extension ? `.${extension}.enc` : ".enc"}`,
      );
      const encrypted = encryptDatasetBuffer(buffer);
      const pinned = await pinata.pinEncryptedFile({
        buffer: encrypted.encryptedBuffer,
        filename: storedFilename,
        contentType: "application/octet-stream",
        metadata: {
          phase: "ipfs-storage",
          uploaderId,
          sourceMimeType: mimeType,
          originalSafeFilename: safeFilename,
          encrypted: "true",
        },
      });

      return createStoredUpload({
        pinned,
        storedFilename,
        originalSafeFilename: safeFilename,
        encryptedBufferSizeBytes: encrypted.encryptedBuffer.byteLength,
        encryptedChecksumSha256: encrypted.encryptedChecksumSha256,
        encryptionMetadata: encrypted.metadata,
      });
    },

    async rollback(cid) {
      await pinata.unpin(cid);
    },
  };
}

function createStoredUpload(input: {
  pinned: PinataPinnedFile;
  storedFilename: string;
  originalSafeFilename: string;
  encryptedBufferSizeBytes: number;
  encryptedChecksumSha256: string;
  encryptionMetadata: EncryptionMetadata;
}): StoredUpload {
  const ipfsUri = createIpfsUri(input.pinned.cid);

  return {
    storageProvider: "pinata_ipfs",
    cid: input.pinned.cid,
    ipfsUri,
    gatewayUrl: input.pinned.gatewayUrl,
    storedFilename: input.storedFilename,
    encryptedBufferSizeBytes: input.encryptedBufferSizeBytes,
    encryptedChecksumSha256: input.encryptedChecksumSha256,
    encryptionMetadata: input.encryptionMetadata,
    storageMetadata: {
      provider: "pinata",
      cid: input.pinned.cid,
      ipfsUri,
      gatewayUrl: input.pinned.gatewayUrl,
      pinSizeBytes: input.pinned.sizeBytes,
      pinTimestamp: input.pinned.timestamp,
      isDuplicate: input.pinned.isDuplicate,
      originalSafeFilename: input.originalSafeFilename,
      storedFilename: input.storedFilename,
    },
  };
}
