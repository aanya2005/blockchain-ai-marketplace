"use client";

import { useMemo, useState } from "react";
import { getContract, prepareContractCall } from "thirdweb";
import {
  useActiveAccount,
  useActiveWalletChain,
  useSendTransaction,
  useSwitchActiveWalletChain,
} from "thirdweb/react";
import { parseEther } from "viem";

import { DatasetEscrowAbi } from "@/lib/blockchain/abi/DatasetEscrow";
import { DatasetRegistryAbi } from "@/lib/blockchain/abi/DatasetRegistry";
import {
  baseSepoliaChain,
  baseSepoliaChainId,
  createNeuroLedgerThirdwebClient,
  getBlockchainContractAddresses,
} from "@/lib/blockchain/config";
import {
  bigintWeiToDecimalString,
  createEscrowPurchaseId,
  normalizeWalletAddress,
  toDatasetChainId,
} from "@/lib/blockchain/utils";

type BlockchainActionState = {
  status: "idle" | "pending" | "success" | "error";
  error: string | null;
  transactionHash: string | null;
};

const initialState: BlockchainActionState = {
  status: "idle",
  error: null,
  transactionHash: null,
};

export function useBlockchainTransactions() {
  const account = useActiveAccount();
  const activeChain = useActiveWalletChain();
  const switchChain = useSwitchActiveWalletChain();
  const sendTransaction = useSendTransaction({ payModal: false });
  const [state, setState] = useState<BlockchainActionState>(initialState);
  const client = useMemo(() => createNeuroLedgerThirdwebClient(), []);
  const addresses = getBlockchainContractAddresses();

  const registryContract =
    client && addresses.datasetRegistry
      ? getContract({
          client,
          chain: baseSepoliaChain,
          address: addresses.datasetRegistry,
          abi: DatasetRegistryAbi,
        })
      : null;
  const escrowContract =
    client && addresses.datasetEscrow
      ? getContract({
          client,
          chain: baseSepoliaChain,
          address: addresses.datasetEscrow,
          abi: DatasetEscrowAbi,
        })
      : null;

  async function ensureReady() {
    if (!client) {
      throw new Error("Thirdweb client ID is not configured.");
    }

    if (!account) {
      throw new Error("Connect a wallet before sending transactions.");
    }

    if (activeChain?.id !== baseSepoliaChainId) {
      await switchChain(baseSepoliaChain);
    }
  }

  async function registerDatasetOwnership(input: {
    datasetId: string;
    datasetHash: `0x${string}`;
    cid: string;
    metadataUri?: string;
  }) {
    try {
      await ensureReady();
      if (!registryContract || !addresses.datasetRegistry || !account) {
        throw new Error("Dataset registry contract is not configured.");
      }

      setState({ status: "pending", error: null, transactionHash: null });
      const registryDatasetId = toDatasetChainId(input.datasetId);
      const transaction = prepareContractCall({
        contract: registryContract,
        method: "registerDataset",
        params: [
          registryDatasetId,
          input.datasetHash,
          input.cid,
          input.metadataUri ?? `ipfs://${input.cid}`,
        ],
      });
      const result = await sendTransaction.mutateAsync(transaction);

      await persistJson("/api/blockchain/register-dataset", {
        datasetId: input.datasetId,
        walletAddress: account.address,
        transactionHash: result.transactionHash,
        registryDatasetId,
        datasetHash: input.datasetHash,
        registryContractAddress: addresses.datasetRegistry,
        chainId: baseSepoliaChainId,
      });

      setState({
        status: "success",
        error: null,
        transactionHash: result.transactionHash,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Dataset registration failed.",
        transactionHash: null,
      });
    }
  }

  async function fundEscrow(input: {
    datasetId: string;
    sellerId: string;
    sellerWalletAddress: string;
    amountEth: string;
  }) {
    try {
      await ensureReady();
      if (!escrowContract || !addresses.datasetEscrow || !account) {
        throw new Error("Dataset escrow contract is not configured.");
      }

      const sellerWalletAddress = normalizeWalletAddress(input.sellerWalletAddress);
      const buyerWalletAddress = normalizeWalletAddress(account.address);
      if (!sellerWalletAddress) {
        throw new Error("Seller wallet address is invalid.");
      }
      if (!buyerWalletAddress) {
        throw new Error("Connected wallet address is invalid.");
      }

      setState({ status: "pending", error: null, transactionHash: null });
      const datasetChainId = toDatasetChainId(input.datasetId);
      const amountWei = parseEther(input.amountEth);
      const transaction = prepareContractCall({
        contract: escrowContract,
        method: "fundPurchase",
        params: [datasetChainId, sellerWalletAddress],
        value: amountWei,
      });
      const result = await sendTransaction.mutateAsync(transaction);

      await persistJson("/api/blockchain/persist-escrow", {
        datasetId: input.datasetId,
        sellerId: input.sellerId,
        buyerWalletAddress,
        sellerWalletAddress,
        escrowPurchaseId: createEscrowPurchaseId({
          datasetChainId,
          buyerWalletAddress,
          sellerWalletAddress,
          chainId: baseSepoliaChainId,
        }),
        fundTransactionHash: result.transactionHash,
        escrowContractAddress: addresses.datasetEscrow,
        amountWei: bigintWeiToDecimalString(amountWei),
        chainId: baseSepoliaChainId,
      });

      setState({
        status: "success",
        error: null,
        transactionHash: result.transactionHash,
      });
    } catch (error) {
      setState({
        status: "error",
        error: error instanceof Error ? error.message : "Escrow funding failed.",
        transactionHash: null,
      });
    }
  }

  return {
    ...state,
    isConfigured: Boolean(client && addresses.datasetRegistry && addresses.datasetEscrow),
    isPending: state.status === "pending",
    account,
    registerDatasetOwnership,
    fundEscrow,
  };
}

async function persistJson(url: string, body: unknown) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(payload.error?.message ?? "Transaction persistence failed.");
  }
}
