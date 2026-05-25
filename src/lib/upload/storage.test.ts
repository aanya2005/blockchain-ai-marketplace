import { createEncryptedIpfsUploadStorage } from "@/lib/upload/storage";

const validCid = `b${"a".repeat(50)}`;

describe("encrypted IPFS upload storage", () => {
  const previousSecret = process.env.ENCRYPTION_SECRET;

  beforeEach(() => {
    process.env.ENCRYPTION_SECRET = "test-secret-with-at-least-thirty-two-characters";
  });

  afterEach(() => {
    process.env.ENCRYPTION_SECRET = previousSecret;
  });

  it("encrypts before pinning and returns persisted storage metadata", async () => {
    const original = Buffer.from("name,score\nAda,98\n");
    const pinEncryptedFile = vi.fn(async ({ buffer }: { buffer: Buffer }) => ({
      cid: validCid,
      sizeBytes: buffer.byteLength,
      timestamp: "2026-05-25T00:00:00.000Z",
      isDuplicate: false,
      gatewayUrl: `https://gateway.example/ipfs/${validCid}`,
      pinataResponse: {},
    }));
    const storage = createEncryptedIpfsUploadStorage({
      pinEncryptedFile,
      unpin: vi.fn(),
    });

    const stored = await storage.save({
      uploaderId: "user-id",
      safeFilename: "dataset.csv",
      mimeType: "text/csv",
      buffer: original,
    });

    expect(stored.cid).toBe(validCid);
    expect(stored.storageProvider).toBe("pinata_ipfs");
    expect(stored.storageMetadata.ipfsUri).toBe(`ipfs://${validCid}`);
    expect(stored.encryptionMetadata.authTag).toBeTruthy();
    expect(pinEncryptedFile).toHaveBeenCalledWith(
      expect.objectContaining({
        filename: expect.stringContaining(".enc"),
        contentType: "application/octet-stream",
      }),
    );
    expect(pinEncryptedFile.mock.calls[0][0].buffer.equals(original)).toBe(false);
  });

  it("rolls back pinned CIDs through the storage abstraction", async () => {
    const unpin = vi.fn(async () => undefined);
    const storage = createEncryptedIpfsUploadStorage({
      pinEncryptedFile: vi.fn(),
      unpin,
    });

    await storage.rollback(validCid);

    expect(unpin).toHaveBeenCalledWith(validCid);
  });
});
