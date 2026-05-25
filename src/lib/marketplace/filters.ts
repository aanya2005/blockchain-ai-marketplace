import type { MarketplaceFilters, MarketplaceSort } from "@/lib/marketplace/types";

export const marketplaceSorts = [
  "newest",
  "highest_rated",
  "price",
  "popularity",
] as const satisfies MarketplaceSort[];

export function parseMarketplaceFilters(
  searchParams: URLSearchParams,
): MarketplaceFilters {
  return {
    search: sanitizeSearch(searchParams.get("q") ?? ""),
    category: sanitizeSearch(searchParams.get("category") ?? ""),
    tag: sanitizeSearch(searchParams.get("tag") ?? ""),
    sort: parseSort(searchParams.get("sort")),
    page: parsePositiveInt(searchParams.get("page"), 1),
    pageSize: Math.min(parsePositiveInt(searchParams.get("pageSize"), 12), 48),
  };
}

export function sanitizeSearch(value: string): string {
  return value.replace(/[<>]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);
}

function parseSort(value: string | null): MarketplaceSort {
  return marketplaceSorts.includes(value as MarketplaceSort)
    ? (value as MarketplaceSort)
    : "newest";
}

function parsePositiveInt(value: string | null, fallback: number): number {
  const parsed = Number.parseInt(value ?? "", 10);

  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}
