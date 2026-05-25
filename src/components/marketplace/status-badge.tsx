import { CheckCircle2, Database, ShieldCheck, Star } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type StatusBadgeProps = {
  variant: "approved" | "ipfs" | "chain" | "rating";
  children: ReactNode;
};

const badgeConfig = {
  approved: {
    icon: ShieldCheck,
    className: "border-primary/40 bg-primary/10 text-primary",
  },
  ipfs: {
    icon: Database,
    className: "border-accent/40 bg-accent/10 text-accent",
  },
  chain: {
    icon: CheckCircle2,
    className: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  },
  rating: {
    icon: Star,
    className: "border-yellow-400/40 bg-yellow-400/10 text-yellow-300",
  },
} as const;

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  const config = badgeConfig[variant];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
        config.className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {children}
    </span>
  );
}
