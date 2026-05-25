import { encodePacked, keccak256, stringToBytes } from "viem";

import type { Row } from "@/lib/supabase/database.types";

export function toDatasetChainId(datasetId: string): `0x${string}` {
  return keccak256(stringToBytes(`neuroledger:dataset:${datasetId}`));
}

export function toDatasetContentHash(
  dataset: Pick<
    Row<"datasets">,
    "encrypted_checksum_sha256" | "file_checksum_sha256" | "id"
  >,
): `0x${string}` {
  const checksum = dataset.encrypted_checksum_sha256 ?? dataset.file_checksum_sha256;

  if (checksum && /^[a-fA-F0-9]{64}$/.test(checksum)) {
    return `0x${checksum}` as `0x${string}`;
  }

  return keccak256(stringToBytes(`neuroledger:dataset-content:${dataset.id}`));
}

export function isHexBytes32(value: string): value is `0x${string}` {
  return /^0x[a-fA-F0-9]{64}$/.test(value);
}

export function normalizeWalletAddress(value: string): `0x${string}` | null {
  const trimmed = value.trim();

  if (!/^0x[a-fA-F0-9]{40}$/.test(trimmed)) {
    return null;
  }

  return trimmed.toLowerCase() as `0x${string}`;
}

export function createWalletLinkMessage(input: {
  userId: string;
  address: string;
  chainId: number;
  issuedAt?: string;
}) {
  return [
    "NeuroLedger wallet link",
    `User: ${input.userId}`,
    `Wallet: ${input.address.toLowerCase()}`,
    `Chain ID: ${input.chainId}`,
    `Issued At: ${input.issuedAt ?? new Date().toISOString()}`,
  ].join("\n");
}

export function bigintWeiToDecimalString(value: bigint): string {
  return value.toString(10);
}

export function createEscrowPurchaseId(input: {
  datasetChainId: `0x${string}`;
  buyerWalletAddress: `0x${string}`;
  sellerWalletAddress: `0x${string}`;
  chainId: number;
}): `0x${string}` {
  return keccak256(
    encodePacked(
      ["bytes32", "address", "address", "uint256"],
      [
        input.datasetChainId,
        input.buyerWalletAddress,
        input.sellerWalletAddress,
        BigInt(input.chainId),
      ],
    ),
  );
}
