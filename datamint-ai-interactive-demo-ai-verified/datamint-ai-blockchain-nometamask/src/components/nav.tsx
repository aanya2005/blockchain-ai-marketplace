import Link from "next/link";
import { BrainCircuit } from "lucide-react";
import { WalletButton } from "@/components/wallet-button";

const links = [
  { href: "/", label: "Home" },
  { href: "/upload", label: "Upload" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/bounties", label: "Bounties" },
  { href: "/wallet", label: "Wallet" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex items-center gap-3 font-bold text-slate-950">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-cyan-300">
            <BrainCircuit className="h-5 w-5" />
          </span>
          <span className="hidden text-lg sm:inline">DataMint AI</span>
        </Link>
        <nav className="hidden items-center gap-1 rounded-2xl bg-slate-100 p-1 md:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-white hover:text-slate-950">
              {link.label}
            </Link>
          ))}
        </nav>
        <WalletButton />
      </div>
    </header>
  );
}
