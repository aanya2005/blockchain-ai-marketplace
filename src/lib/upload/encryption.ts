import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

import { UploadError } from "@/lib/upload/errors";

const algorithm = "aes-256-gcm";
const keyDerivation = "sha256";
const ivLengthBytes = 12;
const authTagLengthBytes = 16;

export type EncryptionMetadata = {
  algorithm: typeof algorithm;
  keyDerivation: typeof keyDerivation;
  iv: string;
  authTag: string;
  encryptedAt: string;
};

export type EncryptedDatasetPayload = {
  encryptedBuffer: Buffer;
  metadata: EncryptionMetadata;
  encryptedChecksumSha256: string;
};

export function encryptDatasetBuffer(buffer: Buffer): EncryptedDatasetPayload {
  try {
    const key = getEncryptionKey();
    const iv = randomBytes(ivLengthBytes);
    const cipher = createCipheriv(algorithm, key, iv, {
      authTagLength: authTagLengthBytes,
    });
    const encryptedBuffer = Buffer.concat([cipher.update(buffer), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return {
      encryptedBuffer,
      metadata: {
        algorithm,
        keyDerivation,
        iv: iv.toString("base64"),
        authTag: authTag.toString("base64"),
        encryptedAt: new Date().toISOString(),
      },
      encryptedChecksumSha256: createSha256Hex(encryptedBuffer),
    };
  } catch (error) {
    if (error instanceof UploadError) {
      throw error;
    }

    throw new UploadError(
      "ENCRYPTION_ERROR",
      "Dataset encryption failed before IPFS upload.",
      500,
    );
  }
}

export function decryptDatasetBuffer(
  encryptedBuffer: Buffer,
  metadata: EncryptionMetadata,
): Buffer {
  if (metadata.algorithm !== algorithm || metadata.keyDerivation !== keyDerivation) {
    throw new UploadError(
      "ENCRYPTION_ERROR",
      "Unsupported dataset encryption metadata.",
      500,
    );
  }

  try {
    const decipher = createDecipheriv(
      algorithm,
      getEncryptionKey(),
      Buffer.from(metadata.iv, "base64"),
      {
        authTagLength: authTagLengthBytes,
      },
    );
    decipher.setAuthTag(Buffer.from(metadata.authTag, "base64"));

    return Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  } catch {
    throw new UploadError(
      "ENCRYPTION_ERROR",
      "Encrypted dataset could not be decrypted.",
      500,
    );
  }
}

export function createSha256Hex(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

function getEncryptionKey(): Buffer {
  const secret = process.env.ENCRYPTION_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new UploadError(
      "CONFIGURATION_ERROR",
      "ENCRYPTION_SECRET must be configured server-side with at least 32 characters.",
      503,
    );
  }

  return createHash(keyDerivation).update(secret).digest();
}
