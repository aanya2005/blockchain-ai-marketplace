import { retrieveAndDecryptDataset } from "@/lib/upload/retrieval";
import { encryptDatasetBuffer } from "@/lib/upload/encryption";

const validCid = `b${"a".repeat(50)}`;

describe("encrypted dataset retrieval", () => {
  const previousSecret = process.env.ENCRYPTION_SECRET;

  beforeEach(() => {
    process.env.ENCRYPTION_SECRET = "test-secret-with-at-least-thirty-two-characters";
  });

  afterEach(() => {
    process.env.ENCRYPTION_SECRET = previousSecret;
  });

  it("downloads encrypted bytes and decrypts them", async () => {
    const original = Buffer.from("name,score\nAda,98\n");
    const encrypted = encryptDatasetBuffer(original);
    const fetchImplementation = vi.fn(
      async () => new Response(new Uint8Array(encrypted.encryptedBuffer)),
    );

    const decrypted = await retrieveAndDecryptDataset({
      cid: validCid,
      encryptionMetadata: encrypted.metadata,
      fetchImplementation,
    });

    expect(decrypted.equals(original)).toBe(true);
  });
});
