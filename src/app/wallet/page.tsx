"use client";

import { useState } from "react";
import { Activity, Database, Loader2, RefreshCw, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBox } from "@/components/status-box";
import { connectWallet, getReadContract, getWriteContract } from "@/lib/web3";
import { formatEth, truncateAddress } from "@/lib/utils";

type DatasetLite = {
  id: bigint;
  title: string;
  priceWei: bigint;
  totalSales: bigint;
  active: boolean;
};

type PurchaseLite = {
  id: bigint;
  datasetId: bigint;
  buyer: string;
  seller: string;
  amountWei: bigint;
  status: number;
  createdAt: bigint;
};

const statusLabels = ["None", "Escrowed", "Released", "Refunded"];

export default function WalletPage() {
  const [address, setAddress] = useState("");
  const [datasets, setDatasets] = useState<DatasetLite[]>([]);
  const [purchases, setPurchases] = useState<PurchaseLite[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadWallet() {
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const wallet = await connectWallet();
      setAddress(wallet);
      const contract = await getReadContract();

      const datasetIds: bigint[] = await contract.getSellerDatasets(wallet);
      const datasetItems: DatasetLite[] = [];
      for (const id of datasetIds) {
        const dataset = await contract.datasets(id);
        datasetItems.push({ id: dataset.id, title: dataset.title, priceWei: dataset.priceWei, totalSales: dataset.totalSales, active: dataset.active });
      }
      setDatasets(datasetItems.reverse());

      const purchaseIds: bigint[] = await contract.getBuyerPurchases(wallet);
      const purchaseItems: PurchaseLite[] = [];
      for (const id of purchaseIds) {
        const purchase = await contract.purchases(id);
        purchaseItems.push({
          id: purchase.id,
          datasetId: purchase.datasetId,
          buyer: purchase.buyer,
          seller: purchase.seller,
          amountWei: purchase.amountWei,
          status: Number(purchase.status),
          createdAt: purchase.createdAt,
        });
      }
      setPurchases(purchaseItems.reverse());
    } catch (err: any) {
      setError(err?.message || "Could not load wallet dashboard.");
    } finally {
      setLoading(false);
    }
  }

  async function releasePayment(purchaseId: bigint) {
    setError("");
    setMessage("");
    try {
      const contract = await getWriteContract();
      setMessage("Opening wallet to release escrowed payment...");
      const tx = await contract.releasePayment(purchaseId);
      setMessage(`Release transaction sent: ${tx.hash}`);
      await tx.wait();
      setMessage("Payment released to seller.");
      await loadWallet();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Could not release payment.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-600">Wallet Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Track your on-chain activity.</h1>
        </div>
        <Button onClick={loadWallet} disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />} Load Wallet
        </Button>
      </div>

      {error && <div className="mb-5"><StatusBox type="error">{error}</StatusBox></div>}
      {message && <div className="mb-5"><StatusBox type="info">{message}</StatusBox></div>}

      <div className="grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[1.75rem] bg-slate-950 p-6 text-white shadow-soft">
          <div className="mb-10 flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950"><Wallet className="h-6 w-6" /></div>
            <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-cyan-100">{address ? truncateAddress(address) : "Not connected"}</span>
          </div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Uploaded datasets</p>
          <p className="mt-3 text-5xl font-bold tracking-tight">{datasets.length}</p>
          <div className="mt-8 grid grid-cols-2 gap-3">
            <div className="rounded-3xl bg-white/10 p-4">
              <Database className="mb-3 h-5 w-5 text-cyan-300" />
              <p className="text-2xl font-bold">{datasets.reduce((sum, item) => sum + Number(item.totalSales), 0)}</p>
              <p className="text-sm text-slate-400">Total sales</p>
            </div>
            <div className="rounded-3xl bg-white/10 p-4">
              <Activity className="mb-3 h-5 w-5 text-cyan-300" />
              <p className="text-2xl font-bold">{purchases.length}</p>
              <p className="text-sm text-slate-400">Purchases made</p>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <Card>
            <CardContent>
              <h2 className="mb-4 text-2xl font-bold">Uploaded datasets</h2>
              {datasets.length === 0 ? <p className="text-slate-600">No datasets loaded yet.</p> : (
                <div className="space-y-3">
                  {datasets.map((dataset) => (
                    <div key={dataset.id.toString()} className="flex items-center justify-between rounded-3xl bg-slate-100 p-4">
                      <div>
                        <p className="font-bold">#{dataset.id.toString()} · {dataset.title}</p>
                        <p className="text-sm text-slate-500">{formatEth(dataset.priceWei)} · {dataset.totalSales.toString()} sales · {dataset.active ? "Active" : "Inactive"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <h2 className="mb-4 text-2xl font-bold">Purchases / escrow</h2>
              {purchases.length === 0 ? <p className="text-slate-600">No purchases loaded yet.</p> : (
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div key={purchase.id.toString()} className="rounded-3xl bg-slate-100 p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div>
                          <p className="font-bold">Purchase #{purchase.id.toString()} · Dataset #{purchase.datasetId.toString()}</p>
                          <p className="text-sm text-slate-500">{formatEth(purchase.amountWei)} · {statusLabels[purchase.status] || "Unknown"}</p>
                        </div>
                        {purchase.status === 1 && <Button onClick={() => releasePayment(purchase.id)}>Release Payment</Button>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
