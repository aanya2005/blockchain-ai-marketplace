"use client";

import { useState } from "react";
import { ConnectButton } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";

import { FormMessage } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBlockchainTransactions } from "@/hooks/use-blockchain-transactions";
import { useWalletLink } from "@/hooks/use-wallet-link";
import {
  baseSepoliaChain,
  createNeuroLedgerThirdwebClient,
  getWalletConnectProjectId,
} from "@/lib/blockchain/config";

const wallets = [createWallet("io.metamask"), createWallet("walletConnect")];

export function WalletConnectionPanel() {
  const client = createNeuroLedgerThirdwebClient();
  const walletConnectProjectId = getWalletConnectProjectId();
  const walletLink = useWalletLink();
  const blockchain = useBlockchainTransactions();
  const [registrationForm, setRegistrationForm] = useState({
    datasetId: "",
    datasetHash: "",
    cid: "",
  });
  const [escrowForm, setEscrowForm] = useState({
    datasetId: "",
    sellerId: "",
    sellerWalletAddress: "",
    amountEth: "",
  });

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Wallet connection</CardTitle>
          <CardDescription>
            Connect MetaMask or WalletConnect on Base Sepolia, then verify ownership by
            signing a wallet-link message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {client ? (
            <ConnectButton
              client={client}
              chain={baseSepoliaChain}
              wallets={wallets}
              connectButton={{
                label: "Connect wallet",
              }}
              connectModal={{
                title: "Connect to NeuroLedger",
                size: "compact",
              }}
            />
          ) : (
            <FormMessage
              type="error"
              message="NEXT_PUBLIC_THIRDWEB_CLIENT_ID is required for wallet connections."
            />
          )}

          {!walletConnectProjectId ? (
            <FormMessage
              type="error"
              message="NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not configured; WalletConnect may be unavailable."
            />
          ) : null}

          <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
            <p>
              <span className="font-semibold text-foreground">Wallet:</span>{" "}
              {walletLink.account?.address ?? "Not connected"}
            </p>
            <p className="mt-2">
              <span className="font-semibold text-foreground">Network:</span>{" "}
              {walletLink.activeChain?.name ?? "No active network"}
            </p>
          </div>

          <Button
            type="button"
            disabled={!walletLink.account || walletLink.status === "signing"}
            onClick={() => void walletLink.linkWallet()}
            className="w-full"
          >
            {walletLink.status === "signing" ? "Awaiting signature..." : "Link wallet"}
          </Button>
          <FormMessage message={walletLink.error} type="error" />
          <FormMessage
            message={
              walletLink.status === "linked"
                ? "Wallet verified and linked to your NeuroLedger account."
                : null
            }
            type="success"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>On-chain actions</CardTitle>
          <CardDescription>
            Register uploaded dataset ownership or fund an escrow transaction using
            deployed Base Sepolia contracts. Marketplace purchase UI remains out of scope
            for this milestone.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-2">
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void blockchain.registerDatasetOwnership({
                datasetId: registrationForm.datasetId,
                datasetHash: registrationForm.datasetHash as `0x${string}`,
                cid: registrationForm.cid,
              });
            }}
          >
            <h3 className="font-semibold">Register ownership</h3>
            <div className="space-y-2">
              <Label htmlFor="register-dataset-id">Dataset ID</Label>
              <Input
                id="register-dataset-id"
                value={registrationForm.datasetId}
                onChange={(event) =>
                  setRegistrationForm((current) => ({
                    ...current,
                    datasetId: event.target.value,
                  }))
                }
                placeholder="Supabase dataset UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-dataset-hash">Dataset hash</Label>
              <Input
                id="register-dataset-hash"
                value={registrationForm.datasetHash}
                onChange={(event) =>
                  setRegistrationForm((current) => ({
                    ...current,
                    datasetHash: event.target.value,
                  }))
                }
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="register-cid">IPFS CID</Label>
              <Input
                id="register-cid"
                value={registrationForm.cid}
                onChange={(event) =>
                  setRegistrationForm((current) => ({
                    ...current,
                    cid: event.target.value,
                  }))
                }
                placeholder="bafy..."
              />
            </div>
            <Button
              type="submit"
              disabled={!blockchain.isConfigured || blockchain.isPending}
              className="w-full"
            >
              {blockchain.isPending ? "Transaction pending..." : "Register on-chain"}
            </Button>
          </form>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void blockchain.fundEscrow(escrowForm);
            }}
          >
            <h3 className="font-semibold">Fund escrow</h3>
            <div className="space-y-2">
              <Label htmlFor="escrow-dataset-id">Dataset ID</Label>
              <Input
                id="escrow-dataset-id"
                value={escrowForm.datasetId}
                onChange={(event) =>
                  setEscrowForm((current) => ({
                    ...current,
                    datasetId: event.target.value,
                  }))
                }
                placeholder="Supabase dataset UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escrow-seller-id">Seller user ID</Label>
              <Input
                id="escrow-seller-id"
                value={escrowForm.sellerId}
                onChange={(event) =>
                  setEscrowForm((current) => ({
                    ...current,
                    sellerId: event.target.value,
                  }))
                }
                placeholder="Seller UUID"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escrow-seller-wallet">Seller wallet</Label>
              <Input
                id="escrow-seller-wallet"
                value={escrowForm.sellerWalletAddress}
                onChange={(event) =>
                  setEscrowForm((current) => ({
                    ...current,
                    sellerWalletAddress: event.target.value,
                  }))
                }
                placeholder="0x..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="escrow-amount">Amount ETH</Label>
              <Input
                id="escrow-amount"
                value={escrowForm.amountEth}
                onChange={(event) =>
                  setEscrowForm((current) => ({
                    ...current,
                    amountEth: event.target.value,
                  }))
                }
                placeholder="0.01"
              />
            </div>
            <Button
              type="submit"
              disabled={!blockchain.isConfigured || blockchain.isPending}
              className="w-full"
            >
              {blockchain.isPending ? "Transaction pending..." : "Fund escrow"}
            </Button>
          </form>

          <div className="lg:col-span-2">
            <FormMessage message={blockchain.error} type="error" />
            <FormMessage
              message={
                blockchain.status === "success" && blockchain.transactionHash
                  ? `Transaction confirmed: ${blockchain.transactionHash}`
                  : null
              }
              type="success"
            />
            {!blockchain.isConfigured ? (
              <FormMessage
                type="error"
                message="Contract addresses and Thirdweb client ID are required before blockchain transactions are enabled."
              />
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
