import Link from "next/link";

import { DatasetCard } from "@/components/marketplace/dataset-card";
import { EmptyState } from "@/components/marketplace/empty-state";
import { MarketplaceFilters } from "@/components/marketplace/marketplace-filters";
import { PaginationControls } from "@/components/marketplace/pagination-controls";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { parseMarketplaceFilters } from "@/lib/marketplace/filters";
import { searchMarketplaceDatasets } from "@/lib/marketplace/queries";

export const metadata = {
  title: "Marketplace",
};

type MarketplacePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const resolvedSearchParams = await searchParams;
  const urlSearchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(resolvedSearchParams)) {
    if (typeof value === "string") {
      urlSearchParams.set(key, value);
    }
  }
  const filters = parseMarketplaceFilters(urlSearchParams);
  const result = await searchMarketplaceDatasets(filters);

  return (
    <PageShell
      eyebrow="Dataset marketplace"
      title="Browse verified AI datasets."
      description="Search privacy-aware, encrypted, IPFS-backed datasets with transparent ownership records and escrow-ready purchase flows."
    >
      <div className="space-y-8">
        <MarketplaceFilters categories={result.categories} />
        {result.datasets.length > 0 ? (
          <>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {result.datasets.length} of {result.total} datasets
              </span>
              <span>Sorted by {filters.sort.replace("_", " ")}</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {result.datasets.map((dataset) => (
                <DatasetCard key={dataset.id} dataset={dataset} />
              ))}
            </div>
            <PaginationControls
              page={result.page}
              totalPages={result.totalPages}
              searchParams={urlSearchParams}
            />
          </>
        ) : (
          <EmptyState
            title="No approved datasets found"
            description="Try broadening your filters or upload a dataset for review. Approved public datasets will appear here automatically."
            action={
              <Button asChild>
                <Link href="/upload">Upload dataset</Link>
              </Button>
            }
          />
        )}
      </div>
    </PageShell>
  );
}
