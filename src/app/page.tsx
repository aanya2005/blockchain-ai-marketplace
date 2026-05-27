import Link from "next/link";
import { ArrowRight, Coins, Database, ShieldCheck, Store, Upload, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Datasets", value: "On-chain", icon: Database },
  { label: "Wallet login", value: "MetaMask", icon: Users },
  { label: "Escrow", value: "Base", icon: Coins },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 p-7 text-white shadow-soft md:p-12">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-cyan-100 ring-1 ring-white/15">
            <ShieldCheck className="h-4 w-4" /> IPFS storage + smart contract escrow
          </div>
          <h1 className="text-5xl font-bold tracking-tight md:text-7xl">A decentralized marketplace for ethical AI training data.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Upload datasets, earn blockchain rewards, and help builders train better AI models with trnsparent ownership and payouts.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/upload"><Button variant="secondary" className="px-6 py-6 text-base"><Upload className="mr-2 h-5 w-5" /> Upload Dataset</Button></Link>
            <Link href="/marketplace"><Button className="px-6 py-6 text-base"><Store className="mr-2 h-5 w-5" /> Browse Marketplace</Button></Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label}>
              <CardContent>
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300"><Icon className="h-5 w-5" /></div>
                <p className="text-3xl font-bold text-slate-950">{item.value}</p>
                <p className="mt-1 text-sm font-medium text-slate-500">{item.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-6 rounded-[2rem] bg-white/80 p-6 shadow-soft backdrop-blur">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Backend blockchain MVP included</h2>
            <p className="mt-2 text-slate-600">List datasets, create purchases, release/refund escrow, post bounties, submit data, and accept bounty payouts.</p>
          </div>
          <Link className="inline-flex items-center font-bold text-slate-950" href="/bounties">Open bounty board <ArrowRight className="ml-2 h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
