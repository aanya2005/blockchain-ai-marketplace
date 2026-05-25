"use client";

import { useEffect, useState } from "react";

import { FormMessage } from "@/components/auth/form-message";
import { CidDisplay } from "@/components/marketplace/cid-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MarketplaceDataset, PurchaseState } from "@/lib/marketplace/types";
import { formatDatasetPrice } from "@/lib/marketplace/format";
import { useBlockchainTransactions } from "@/hooks/use-blockchain-transactions";

type PurchaseModalProps = {
  dataset: MarketplaceDataset;
};

export function PurchaseModal({ dataset }: PurchaseModalProps) {
  const [open, setOpen] = useState(false);
  const [purchaseState, setPurchaseState] = useState<PurchaseState | null>(null);
  const [sellerWalletAddress, setSellerWalletAddress] = useState("");
  const blockchain = useBlockchainTransactions();

  useEffect(() => {
    if (!open) {
      return;
    }

    let active = true;
    void fetch(`/api/marketplace/purchase-state?datasetId=${dataset.id}`)
      .then((response) => response.json())
      .then((state: PurchaseState) => {
        if (active) {
          setPurchaseState(state);
        }
      });

    return () => {
      active = false;
    };
  }, [dataset.id, open]);

  const disabledReason = getDisabledReason(purchaseState, blockchain.isConfigured);

  return (
    <>
      <Button onClick={() => setOpen(true)} className="w-full" size="lg">
        Purchase dataset
      </Button>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4 backdrop-blur">
          <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.25em] text-primary">
                  Escrow purchase
                </p>
                <h2 className="mt-2 text-2xl font-bold">{dataset.title}</h2>
                <p className="mt-2 text-muted-foreground">
                  {formatDatasetPrice(dataset.price, dataset.currency)} ·{" "}
                  <CidDisplay cid={dataset.cid} />
                </p>
              </div>
              <Button variant="ghost" type="button" onClick={() => setOpen(false)}>
                Close
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
                Funds are held by DatasetEscrow on Base Sepolia. Purchase persistence is
                completed only after the transaction receipt is verified server-side.
              </div>
              <div className="space-y-2">
                <label htmlFor="seller-wallet" className="text-sm font-semibold">
                  Seller wallet address
                </label>
                <Input
                  id="seller-wallet"
                  value={sellerWalletAddress}
                  onChange={(event) => setSellerWalletAddress(event.target.value)}
                  placeholder="0x..."
                />
              </div>
              <Button
                className="w-full"
                disabled={Boolean(disabledReason) || blockchain.isPending}
                onClick={() =>
                  void blockchain.fundEscrow({
                    datasetId: dataset.id,
                    sellerId: dataset.uploader_id,
                    sellerWalletAddress,
                    amountEth: String(dataset.price),
                  })
                }
              >
                {blockchain.isPending ? "Confirming transaction..." : "Fund escrow"}
              </Button>
              <FormMessage message={disabledReason} type="error" />
              <FormMessage message={blockchain.error} type="error" />
              <FormMessage
                message={
                  blockchain.status === "success"
                    ? "Escrow transaction confirmed and purchase state persisted."
                    : null
                }
                type="success"
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function getDisabledReason(state: PurchaseState | null, configured: boolean) {
  if (!configured) {
    return "Blockchain contract addresses and Thirdweb client ID are required.";
  }
  if (!state) {
    return "Checking purchase eligibility...";
  }
  if (!state.isAuthenticated) {
    return "Sign in before purchasing datasets.";
  }
  if (state.isOwner) {
    return "Dataset owners cannot purchase their own datasets.";
  }
  if (state.hasPurchased) {
    return "You already purchased or escrowed this dataset.";
  }
  if (!state.hasWalletLinked) {
    return "Link a wallet from your dashboard before purchasing.";
  }
  return null;
}
