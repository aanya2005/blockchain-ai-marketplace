"use client";

import { useEffect, useMemo, useState } from "react";
import { BrainCircuit, Loader2, Search, ShieldCheck, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBox } from "@/components/status-box";
import { DEMO_MODE, getReadContract, getWriteContract } from "@/lib/web3";
import { formatEth, ipfsToGateway, truncateAddress } from "@/lib/utils";

type Dataset = {
  id: bigint;
  seller: string;
  title: string;
  description: string;
  category: string;
  tags: string;
  dataCid: string;
  metadataCid: string;
  sizeLabel: string;
  priceWei: bigint;
  active: boolean;
  createdAt: bigint;
  totalSales: bigint;
  aiVerified?: boolean;
  aiScore?: number;
  verificationStatus?: string;
};

function demoScoreForDataset(dataset: Pick<Dataset, "title" | "category" | "id">) {
  // Simple deterministic score for demo mode. This is NOT real AI validation.
  const base = 91;
  const titleBonus = dataset.title.length % 5;
  const categoryBonus = dataset.category ? 2 : 0;
  const idBonus = Number(dataset.id % 2n);
  return Math.min(99, base + titleBonus + categoryBonus + idBonus);
}

export default function MarketplacePage() {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  async function loadDatasets() {
    setError("");
    setLoading(true);
    try {
      const contract = await getReadContract();
      const count: bigint = await contract.datasetCount();
      const items: Dataset[] = [];

      for (let i = 1n; i <= count; i++) {
        const dataset = await contract.datasets(i);

        if (dataset.active) {
          const baseDataset: Dataset = {
            id: dataset.id,
            seller: dataset.seller,
            title: dataset.title,
            description: dataset.description,
            category: dataset.category,
            tags: dataset.tags,
            dataCid: dataset.dataCid,
            metadataCid: dataset.metadataCid,
            sizeLabel: dataset.sizeLabel,
            priceWei: dataset.priceWei,
            active: dataset.active,
            createdAt: dataset.createdAt,
            totalSales: dataset.totalSales,
          };

          items.push({
            ...baseDataset,
            aiVerified: DEMO_MODE ? true : Boolean((dataset as any).aiVerified),
            aiScore: DEMO_MODE ? demoScoreForDataset(baseDataset) : Number((dataset as any).aiScore || 0),
            verificationStatus: DEMO_MODE ? "AI Verified" : (dataset as any).verificationStatus || "Not verified",
          });
        }
      }

      setDatasets(items.reverse());
    } catch (err: any) {
      setError(err?.message || "Could not load marketplace. Did you deploy the contract and set the address?");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDatasets();
  }, []);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return datasets.filter((dataset) =>
      [dataset.title, dataset.description, dataset.category, dataset.tags]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [datasets, query]);

  async function buy(dataset: Dataset) {
    setStatus("");
    setError("");
    try {
      const contract = await getWriteContract();
      setStatus(
        DEMO_MODE
          ? `Demo mode: buying ${dataset.title} and creating an escrow record...`
          : `Opening wallet to buy ${dataset.title}...`,
      );
      const tx = await contract.buyDataset(dataset.id, { value: dataset.priceWei });
      setStatus(
        DEMO_MODE
          ? `Demo purchase created: ${tx.hash}`
          : `Purchase transaction sent: ${tx.hash}. Waiting for confirmation...`,
      );
      await tx.wait();
      setStatus(
        DEMO_MODE
          ? "Demo purchase saved. Go to Wallet Dashboard to release payment."
          : "Purchase escrowed. Go to Wallet Dashboard to release payment after delivery or inspection.",
      );
      await loadDatasets();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Purchase failed.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-600">Marketplace</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Browse on-chain datasets.</h1>
          <p className="mt-3 max-w-2xl text-slate-600">
            Demo listings now show simulated AI verification badges so buyers can quickly spot trusted datasets.
          </p>
        </div>
        <Button onClick={loadDatasets} variant="outline">
          Refresh
        </Button>
      </div>

      <div className="mb-6 flex items-center gap-3 rounded-[1.5rem] bg-white px-4 py-3 shadow-soft">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          className="w-full bg-transparent text-slate-700"
          placeholder="Search datasets, tags, or categories"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
      </div>

      <div className="mb-6 rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
        <div className="flex items-start gap-3">
          <BrainCircuit className="mt-0.5 h-5 w-5 text-emerald-700" />
          <div>
            <p className="font-bold text-emerald-900">AI Verified marketplace</p>
            <p className="mt-1 text-sm leading-6 text-emerald-700">
              In demo mode, every uploaded dataset gets a simulated quality score and AI Verified badge.
              This helps show how future validation could improve buyer trust.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-5">
          <StatusBox type="error">{error}</StatusBox>
        </div>
      )}
      {status && (
        <div className="mb-5">
          <StatusBox type="info">{status}</StatusBox>
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-[1.5rem] bg-white p-6 shadow-soft">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading contract data...
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent>
            <p className="text-slate-600">No active datasets yet. Upload the first one.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((dataset, index) => (
            <Card key={dataset.id.toString()} className="overflow-hidden">
              <div
                className={`h-28 bg-gradient-to-br ${
                  index % 3 === 0
                    ? "from-cyan-400 to-blue-500"
                    : index % 3 === 1
                      ? "from-violet-400 to-fuchsia-500"
                      : "from-emerald-400 to-teal-500"
                } p-4`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-white/25 px-3 py-1 text-xs font-bold text-white backdrop-blur">
                    {dataset.category || "Dataset"}
                  </span>

                  {dataset.aiVerified && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-emerald-700">
                      <ShieldCheck className="h-3.5 w-3.5" /> AI Verified
                    </span>
                  )}
                </div>
              </div>

              <CardContent>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{dataset.title}</h2>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-bold">{formatEth(dataset.priceWei)}</span>
                </div>

                {dataset.aiVerified && (
                  <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800">
                        <ShieldCheck className="h-4 w-4" /> {dataset.verificationStatus}
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-emerald-700">
                        Score: {dataset.aiScore}%
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-emerald-700">
                      Simulated checks passed for metadata, privacy risk, duplicate content, and marketplace readiness.
                    </p>
                  </div>
                )}

                <p className="min-h-20 text-sm leading-6 text-slate-600">
                  {dataset.description || "No description provided."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {(dataset.tags || dataset.category)
                    .split(",")
                    .filter(Boolean)
                    .slice(0, 3)
                    .map((tag) => (
                      <span key={tag} className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">
                        {tag.trim()}
                      </span>
                    ))}
                </div>

                <div className="mt-5 flex items-center justify-between text-sm text-slate-500">
                  <span>{dataset.sizeLabel}</span>
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 fill-current text-amber-400" /> Sales: {dataset.totalSales.toString()}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-400">Seller: {truncateAddress(dataset.seller)}</div>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  <a
                    href={ipfsToGateway(dataset.metadataCid)}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-2xl border border-slate-200 px-4 py-3 text-center text-sm font-bold hover:bg-slate-50"
                  >
                    Metadata
                  </a>
                  <Button onClick={() => buy(dataset)}>Buy</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
