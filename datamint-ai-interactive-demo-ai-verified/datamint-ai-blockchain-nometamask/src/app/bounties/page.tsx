"use client";

import { useEffect, useState } from "react";
import { CalendarClock, Loader2, Plus, Send, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBox } from "@/components/status-box";
import { DEMO_MODE, ethers, getReadContract, getWriteContract } from "@/lib/web3";
import { formatEth, truncateAddress } from "@/lib/utils";

type Bounty = {
  id: bigint;
  creator: string;
  title: string;
  description: string;
  category: string;
  budgetWei: bigint;
  deadline: bigint;
  active: boolean;
  acceptedSubmissionId: bigint;
  createdAt: bigint;
  submissions: bigint[];
};

export default function BountiesPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "Need 5,000 labeled MRI scans", description: "Submit anonymized images with labels and metadata.", category: "Medical", budgetEth: "0.002", days: "30" });
  const [submission, setSubmission] = useState({ bountyId: "", dataCid: "", metadataCid: "", note: "" });

  function setFormField(field: string, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function loadBounties() {
    setError("");
    setLoading(true);
    try {
      const contract = await getReadContract();
      const count: bigint = await contract.bountyCount();
      const items: Bounty[] = [];
      for (let i = 1n; i <= count; i++) {
        const bounty = await contract.bounties(i);
        const submissions: bigint[] = await contract.getBountySubmissions(i);
        items.push({
          id: bounty.id,
          creator: bounty.creator,
          title: bounty.title,
          description: bounty.description,
          category: bounty.category,
          budgetWei: bounty.budgetWei,
          deadline: bounty.deadline,
          active: bounty.active,
          acceptedSubmissionId: bounty.acceptedSubmissionId,
          createdAt: bounty.createdAt,
          submissions,
        });
      }
      setBounties(items.reverse());
    } catch (err: any) {
      setError(err?.message || "Could not load bounties.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBounties();
  }, []);

  async function createBounty() {
    setError("");
    setStatus("");
    try {
      const contract = await getWriteContract();
      const deadline = Math.floor(Date.now() / 1000) + Number(form.days || 30) * 24 * 60 * 60;
      setStatus(DEMO_MODE ? "Demo mode: creating bounty and fake escrow budget..." : "Opening wallet to create bounty and lock budget in escrow...");
      const tx = await contract.createBounty(form.title, form.description, form.category, deadline, { value: ethers.parseEther(form.budgetEth) });
      setStatus(DEMO_MODE ? `Demo bounty saved: ${tx.hash}` : `Bounty transaction sent: ${tx.hash}`);
      await tx.wait();
      setStatus(DEMO_MODE ? "Bounty added to the demo board." : "Bounty created and budget locked on-chain.");
      await loadBounties();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Could not create bounty.");
    }
  }

  async function submitToBounty() {
    setError("");
    setStatus("");
    if (!submission.bountyId || !submission.dataCid) return setError("Bounty ID and Data CID are required.");
    try {
      const contract = await getWriteContract();
      setStatus(DEMO_MODE ? "Demo mode: submitting your dataset CID..." : "Opening wallet to submit your dataset CID...");
      const tx = await contract.submitBounty(submission.bountyId, submission.dataCid, submission.metadataCid, submission.note);
      setStatus(DEMO_MODE ? `Demo submission saved: ${tx.hash}` : `Submission transaction sent: ${tx.hash}`);
      await tx.wait();
      setStatus(DEMO_MODE ? "Submission added to this bounty." : "Submission recorded on-chain.");
      await loadBounties();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Could not submit bounty data.");
    }
  }

  async function acceptFirstSubmission(bounty: Bounty) {
    setError("");
    setStatus("");
    if (!bounty.submissions.length) return setError("This bounty has no submissions yet.");
    try {
      const contract = await getWriteContract();
      const firstSubmission = bounty.submissions[0];
      setStatus(DEMO_MODE ? "Demo mode: accepting submission and marking bounty as paid..." : "Opening wallet to accept submission and release payout...");
      const tx = await contract.acceptBountySubmission(bounty.id, firstSubmission);
      setStatus(DEMO_MODE ? `Demo accept saved: ${tx.hash}` : `Accept transaction sent: ${tx.hash}`);
      await tx.wait();
      setStatus(DEMO_MODE ? "Bounty closed and payout marked released." : "Bounty payout released on-chain.");
      await loadBounties();
    } catch (err: any) {
      setError(err?.reason || err?.message || "Could not accept submission. Only bounty creator/admin can accept.");
    }
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <div className="mb-8">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-cyan-600">Bounty Board</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">Fund requests. Reward useful data.</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold">Create bounty</h2>
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.title} onChange={(event) => setFormField("title", event.target.value)} placeholder="Bounty title" />
              <textarea className="min-h-24 w-full rounded-2xl border border-slate-200 px-4 py-3" value={form.description} onChange={(event) => setFormField("description", event.target.value)} placeholder="Describe the data needed" />
              <div className="grid grid-cols-3 gap-3">
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={form.category} onChange={(event) => setFormField("category", event.target.value)} placeholder="Category" />
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={form.budgetEth} onChange={(event) => setFormField("budgetEth", event.target.value)} placeholder="Budget ETH" />
                <input className="rounded-2xl border border-slate-200 px-4 py-3" value={form.days} onChange={(event) => setFormField("days", event.target.value)} placeholder="Days" />
              </div>
              <Button onClick={createBounty} className="w-full"><Plus className="mr-2 h-4 w-4" /> Create bounty</Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-4">
              <h2 className="text-2xl font-bold">Submit data to bounty</h2>
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={submission.bountyId} onChange={(event) => setSubmission({ ...submission, bountyId: event.target.value })} placeholder="Bounty ID" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={submission.dataCid} onChange={(event) => setSubmission({ ...submission, dataCid: event.target.value })} placeholder="IPFS Data CID" />
              <input className="w-full rounded-2xl border border-slate-200 px-4 py-3" value={submission.metadataCid} onChange={(event) => setSubmission({ ...submission, metadataCid: event.target.value })} placeholder="Optional metadata CID" />
              <textarea className="min-h-20 w-full rounded-2xl border border-slate-200 px-4 py-3" value={submission.note} onChange={(event) => setSubmission({ ...submission, note: event.target.value })} placeholder="Short note" />
              <Button onClick={submitToBounty} className="w-full"><Send className="mr-2 h-4 w-4" /> Submit Data</Button>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold">Active requests</h2>
            <Button variant="outline" onClick={loadBounties}>Refresh</Button>
          </div>
          {error && <div className="mb-4"><StatusBox type="error">{error}</StatusBox></div>}
          {status && <div className="mb-4"><StatusBox type="info">{status}</StatusBox></div>}

          {loading ? (
            <div className="flex items-center gap-2 rounded-[1.5rem] bg-white p-6 shadow-soft"><Loader2 className="h-5 w-5 animate-spin" /> Loading bounties...</div>
          ) : bounties.length === 0 ? (
            <Card><CardContent><p className="text-slate-600">No bounties yet.</p></CardContent></Card>
          ) : (
            <div className="space-y-4">
              {bounties.map((bounty) => (
                <Card key={bounty.id.toString()}>
                  <CardContent>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="mb-2 inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-bold text-cyan-700">#{bounty.id.toString()} · {bounty.category}</div>
                        <h3 className="text-2xl font-bold">{bounty.title}</h3>
                        <p className="mt-2 leading-6 text-slate-600">{bounty.description}</p>
                        <p className="mt-3 text-sm text-slate-500">Creator: {truncateAddress(bounty.creator)}</p>
                      </div>
                      <div className="min-w-48 rounded-3xl bg-slate-950 p-4 text-white">
                        <p className="text-sm text-slate-400">Budget</p>
                        <p className="text-2xl font-bold">{formatEth(bounty.budgetWei)}</p>
                        <p className="mt-3 flex items-center gap-2 text-sm text-slate-300"><CalendarClock className="h-4 w-4" /> {new Date(Number(bounty.deadline) * 1000).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-100 p-4">
                      <span className="font-semibold text-slate-700">{bounty.submissions.length} submissions · {bounty.active ? "Active" : `Closed, accepted #${bounty.acceptedSubmissionId.toString()}`}</span>
                      {bounty.active && <Button onClick={() => acceptFirstSubmission(bounty)}><Trophy className="mr-2 h-4 w-4" /> Accept first submission</Button>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
