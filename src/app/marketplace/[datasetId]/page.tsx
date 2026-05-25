import Link from "next/link";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";

import { CidDisplay } from "@/components/marketplace/cid-display";
import { DatasetCard } from "@/components/marketplace/dataset-card";
import { EmptyState } from "@/components/marketplace/empty-state";
import { PurchaseModal } from "@/components/marketplace/purchase-modal";
import { StatusBadge } from "@/components/marketplace/status-badge";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
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
import { getDatasetDetail } from "@/lib/marketplace/queries";

type DatasetDetailPageProps = {
  params: Promise<{
    datasetId: string;
  }>;
};

export default async function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  const { datasetId } = await params;
  const dataset = await getDatasetDetail(datasetId);

  if (!dataset) {
    notFound();
  }

  return (
    <PageShell
      eyebrow={dataset.category}
      title={dataset.title}
      description={dataset.description}
    >
      <div className="grid gap-8 xl:grid-cols-[1fr_380px]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap gap-2">
                <StatusBadge variant="approved">Approved</StatusBadge>
                {dataset.cid ? (
                  <StatusBadge variant="ipfs">Encrypted IPFS</StatusBadge>
                ) : null}
                {dataset.blockchain_hash ? (
                  <StatusBadge variant="chain">Ownership verified</StatusBadge>
                ) : null}
                <StatusBadge variant="rating">
                  {dataset.reputation?.average_rating?.toFixed(1) ?? "New"} rating
                </StatusBadge>
              </div>
              <CardTitle>Dataset preview</CardTitle>
              <CardDescription>
                Safe metadata preview only. Encrypted content access is controlled after
                purchase.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="max-h-96 overflow-auto rounded-2xl border border-border bg-background/80 p-5 text-sm leading-6 text-muted-foreground">
                {dataset.preview}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Blockchain transaction history</CardTitle>
              <CardDescription>
                Ownership registrations and escrow transactions connected to this dataset.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {dataset.transactions.length > 0 ? (
                <div className="space-y-3">
                  {dataset.transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="rounded-2xl border border-border bg-secondary/30 p-4 text-sm"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <span className="font-semibold">
                          {transaction.transaction_type.replace("_", " ")}
                        </span>
                        <span className="text-muted-foreground">
                          {formatDate(transaction.created_at)}
                        </span>
                      </div>
                      <p className="mt-2 break-all text-muted-foreground">
                        {transaction.tx_hash ?? "Transaction hash pending"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No blockchain transactions yet"
                  description="Ownership and escrow transactions will appear here after on-chain activity is verified."
                />
              )}
            </CardContent>
          </Card>

          {dataset.related.length > 0 ? (
            <div>
              <h2 className="text-2xl font-bold">Related datasets</h2>
              <div className="mt-5 grid gap-6 md:grid-cols-3">
                {dataset.related.map((related) => (
                  <DatasetCard key={related.id} dataset={related} />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{formatDatasetPrice(dataset.price, dataset.currency)}</CardTitle>
              <CardDescription>Escrow-backed dataset access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PurchaseModal dataset={dataset} />
              <Button asChild variant="outline" className="w-full">
                <Link href="/dashboard">Manage wallet</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Metadata</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <Row label="CID" value={<CidDisplay cid={dataset.cid} />} />
              <Row label="File" value={dataset.file_name} />
              <Row label="Size" value={formatCompactNumber(dataset.file_size_bytes)} />
              <Row label="Uploaded" value={formatDate(dataset.created_at)} />
              <Row label="Updated" value={formatDate(dataset.updated_at)} />
              <Row
                label="On-chain"
                value={dataset.registered_on_chain_at ? "Verified" : "Pending"}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contributor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <Row
                label="Uploader"
                value={dataset.uploader?.display_name ?? "Verified contributor"}
              />
              <Row
                label="Reputation"
                value={`${dataset.reputation?.score?.toFixed(0) ?? 0}/100`}
              />
              <Row
                label="Uploads"
                value={formatCompactNumber(dataset.reputation?.completed_uploads)}
              />
              <Row
                label="Sales"
                value={formatCompactNumber(dataset.reputation?.completed_sales)}
              />
            </CardContent>
          </Card>
        </aside>
      </div>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span>{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
