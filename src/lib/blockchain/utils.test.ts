import {
  createEscrowPurchaseId,
  createWalletLinkMessage,
  isHexBytes32,
  normalizeWalletAddress,
  toDatasetChainId,
  toDatasetContentHash,
} from "@/lib/blockchain/utils";

describe("blockchain utilities", () => {
  it("creates deterministic dataset chain IDs", () => {
    expect(toDatasetChainId("dataset-id")).toBe(toDatasetChainId("dataset-id"));
    expect(isHexBytes32(toDatasetChainId("dataset-id"))).toBe(true);
  });

  it("uses encrypted checksums as dataset content hashes", () => {
    const checksum = "a".repeat(64);

    expect(
      toDatasetContentHash({
        id: "dataset-id",
        encrypted_checksum_sha256: checksum,
        file_checksum_sha256: null,
      }),
    ).toBe(`0x${checksum}`);
  });

  it("normalizes wallet addresses", () => {
    expect(normalizeWalletAddress("0xABCDEFabcdefABCDEFabcdefABCDEFabcdefabcd")).toBe(
      "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    );
    expect(normalizeWalletAddress("bad")).toBeNull();
  });

  it("creates wallet-link messages and escrow IDs", () => {
    const message = createWalletLinkMessage({
      userId: "user-id",
      address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      chainId: 84532,
      issuedAt: "2026-05-25T00:00:00.000Z",
    });

    expect(message).toContain("NeuroLedger wallet link");
    expect(
      isHexBytes32(
        createEscrowPurchaseId({
          datasetChainId: toDatasetChainId("dataset-id"),
          buyerWalletAddress: "0x1111111111111111111111111111111111111111",
          sellerWalletAddress: "0x2222222222222222222222222222222222222222",
          chainId: 84532,
        }),
      ),
    ).toBe(true);
  });
});
