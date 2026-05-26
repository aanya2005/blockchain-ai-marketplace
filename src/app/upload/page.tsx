"use client";

import { useState } from "react";
import { CheckCircle2, FileUp, Loader2, UploadCloud } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBox } from "@/components/status-box";
import { connectWallet, ethers, getWriteContract } from "@/lib/web3";

async function sha256(file: File) {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return [...new Uint8Array(hashBuffer)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function UploadPage() {
  const [form, setForm] = useState({ title: "", description: "", category: "Computer Vision", tags: "", priceEth: "0.001" });
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState("");

  function updateField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function submitDataset() {
    setError("");
    setMessage("");
    setTxHash("");
    if (!file) return setError("Please choose a dataset file first.");
    if (!form.title || !form.priceEth) return setError("Title and price are required.");

    setLoading(true);
    try {
      const owner = await connectWallet();
      setMessage("Hashing file and uploading to IPFS through Pinata...");
      const fileHash = await sha256(file);

      const body = new FormData();
      body.append("file", file);
      body.append("title", form.title);
      body.append("description", form.description);
      body.append("category", form.category);
      body.append("tags", form.tags);
      body.append("priceEth", form.priceEth);
      body.append("owner", owner);
      body.append("fileHash", fileHash);

      const uploadRes = await fetch("/api/pinata", { method: "POST", body });
      const upload = await uploadRes.json();
      if (!uploadRes.ok) throw new Error(upload.error || "IPFS upload failed.");

      setMessage("IPFS upload complete. Opening wallet for on-chain dataset registration...");
      const contract = await getWriteContract();
      const tx = await contract.listDataset(
        form.title,
        form.description,
        form.category,
        form.tags,
        upload.fileCid,
        upload.metadataCid,
        upload.sizeLabel,
        ethers.parseEther(form.priceEth),
      );
      setTxHash(tx.hash);
      setMessage("Transaction sent. Waiting for confirmation...");
      await tx.wait();
      setMessage("Dataset published on-chain and pinned to IPFS.");
    } catch (err: any) {
      setError(err?.message || "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-600">Upload Dataset</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Pin your data. Register ownership on-chain.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_0.82fr]">
        <Card>
          <CardContent className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Dataset title</span>
              <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" value={form.title} onChange={(event) => updateField("title", event.target.value)} placeholder="Labeled Urban Traffic Images" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Description</span>
              <textarea className="min-h-28 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" value={form.description} onChange={(event) => updateField("description", event.target.value)} placeholder="Explain the dataset, collection method, and useful metadata." />
            </label>
            <div className="grid gap-4 md:grid-cols-3">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Category</span>
                <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" value={form.category} onChange={(event) => updateField("category", event.target.value)}>
                  {["Computer Vision", "Medical", "Speech", "Finance", "Cybersecurity", "Legal"].map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Tags</span>
                <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" value={form.tags} onChange={(event) => updateField("tags", event.target.value)} placeholder="traffic, labels" />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Price in ETH</span>
                <input className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3" value={form.priceEth} onChange={(event) => updateField("priceEth", event.target.value)} placeholder="0.001" />
              </label>
            </div>
            <label className="block cursor-pointer rounded-[1.5rem] border-2 border-dashed border-cyan-200 bg-cyan-50/70 p-8 text-center transition hover:bg-cyan-50">
              <input type="file" className="hidden" onChange={(event) => setFile(event.target.files?.[0] || null)} />
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-3xl bg-cyan-400 text-slate-950"><FileUp className="h-7 w-7" /></div>
              <p className="font-bold text-slate-950">{file ? file.name : "Choose dataset file"}</p>
              <p className="mt-1 text-sm text-slate-500">CSV, ZIP, JSON, image/audio archive, or metadata package</p>
            </label>

            {error && <StatusBox type="error">{error}</StatusBox>}
            {message && <StatusBox type={message.includes("published") ? "success" : "info"}>{message}{txHash && <span className="block break-all pt-1">Tx: {txHash}</span>}</StatusBox>}

            <Button onClick={submitDataset} disabled={loading} className="w-full py-6 text-base">
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <UploadCloud className="mr-2 h-5 w-5" />} Publish Dataset
            </Button>
          </CardContent>
        </Card>

        <div className="rounded-[1.75rem] bg-gradient-to-br from-cyan-400 to-blue-500 p-6 text-slate-950 shadow-soft">
          <h2 className="text-2xl font-bold">What happens</h2>
          <div className="mt-6 space-y-4">
            {["File is uploaded to IPFS through Pinata", "Metadata JSON is pinned with price, tags, and file hash", "Your wallet signs a Base Sepolia transaction", "Smart contract stores ownership, CIDs, price, and audit trail"].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/60 p-4 backdrop-blur"><CheckCircle2 className="mt-0.5 h-5 w-5" /><span className="font-semibold">{item}</span></div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
