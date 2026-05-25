import { createThirdwebClient, getContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

import { DatasetEscrowAbi } from "@/lib/blockchain/abi/DatasetEscrow";
import { DatasetRegistryAbi } from "@/lib/blockchain/abi/DatasetRegistry";
import {
  baseSepoliaChainId,
  getBlockchainContractAddresses,
  getThirdwebClientId,
  getWalletConnectProjectId,
  isBlockchainConfigured,
  normalizeAddress,
  type BlockchainContractAddresses,
} from "@/lib/blockchain/env";

export const baseSepoliaChain = baseSepolia;
export { baseSepoliaChainId };
export type { BlockchainContractAddresses };
export {
  getBlockchainContractAddresses,
  getThirdwebClientId,
  getWalletConnectProjectId,
  isBlockchainConfigured,
  normalizeAddress,
};

export function createNeuroLedgerThirdwebClient() {
  const clientId = getThirdwebClientId();

  if (!clientId) {
    return null;
  }

  return createThirdwebClient({ clientId });
}

export function getDatasetRegistryContract() {
  const client = createNeuroLedgerThirdwebClient();
  const address = getBlockchainContractAddresses().datasetRegistry;

  if (!client || !address) {
    return null;
  }

  return getContract({
    client,
    chain: baseSepoliaChain,
    address,
    abi: DatasetRegistryAbi,
  });
}

export function getDatasetEscrowContract() {
  const client = createNeuroLedgerThirdwebClient();
  const address = getBlockchainContractAddresses().datasetEscrow;

  if (!client || !address) {
    return null;
  }

  return getContract({
    client,
    chain: baseSepoliaChain,
    address,
    abi: DatasetEscrowAbi,
  });
}
