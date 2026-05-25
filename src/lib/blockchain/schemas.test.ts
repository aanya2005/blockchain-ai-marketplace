import {
  datasetRegistrationPersistenceSchema,
  escrowPersistenceSchema,
  walletLinkSchema,
} from "@/lib/blockchain/schemas";

const txHash = `0x${"a".repeat(64)}`;
const bytes32 = `0x${"b".repeat(64)}`;
const address = "0x1111111111111111111111111111111111111111";

describe("blockchain schemas", () => {
  it("validates wallet link payloads", () => {
    const result = walletLinkSchema.safeParse({
      address,
      chainId: 84532,
      message:
        "NeuroLedger wallet link\nUser: user\nWallet: 0x1111111111111111111111111111111111111111\nChain ID: 84532",
      signature: "0xabc123",
    });

    expect(result.success).toBe(true);
  });

  it("validates dataset registration persistence payloads", () => {
    const result = datasetRegistrationPersistenceSchema.safeParse({
      datasetId: "11111111-1111-4111-8111-111111111111",
      walletAddress: address,
      transactionHash: txHash,
      registryDatasetId: bytes32,
      datasetHash: bytes32,
      registryContractAddress: address,
      chainId: 84532,
    });

    expect(result.success).toBe(true);
  });

  it("rejects escrow payloads on the wrong chain", () => {
    const result = escrowPersistenceSchema.safeParse({
      datasetId: "11111111-1111-4111-8111-111111111111",
      sellerId: "22222222-2222-4222-8222-222222222222",
      buyerWalletAddress: address,
      sellerWalletAddress: "0x2222222222222222222222222222222222222222",
      escrowPurchaseId: bytes32,
      fundTransactionHash: txHash,
      escrowContractAddress: address,
      amountWei: "1000000000000000",
      chainId: 1,
    });

    expect(result.success).toBe(false);
  });
});
