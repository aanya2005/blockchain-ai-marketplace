import Link from "next/link";

import { Button } from "@/components/ui/button";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  searchParams: URLSearchParams;
};

export function PaginationControls({
  page,
  totalPages,
  searchParams,
}: PaginationControlsProps) {
  if (totalPages <= 1) {
    return null;
  }

  function href(nextPage: number) {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(nextPage));
    return `/marketplace?${params.toString()}`;
  }

  return (
    <nav
      className="mt-10 flex items-center justify-center gap-3"
      aria-label="Marketplace pagination"
    >
      <Button asChild variant="outline" disabled={page <= 1}>
        <Link href={href(Math.max(1, page - 1))}>Previous</Link>
      </Button>
      <span className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      <Button asChild variant="outline" disabled={page >= totalPages}>
        <Link href={href(Math.min(totalPages, page + 1))}>Next</Link>
      </Button>
    </nav>
  );
}
