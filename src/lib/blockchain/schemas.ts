import { z } from "zod";

import { baseSepoliaChainId } from "@/lib/blockchain/env";

const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Expected an EVM wallet address.")
  .transform((value) => value.toLowerCase() as `0x${string}`);

const txHashSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Expected a transaction hash.")
  .transform((value) => value.toLowerCase() as `0x${string}`);

const bytes32Schema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{64}$/, "Expected bytes32 hex value.")
  .transform((value) => value.toLowerCase() as `0x${string}`);

export const walletLinkSchema = z.object({
  address: addressSchema,
  chainId: z.number().int().positive().default(baseSepoliaChainId),
  message: z.string().min(20).max(1000),
  signature: z.string().regex(/^0x[a-fA-F0-9]+$/),
});

export const datasetRegistrationPersistenceSchema = z.object({
  datasetId: z.string().uuid(),
  walletAddress: addressSchema,
  transactionHash: txHashSchema,
  registryDatasetId: bytes32Schema,
  datasetHash: bytes32Schema,
  registryContractAddress: addressSchema,
  chainId: z.literal(baseSepoliaChainId),
});

export const escrowPersistenceSchema = z.object({
  datasetId: z.string().uuid(),
  sellerId: z.string().uuid(),
  buyerWalletAddress: addressSchema,
  sellerWalletAddress: addressSchema,
  escrowPurchaseId: bytes32Schema,
  fundTransactionHash: txHashSchema,
  escrowContractAddress: addressSchema,
  amountWei: z.string().regex(/^[0-9]+$/),
  chainId: z.literal(baseSepoliaChainId),
});

export const blockchainEventSyncSchema = z.object({
  chainId: z.literal(baseSepoliaChainId),
  contractAddress: addressSchema,
  eventName: z.string().min(1).max(120),
  transactionHash: txHashSchema,
  logIndex: z.number().int().nonnegative(),
  blockNumber: z.number().int().positive(),
  payload: z.record(z.string(), z.unknown()).default({}),
});

export type WalletLinkInput = z.infer<typeof walletLinkSchema>;
export type DatasetRegistrationPersistenceInput = z.infer<
  typeof datasetRegistrationPersistenceSchema
>;
export type EscrowPersistenceInput = z.infer<typeof escrowPersistenceSchema>;
