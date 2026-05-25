import Link from "next/link";

import { CidDisplay } from "@/components/marketplace/cid-display";
import { StatusBadge } from "@/components/marketplace/status-badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  formatCompactNumber,
  formatDatasetPrice,
  formatDate,
} from "@/lib/marketplace/format";
import type { MarketplaceDataset } from "@/lib/marketplace/types";

type DatasetCardProps = {
  dataset: MarketplaceDataset;
};

export function DatasetCard({ dataset }: DatasetCardProps) {
  return (
    <Link href={`/marketplace/${dataset.id}`} className="group block h-full">
      <Card className="flex h-full flex-col overflow-hidden transition-transform duration-200 hover:-translate-y-1 hover:border-primary/50">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary">
                {dataset.category}
              </p>
              <CardTitle className="mt-2 line-clamp-2 group-hover:text-primary">
                {dataset.title}
              </CardTitle>
            </div>
            <div className="rounded-2xl border border-primary/30 bg-primary/10 px-3 py-2 text-right text-sm font-bold text-primary">
              {formatDatasetPrice(dataset.price, dataset.currency)}
            </div>
          </div>
          <CardDescription className="line-clamp-3">
            {dataset.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-auto space-y-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge variant="approved">Approved</StatusBadge>
            {dataset.cid ? <StatusBadge variant="ipfs">IPFS</StatusBadge> : null}
            {dataset.blockchain_hash ? (
              <StatusBadge variant="chain">On-chain</StatusBadge>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {dataset.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-secondary/40 px-3 py-1 text-xs text-muted-foreground"
              >
                #{tag}
              </span>
            ))}
          </div>
          <div className="grid gap-2 text-sm text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>Uploader</span>
              <span className="font-medium text-foreground">
                {dataset.uploader?.display_name ?? "Verified contributor"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Rating</span>
              <span className="font-medium text-foreground">
                {dataset.reputation?.average_rating?.toFixed(1) ?? "New"} ·{" "}
                {formatCompactNumber(dataset.purchaseCount)} sales
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>CID</span>
              <CidDisplay cid={dataset.cid} />
            </div>
            <div className="flex items-center justify-between">
              <span>Published</span>
              <span>{formatDate(dataset.created_at)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
