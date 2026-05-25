export const baseSepoliaChainId = 84532;

export type BlockchainContractAddresses = {
  datasetRegistry: `0x${string}` | null;
  datasetEscrow: `0x${string}` | null;
};

export function getThirdwebClientId(): string | null {
  return process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID?.trim() || null;
}

export function getWalletConnectProjectId(): string | null {
  return process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID?.trim() || null;
}

export function getBlockchainContractAddresses(): BlockchainContractAddresses {
  return {
    datasetRegistry: normalizeAddress(process.env.NEXT_PUBLIC_DATASET_REGISTRY_ADDRESS),
    datasetEscrow: normalizeAddress(process.env.NEXT_PUBLIC_DATASET_ESCROW_ADDRESS),
  };
}

export function normalizeAddress(value: string | undefined): `0x${string}` | null {
  if (!value || !/^0x[a-fA-F0-9]{40}$/.test(value)) {
    return null;
  }

  return value as `0x${string}`;
}

export function isBlockchainConfigured() {
  const clientId = getThirdwebClientId();
  const addresses = getBlockchainContractAddresses();

  return Boolean(clientId && addresses.datasetRegistry && addresses.datasetEscrow);
}
