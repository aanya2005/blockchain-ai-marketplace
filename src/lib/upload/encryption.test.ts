import { decryptDatasetBuffer, encryptDatasetBuffer } from "@/lib/upload/encryption";

describe("dataset encryption", () => {
  const previousSecret = process.env.ENCRYPTION_SECRET;

  beforeEach(() => {
    process.env.ENCRYPTION_SECRET = "test-secret-with-at-least-thirty-two-characters";
  });

  afterEach(() => {
    process.env.ENCRYPTION_SECRET = previousSecret;
  });

  it("encrypts and decrypts dataset bytes", () => {
    const original = Buffer.from("name,score\nAda,98\n");

    const encrypted = encryptDatasetBuffer(original);
    const decrypted = decryptDatasetBuffer(encrypted.encryptedBuffer, encrypted.metadata);

    expect(encrypted.encryptedBuffer.equals(original)).toBe(false);
    expect(decrypted.equals(original)).toBe(true);
    expect(encrypted.metadata.algorithm).toBe("aes-256-gcm");
    expect(encrypted.encryptedChecksumSha256).toMatch(/^[a-f0-9]{64}$/);
  });

  it("requires a strong server-side encryption secret", () => {
    process.env.ENCRYPTION_SECRET = "short";

    expect(() => encryptDatasetBuffer(Buffer.from("dataset"))).toThrow(
      "ENCRYPTION_SECRET must be configured",
    );
  });
});
