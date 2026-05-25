import { PageShell } from "@/components/layout/page-shell";
import { MarketplaceSkeleton } from "@/components/marketplace/marketplace-skeleton";

export default function MarketplaceLoading() {
  return (
    <PageShell
      eyebrow="Dataset marketplace"
      title="Browse verified AI datasets."
      description="Loading marketplace inventory and filters."
    >
      <MarketplaceSkeleton />
    </PageShell>
  );
}
