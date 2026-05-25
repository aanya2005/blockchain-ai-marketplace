import { PinataClient } from "./pinata";

const validCid = `b${"a".repeat(50)}`;

describe("PinataClient", () => {
  it("pins encrypted files and returns normalized CID metadata", async () => {
    const fetchImplementation = vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            IpfsHash: validCid,
            PinSize: 128,
            Timestamp: "2026-05-25T00:00:00.000Z",
            isDuplicate: false,
          }),
          { status: 200 },
        ),
    );
    const client = new PinataClient({
      jwt: "pinata-test-jwt",
      fetchImplementation,
      gatewayBaseUrl: "https://gateway.example/ipfs",
    });

    const pinned = await client.pinEncryptedFile({
      buffer: Buffer.from("encrypted"),
      filename: "dataset.csv.enc",
      contentType: "application/octet-stream",
      metadata: { encrypted: "true" },
    });

    expect(pinned.cid).toBe(validCid);
    expect(pinned.gatewayUrl).toBe(`https://gateway.example/ipfs/${validCid}`);
    expect(fetchImplementation).toHaveBeenCalledTimes(1);
  });

  it("retries transient Pinata failures", async () => {
    const fetchImplementation = vi
      .fn()
      .mockResolvedValueOnce(new Response("down", { status: 503 }))
      .mockResolvedValueOnce(
        new Response(JSON.stringify({ IpfsHash: validCid }), { status: 200 }),
      );
    const client = new PinataClient({
      jwt: "pinata-test-jwt",
      fetchImplementation,
      maxAttempts: 2,
    });

    await expect(
      client.pinEncryptedFile({
        buffer: Buffer.from("encrypted"),
        filename: "dataset.csv.enc",
        contentType: "application/octet-stream",
        metadata: {},
      }),
    ).resolves.toMatchObject({ cid: validCid });
    expect(fetchImplementation).toHaveBeenCalledTimes(2);
  });

  it("unpinned CIDs through Pinata rollback endpoint", async () => {
    const fetchImplementation = vi.fn(async () => new Response(null, { status: 200 }));
    const client = new PinataClient({
      jwt: "pinata-test-jwt",
      fetchImplementation,
    });

    await client.unpin(validCid);

    expect(fetchImplementation).toHaveBeenCalledWith(
      `https://api.pinata.cloud/pinning/unpin/${validCid}`,
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});
