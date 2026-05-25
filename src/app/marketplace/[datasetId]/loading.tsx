import { PageShell } from "@/components/layout/page-shell";
import { MarketplaceSkeleton } from "@/components/marketplace/marketplace-skeleton";

export default function DatasetDetailLoading() {
  return (
    <PageShell
      eyebrow="Dataset"
      title="Loading dataset"
      description="Fetching metadata, ownership records, and transaction history."
    >
      <MarketplaceSkeleton />
    </PageShell>
  );
}
