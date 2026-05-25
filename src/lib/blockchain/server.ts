import { createPublicClient, defineChain, http, type TransactionReceipt } from "viem";

import { BlockchainError } from "@/lib/blockchain/errors";

export function getBaseSepoliaRpcUrl(): string {
  const rpcUrl = process.env.BASE_SEPOLIA_RPC_URL?.trim();

  if (!rpcUrl) {
    throw new BlockchainError(
      "CONFIGURATION_ERROR",
      "BASE_SEPOLIA_RPC_URL must be configured for server-side transaction verification.",
      503,
    );
  }

  return rpcUrl;
}

export function createBaseSepoliaPublicClient() {
  return createPublicClient({
    chain: defineChain({
      id: 84532,
      name: "Base Sepolia",
      nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
      rpcUrls: {
        default: {
          http: [getBaseSepoliaRpcUrl()],
        },
      },
    }),
    transport: http(getBaseSepoliaRpcUrl()),
  });
}

export async function verifyBaseSepoliaTransaction(input: {
  transactionHash: `0x${string}`;
  expectedFrom?: `0x${string}`;
  expectedTo?: `0x${string}`;
}): Promise<TransactionReceipt> {
  const receipt = await createBaseSepoliaPublicClient().getTransactionReceipt({
    hash: input.transactionHash,
  });

  if (receipt.status !== "success") {
    throw new BlockchainError(
      "TRANSACTION_VERIFICATION_FAILED",
      "The blockchain transaction did not succeed.",
      422,
    );
  }

  if (
    input.expectedFrom &&
    receipt.from.toLowerCase() !== input.expectedFrom.toLowerCase()
  ) {
    throw new BlockchainError(
      "TRANSACTION_VERIFICATION_FAILED",
      "The transaction sender does not match the connected wallet.",
      422,
    );
  }

  if (input.expectedTo && receipt.to?.toLowerCase() !== input.expectedTo.toLowerCase()) {
    throw new BlockchainError(
      "TRANSACTION_VERIFICATION_FAILED",
      "The transaction target contract does not match NeuroLedger configuration.",
      422,
    );
  }

  return receipt;
}
